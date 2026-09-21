import { OrdersService } from './orders.service';
import { OrdersRepository } from '../repositories/orders.repository';
import { CartServiceClient } from '../common/cart-service.client';
import { RestaurantServiceClient } from '../common/restaurant-service.client';
import {
  BadRequestError,
  ForbiddenError,
  InvalidStateTransitionError,
  NotFoundError,
  OrderStatus,
  RestaurantStatus,
  UserRole,
} from '@food-delivery/shared';

describe('OrdersService', () => {
  let service: OrdersService;
  let orders: jest.Mocked<OrdersRepository>;
  let cartClient: jest.Mocked<CartServiceClient>;
  let restaurantClient: jest.Mocked<RestaurantServiceClient>;

  const baseOrder = {
    id: 'order-1',
    customerId: 'customer-1',
    restaurantId: 'rest-1',
    status: OrderStatus.CREATED,
    totalAmount: '19.98',
    items: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    orders = {
      findById: jest.fn(),
      create: jest.fn(),
      updateStatus: jest.fn(),
      findByCustomer: jest.fn(),
      findByRestaurant: jest.fn(),
      findByCustomerAndIdempotencyKey: jest.fn(),
    } as unknown as jest.Mocked<OrdersRepository>;

    cartClient = {
      getCart: jest.fn(),
      clearCart: jest.fn(),
    } as unknown as jest.Mocked<CartServiceClient>;

    restaurantClient = {
      getRestaurant: jest.fn(),
      assertOwnership: jest.fn(),
    } as unknown as jest.Mocked<RestaurantServiceClient>;

    service = new OrdersService(
      orders, 
      cartClient, 
      restaurantClient,
      { publish: jest.fn() } as any,
      { subscribe: jest.fn(), start: jest.fn() } as any,
    );
  });

  describe('createFromCart', () => {
    it('throws BadRequestError when cart is empty', async () => {
      cartClient.getCart.mockResolvedValue({ userId: 'c1', restaurantId: null, items: [], total: 0 });
      await expect(service.createFromCart('customer-1', 'Bearer x')).rejects.toThrow(BadRequestError);
    });

    it('throws BadRequestError when restaurant is not OPEN', async () => {
      cartClient.getCart.mockResolvedValue({
        userId: 'c1',
        restaurantId: 'rest-1',
        items: [{ menuItemId: 'i1', name: 'Burger', price: 9.99, quantity: 1 }],
        total: 9.99,
      });
      restaurantClient.getRestaurant.mockResolvedValue({
        id: 'rest-1',
        ownerId: 'owner-1',
        name: 'X',
        status: RestaurantStatus.CLOSED,
      });

      await expect(service.createFromCart('customer-1', 'Bearer x')).rejects.toThrow(BadRequestError);
    });

    it('creates the order and clears the cart when everything is valid', async () => {
      cartClient.getCart.mockResolvedValue({
        userId: 'c1',
        restaurantId: 'rest-1',
        items: [{ menuItemId: 'i1', name: 'Burger', price: 9.99, quantity: 2 }],
        total: 19.98,
      });
      restaurantClient.getRestaurant.mockResolvedValue({
        id: 'rest-1',
        ownerId: 'owner-1',
        name: 'X',
        status: RestaurantStatus.OPEN,
      });
      orders.create.mockResolvedValue(baseOrder);

      const result = await service.createFromCart('customer-1', 'Bearer x');

      expect(result.id).toBe('order-1');
      expect(cartClient.clearCart).toHaveBeenCalledWith('Bearer x');
    });

    it('returns the original order when the same idempotency key is retried', async () => {
      const existing = { ...baseOrder, id: 'order-existing', customerId: 'customer-1' };
      orders.findByCustomerAndIdempotencyKey.mockResolvedValue(existing);

      const result = await (service as any).createFromCart('customer-1', 'Bearer x', 'key-1');

      expect(result.id).toBe('order-existing');
      expect(orders.create).not.toHaveBeenCalled();
      expect(cartClient.clearCart).not.toHaveBeenCalled();
    });

    it('replays a lost race with the same idempotency key after a unique-constraint conflict', async () => {
      const existing = { ...baseOrder, id: 'order-existing', customerId: 'customer-1' };
      cartClient.getCart.mockResolvedValue({
        userId: 'c1',
        restaurantId: 'rest-1',
        items: [{ menuItemId: 'i1', name: 'Burger', price: 9.99, quantity: 1 }],
        total: 9.99,
      });
      restaurantClient.getRestaurant.mockResolvedValue({
        id: 'rest-1',
        ownerId: 'owner-1',
        name: 'X',
        status: RestaurantStatus.OPEN,
      });
      orders.create.mockRejectedValueOnce(new Error('duplicate key'));
      orders.findByCustomerAndIdempotencyKey.mockResolvedValue(existing);

      const result = await (service as any).createFromCart('customer-1', 'Bearer x', 'key-1');

      expect(result.id).toBe('order-existing');
      expect(cartClient.clearCart).not.toHaveBeenCalled();
    });
  });

  describe('getById', () => {
    it('throws NotFoundError when missing', async () => {
      orders.findById.mockResolvedValue(null);
      await expect(service.getById('missing', 'u1', UserRole.CUSTOMER)).rejects.toThrow(NotFoundError);
    });

    it('allows the owning customer', async () => {
      orders.findById.mockResolvedValue(baseOrder);
      const result = await service.getById('order-1', 'customer-1', UserRole.CUSTOMER);
      expect(result.id).toBe('order-1');
    });

    it('rejects a different customer', async () => {
      orders.findById.mockResolvedValue(baseOrder);
      await expect(service.getById('order-1', 'someone-else', UserRole.CUSTOMER)).rejects.toThrow(
        ForbiddenError,
      );
    });

    it('allows the restaurant owner after ownership check', async () => {
      orders.findById.mockResolvedValue(baseOrder);
      restaurantClient.assertOwnership.mockResolvedValue(undefined);
      const result = await service.getById('order-1', 'owner-1', UserRole.RESTAURANT_OWNER);
      expect(result.id).toBe('order-1');
      expect(restaurantClient.assertOwnership).toHaveBeenCalledWith('rest-1', 'owner-1');
    });
  });

  describe('updateStatus', () => {
    it('rejects an invalid state transition', async () => {
      orders.findById.mockResolvedValue({ ...baseOrder, status: OrderStatus.DELIVERED });
      await expect(
        service.updateStatus('order-1', 'admin-1', UserRole.ADMIN, { status: OrderStatus.CREATED }),
      ).rejects.toThrow(InvalidStateTransitionError);
    });

    it('rejects a role not authorized for the target status', async () => {
      orders.findById.mockResolvedValue({ ...baseOrder, status: OrderStatus.PAYMENT_PENDING });
      await expect(
        service.updateStatus('order-1', 'customer-1', UserRole.CUSTOMER, {
          status: OrderStatus.CONFIRMED,
        }),
      ).rejects.toThrow(ForbiddenError);
    });

    it('allows the customer to cancel their own order', async () => {
      orders.findById.mockResolvedValue(baseOrder);
      orders.updateStatus.mockResolvedValue({ ...baseOrder, status: OrderStatus.CANCELLED });

      const result = await service.updateStatus('order-1', 'customer-1', UserRole.CUSTOMER, {
        status: OrderStatus.CANCELLED,
      });
      expect(result.status).toBe(OrderStatus.CANCELLED);
    });

    it('rejects a customer cancelling someone else\'s order', async () => {
      orders.findById.mockResolvedValue(baseOrder);
      await expect(
        service.updateStatus('order-1', 'not-the-customer', UserRole.CUSTOMER, {
          status: OrderStatus.CANCELLED,
        }),
      ).rejects.toThrow(ForbiddenError);
    });

    it('rejects a different customer before the same-status idempotent return', async () => {
      orders.findById.mockResolvedValue(baseOrder);

      await expect(
        service.updateStatus('order-1', 'not-the-customer', UserRole.CUSTOMER, {
          status: OrderStatus.CREATED,
        }),
      ).rejects.toThrow(ForbiddenError);

      expect(orders.updateStatus).not.toHaveBeenCalled();
    });

    it('allows ADMIN to force any valid transition', async () => {
      orders.findById.mockResolvedValue(baseOrder);
      orders.updateStatus.mockResolvedValue({ ...baseOrder, status: OrderStatus.PAYMENT_PENDING });

      const result = await service.updateStatus('order-1', 'admin-1', UserRole.ADMIN, {
        status: OrderStatus.PAYMENT_PENDING,
      });
      expect(result.status).toBe(OrderStatus.PAYMENT_PENDING);
    });

    it('checks restaurant ownership before letting an owner transition PREPARING', async () => {
      orders.findById.mockResolvedValue({ ...baseOrder, status: OrderStatus.CONFIRMED });
      restaurantClient.assertOwnership.mockResolvedValue(undefined);
      orders.updateStatus.mockResolvedValue({ ...baseOrder, status: OrderStatus.PREPARING });

      const result = await service.updateStatus('order-1', 'owner-1', UserRole.RESTAURANT_OWNER, {
        status: OrderStatus.PREPARING,
      });

      expect(restaurantClient.assertOwnership).toHaveBeenCalledWith('rest-1', 'owner-1');
      expect(result.status).toBe(OrderStatus.PREPARING);
    });
  });

  describe('listByRestaurant', () => {
    it('checks ownership before listing', async () => {
      restaurantClient.assertOwnership.mockResolvedValue(undefined);
      orders.findByRestaurant.mockResolvedValue([[baseOrder], 1]);

      const result = await service.listByRestaurant('rest-1', 'owner-1', 1, 20);
      expect(result.total).toBe(1);
      expect(restaurantClient.assertOwnership).toHaveBeenCalledWith('rest-1', 'owner-1');
    });
  });
});
