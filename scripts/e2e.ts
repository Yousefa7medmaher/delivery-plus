import axios from 'axios';

const API_URL = process.env.API_URL || 'http://localhost:3000';

// NOTE (CI tooling fix): this script previously could not get past the second
// or third step against the current API. Every service runs a global
// ValidationPipe with `forbidNonWhitelisted: true`, so extra/misnamed fields
// are rejected with 400 rather than ignored. Concretely, this script now:
//   - drops `restaurantId` from the add-to-cart body (AddCartItemDto only
//     accepts menuItemId + quantity; cart-service resolves the restaurant
//     from the menu item itself).
//   - calls GET /api/menus/restaurants/:id/menu (menu-service's route),
//     not /api/menus/restaurants/:id.
//   - actually settles the payment via POST /payments/:id/process. The old
//     script only ever called POST /payments (which just creates a PENDING
//     payment) and put `simulateFailure` on that call, where it isn't a
//     valid field; the order therefore never reached CONFIRMED.
//   - drives the order through PREPARING before READY_FOR_PICKUP -- the
//     shared ORDER_TRANSITIONS map does not allow CONFIRMED -> READY_FOR_PICKUP
//     directly.
//   - adds the delivery dispatch + driver lifecycle (assign/pickup/start/
//     complete) that the old script stopped short of, using the drive
//     seeded and brought online by scripts/seed.ts.
// Order/payment/delivery status propagation between services here happens
// mostly through direct, synchronous HTTP calls (see payments.service.ts's
// completeSideEffects and deliveries.service.ts), not only through Kafka, so
// this polls with a short timeout instead of trusting a fixed sleep().

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitFor<T>(
  label: string,
  fn: () => Promise<T>,
  isDone: (value: T) => boolean,
  { timeoutMs = 15_000, intervalMs = 500 }: { timeoutMs?: number; intervalMs?: number } = {},
): Promise<T> {
  const deadline = Date.now() + timeoutMs;
  let last: T;
  for (;;) {
    last = await fn();
    if (isDone(last)) return last;
    if (Date.now() > deadline) {
      throw new Error(`Timed out waiting for: ${label} (last value: ${JSON.stringify(last)})`);
    }
    await sleep(intervalMs);
  }
}

