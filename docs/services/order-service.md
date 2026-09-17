# Order Service

## Purpose
Coordinates the ordering lifecycle and emits/consumes order payment and delivery events.

## Main REST endpoints
From `services/order-service/src/controllers/orders.controller.ts`:

- `POST /orders` – create an order from the current cart
- `GET /orders` – list the current user’s orders
- `GET /orders/restaurant/:restaurantId` – list orders for a restaurant (owner only)
- `GET /orders/:id` – fetch an order by ID
- `PATCH /orders/:id/status` – transition status with role checks

## Dependencies
- Reads the current cart from `cart-service`
- Validates restaurant ownership and status from `restaurant-service`
- Responds to payment and delivery events via Kafka consumers
- Persists order data in PostgreSQL

## Events published/consumed
Published to `order.events`:
- order created
- order status updated / completion signals

Consumed from:
- `payment.events` – payment outcome updates
- `delivery.events` – delivery status updates

The service uses the shared Kafka abstractions (`KafkaProducerService`, `KafkaConsumerService`) from the `shared` package.

## Required env vars
From `services/order-service/src/config/app-config.ts`:

- `DATABASE_URL`
- `JWT_SECRET`
- `CART_SERVICE_URL` (default: `http://localhost:3005`)
- `RESTAURANT_SERVICE_URL` (default: `http://localhost:3003`)
- `KAFKA_BROKER` (used in Docker Compose as `kafka:29092`)
- `PORT` (default: `3006`)
- `NODE_ENV` (default: `development`)

## Notes
This is one of the central orchestration services: it owns the order state machine and bridges cart, payment, and delivery flows.
