# Architecture

The platform is a NestJS/TypeScript monorepo with one API Gateway and eleven domain services. Each service owns its application code and durable data. The `shared` workspace contains cross-cutting infrastructure, not business workflows.

```mermaid
graph TD
  Client --> Gateway[API Gateway :3000]
  Gateway --> Services[Domain services]
  Services --> Postgres[(PostgreSQL databases)]
  Services --> Redis[(Redis)]
  Order[Order service] -->|order.events| Kafka[(Kafka)]
  Payment[Payment service] -->|payment.events| Kafka
  Delivery[Delivery service] -->|delivery.events| Kafka
  Kafka --> Driver[Driver service]
  Kafka --> Notification[Notification service]
  Kafka --> Order
```

## Communication

- HTTP is used by the gateway and for synchronous service-to-service checks such as menu ownership, cart reads, order validation, and delivery updates.
- Kafka carries order, payment, and delivery events. Consumers must tolerate retries and duplicate delivery.
- Redis stores carts, cache entries, rate-limit state, and recent driver locations with a TTL.
- PostgreSQL stores credentials, profiles, restaurants, menu data, orders, payments, deliveries, drivers, and notifications. Docker initializes separate logical databases from `docker/postgres/init.sql`.

## Main Flow

1. A customer adds a menu item to the Redis cart.
2. Order Service validates the cart and restaurant, persists an order, clears the cart, and publishes order events.
3. Payment Service creates and processes a simulated payment, then publishes success or failure. Order Service consumes the result and changes order state.
4. A restaurant owner advances the order to preparation and pickup readiness. Delivery Service creates a delivery, assigns an available driver, and updates the order through HTTP clients.
5. Drivers report locations to Tracking Service, which stores the latest location in Redis. Tracking combines delivery data with the driver location.
6. Delivery completion updates delivery, order, and driver state. Kafka consumers and direct HTTP calls are both present in the current implementation.

The current implementation does not provide a real payment provider, push/email delivery, durable Kafka idempotency store, or production dead-letter queue. Those are roadmap items.