async function runE2E() {
  console.log('Starting E2E test...');

  try {
    // We assume scripts/seed.ts has already run: restaurant OPEN with a menu
    // item, and a driver profile registered and AVAILABLE.
    const customerLogin = await axios.post(`${API_URL}/api/auth/login`, {
      email: 'customer@example.com',
      password: 'password123',
    });
    const customerToken = customerLogin.data.accessToken;
    const customerAuth = { headers: { Authorization: `Bearer ${customerToken}` } };

    const ownerLogin = await axios.post(`${API_URL}/api/auth/login`, {
      email: 'owner@example.com',
      password: 'password123',
    });
    const ownerToken = ownerLogin.data.accessToken;
    const ownerAuth = { headers: { Authorization: `Bearer ${ownerToken}` } };

    const driverLogin = await axios.post(`${API_URL}/api/auth/login`, {
      email: 'driver@example.com',
      password: 'password123',
    });
    const driverToken = driverLogin.data.accessToken;
    const driverAuth = { headers: { Authorization: `Bearer ${driverToken}` } };

    // 1. Get Restaurants
    const restaurantsRes = await axios.get(`${API_URL}/api/restaurants`, customerAuth);
    if (!restaurantsRes.data.items?.length) {
      throw new Error('E2E setup failed: no restaurants available. Run `npm run seed` first.');
    }
    const restaurantId = restaurantsRes.data.items[0].id;

    // 2. Get Menu
    const menuRes = await axios.get(`${API_URL}/api/menus/restaurants/${restaurantId}/menu`, customerAuth);
    if (!menuRes.data.items?.length) {
      throw new Error('E2E setup failed: no menu items available. Run `npm run seed` first.');
    }
    const menuItemId = menuRes.data.items[0].id;

    // 3. Add to Cart
    await axios.post(`${API_URL}/api/cart/items`, { menuItemId, quantity: 2 }, customerAuth);

    // 4. Create Order (CREATED)
    const orderRes = await axios.post(`${API_URL}/api/orders`, {}, customerAuth);
    const orderId = orderRes.data.id;
    console.log(`Order created: ${orderId} (status ${orderRes.data.status})`);

    const getOrder = async () => (await axios.get(`${API_URL}/api/orders/${orderId}`, customerAuth)).data;

    // 5. Create the payment. createPayment's own completeSideEffects call
    // synchronously moves the order to PAYMENT_PENDING via a direct HTTP call
    // to order-service, so this should already be true by the time it returns,
    // but poll briefly in case that side effect had to be retried.
    const paymentRes = await axios.post(`${API_URL}/api/payments`, { orderId }, customerAuth);
    const paymentId = paymentRes.data.id;
    console.log(`Payment created: ${paymentId} (status ${paymentRes.data.status})`);

    await waitFor(
      'order to reach PAYMENT_PENDING',
      getOrder,
      (order) => order.status === 'PAYMENT_PENDING',
    );

    // 6. Process (settle) the payment. simulateFailure: false forces the
    // simulated-success branch rather than leaving it to PAYMENT_SUCCESS_RATE.
    const processedPayment = await axios.post(
      `${API_URL}/api/payments/${paymentId}/process`,
      { simulateFailure: false },
      customerAuth,
    );
    console.log(`Payment processed: status ${processedPayment.data.status}`);
    if (processedPayment.data.status !== 'COMPLETED') {
      throw new Error(`Expected payment to complete, got status ${processedPayment.data.status}`);
    }

    const confirmedOrder = await waitFor(
      'order to reach CONFIRMED',
      getOrder,
      (order) => order.status === 'CONFIRMED',
    );
    console.log(`Order status after payment: ${confirmedOrder.status}`);

    // 7. Restaurant moves the order through its own kitchen states.
    // CONFIRMED -> PREPARING -> READY_FOR_PICKUP (ORDER_TRANSITIONS does not
    // allow skipping PREPARING).
    await axios.patch(`${API_URL}/api/orders/${orderId}/status`, { status: 'PREPARING' }, ownerAuth);
    await axios.patch(`${API_URL}/api/orders/${orderId}/status`, { status: 'READY_FOR_PICKUP' }, ownerAuth);
    console.log('Order marked READY_FOR_PICKUP');

    // 8. Dispatch a delivery for the order (restaurant owner / dispatch role).
    const deliveryRes = await axios.post(`${API_URL}/api/deliveries`, { orderId }, ownerAuth);
    const deliveryId = deliveryRes.data.id;
    console.log(`Delivery created: ${deliveryId} (status ${deliveryRes.data.status})`);

    // 9. Auto-assign the next available driver (seeded and brought online by
    // scripts/seed.ts) and drive the delivery to completion.
    const assigned = await axios.post(`${API_URL}/api/deliveries/${deliveryId}/assign`, {}, ownerAuth);
    console.log(`Driver assigned: ${assigned.data.driverId}`);

    await axios.post(`${API_URL}/api/deliveries/${deliveryId}/pickup`, {}, driverAuth);
    await axios.post(`${API_URL}/api/deliveries/${deliveryId}/start`, {}, driverAuth);
    await axios.post(`${API_URL}/api/deliveries/${deliveryId}/complete`, {}, driverAuth);

    const deliveredOrder = await waitFor(
      'order to reach DELIVERED',
      getOrder,
      (order) => order.status === 'DELIVERED',
    );
    console.log(`Final order status: ${deliveredOrder.status}`);

    if (deliveredOrder.status !== 'DELIVERED') {
      throw new Error(`Expected order to be DELIVERED, got ${deliveredOrder.status}`);
    }

    console.log('E2E critical-path flow completed successfully!');
  } catch (error: any) {
    console.error('E2E failed:');
    if (error.response) {
      console.error(error.response.status, JSON.stringify(error.response.data));
    } else {
      console.error(error.message);
    }
    process.exit(1);
  }
}

runE2E();