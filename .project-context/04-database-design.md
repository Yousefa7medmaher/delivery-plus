# Database Design

## Database strategy

This platform follows a shared-infra but service-owned-data model:

- PostgreSQL is used for durable, relational domain records.
- Each application service keeps its own database schema and owns its domain tables.
- Redis is used for ephemeral, high-velocity state, especially carts and tracking.
- Kafka is not a database; it is the async coordination layer between services.

The service-level database design matches the entity models in each service and is reflected in the TypeORM entities.

## Core persistence boundaries

| Service | Persistence store | Core domain tables | Key design notes |
| --- | --- | --- | --- |
| auth-service | PostgreSQL | credentials | Stores user credentials and canonical `userId` identity |
| user-service | PostgreSQL | user_profiles | Stores profile detail keyed by the same `id` as auth credentials |
| restaurant-service | PostgreSQL | restaurants | Restaurant ownership and operating state |
| menu-service | PostgreSQL | menu_items | Catalog data keyed by restaurant and optional category |
| cart-service | Redis | cart state | Customer-scoped cart; not a relational table |
| order-service | PostgreSQL | orders, order_items | Central orchestration object with nested order items |
| payment-service | PostgreSQL | payments | Payment record tied to order and customer |
| delivery-service | PostgreSQL | deliveries | One delivery per order; driver assignment tracked here |
| driver-service | PostgreSQL | drivers | Driver profile, license plate, and availability state |
| tracking-service | Redis | location snapshots | Short-lived location/proximity state |
| notification-service | PostgreSQL | notifications | Event-driven records for user inbox items |

## Shared identity model

A consistent user identity is used across microservices:

- `auth-service` is the identity source.
- `Credential.id` is the canonical `userId` value.
- `user-service` stores a profile row with the same UUID in `UserProfile.id`.
- `restaurant-service` stores `ownerId` as a userId of a `RESTAURANT_OWNER`.
- `driver-service` stores `userId` for the driver credential record.

This avoids fragmented identity ownership while preserving service-local data isolation.

## Relational model highlights

### Auth and user identity

The identity model is intentionally minimal but central:

- [services/auth-service/src/entities/credential.entity.ts](../services/auth-service/src/entities/credential.entity.ts)
- [services/user-service/src/entities/user-profile.entity.ts](../services/user-service/src/entities/user-profile.entity.ts)

Both models share the same UUID-based identity notion:

- `credentials.id` is the canonical auth id
- `user_profiles.id` mirrors that same id
- email uniqueness is protected with a unique index

### Restaurant and menu catalog

Restaurants and menu items belong to the restaurant domain and are service-local, but cross-service calls still validate ownership and availability:

- [services/restaurant-service/src/entities/restaurant.entity.ts](../services/restaurant-service/src/entities/restaurant.entity.ts)
- [services/menu-service/src/entities/menu-item.entity.ts](../services/menu-item.entity.ts)

Important design choices:

- `restaurantId` is indexed on menu items
- `price` is stored as a decimal with precision `10, scale 2`
- menu availability is a boolean flag, allowing soft disable without deletion

### Order orchestration

The order domain is the platform’s coordination center.

- [services/order-service/src/entities/order.entity.ts](../services/order-service/src/entities/order.entity.ts)
- [services/order-service/src/entities/order-item.entity.ts](../services/order-service/src/entities/order-item.entity.ts)

The `Order` entity includes:

- `customerId`
- `restaurantId`
- `status` with `OrderStatus` enum
- `totalAmount` as decimal
- `idempotencyKey` for customer-scoped order creation deduplication
- nested `OrderItem[]` via TypeORM cascade

The order table uses a partial unique index `UQ_orders_customer_idempotency_key` on `("customerId", "idempotencyKey") WHERE "idempotencyKey" IS NOT NULL`, so a client key cannot create two different orders for the same customer. This protects the cart-to-order transition from duplicate retries and concurrent duplicate submissions.

This makes a single order a unit of orchestration and state progression across payment, delivery, and notification domains.

### Payment and delivery lifecycle

Payment and delivery records are explicit domain tables tied to orders:

- [services/payment-service/src/entities/payment.entity.ts](../services/payment-service/src/entities/payment.entity.ts)
- [services/delivery-service/src/entities/delivery.entity.ts](../services/delivery-service/src/entities/delivery.entity.ts)
- [services/driver-service/src/entities/driver.entity.ts](../services/driver-service/src/entities/driver.entity.ts)

Design notes:

- `payments.orderId` and `payments.customerId` are indexed for lookup and reconciliation
- at most one **active** payment (`PENDING`, `PROCESSING`, `COMPLETED`) per order, enforced by the partial unique index `UQ_payments_active_order`; `FAILED`/`REFUNDED` rows are excluded so a failed attempt can be retried
- `payments.idempotencyKey` stores the client's `Idempotency-Key`; unique per customer via the partial index `UQ_payments_customer_idempotency_key` (`("customerId", "idempotencyKey") WHERE "idempotencyKey" IS NOT NULL`)
- `publishedEventStatus` / `orderSyncedStatus` record which status's Kafka event and order update have been applied, so retries only redo missing side effects; `sideEffectsLeaseUntil` is a short lease so concurrent retries don't both perform them
- status changes use compare-and-set updates (`UPDATE ... WHERE id = ? AND status = ?`) instead of read-then-write, so concurrent requests cannot both move a payment out of the same state
- production schema changes are applied with `services/payment-service/migrations/*.sql` (production runs with `synchronize: false`); see [docs/services/payment-service.md](../docs/services/payment-service.md#database-migration-production)
- `deliveries.orderId` is unique, ensuring one active delivery per order
- `deliveries.driverId` is nullable and points to the driver service’s driver record
- drivers track separate lifecycle state such as `AVAILABLE`, `BUSY`, `OFFLINE`, and `SUSPENDED`

### Notification storage

Notifications are append-only user inbox records. They are not ephemeral UI state; they are persisted domain records:

- [services/notification-service/src/entities/notification.entity.ts](../services/notification-service/src/entities/notification.entity.ts)

This table keeps `userId`, `type`, `title`, `message`, and `isRead` so notification delivery can be retried or reviewed later.

## Redis usage

Redis is not treated as a general database. It is used for high-churn runtime data:

- Cart state in `cart-service`
- Tracking location snapshots in `tracking-service`

This keeps user carts and real-time location data outside the relational model, where object churn and latency are more appropriate.

## State transitions and validation

The shared enums and transition tables define allowed domain progression:

- [shared/src/types/enums.ts](../shared/src/types/enums.ts)

Examples:

- `OrderStatus` progression controls order lifecycle from `CREATED` to `DELIVERED`
- `DeliveryStatus` progression models driver handoff and transit tracking
- `PaymentStatus` progression models pending → processing → completed/failed

This is important because many services validate transitions centrally before publishing or acting on new events.

## Schema and service coupling expectations

The schema intentionally favors domain ownership and explicit cross-service references:

- `userId` is duplicated across services when needed, but the canonical source remains auth
- `restaurantId` and `orderId` are stable reference keys between services
- `Driver.id` is not the same as the auth `userId`; the driver entity stores both
- `Delivery.orderId` is unique to preserve the idea of one delivery record per order

This design reduces tight coupling while still letting services coordinate around common identifiers.

## Source of truth

For exact schema details, read the entity files in the individual services and the shared enum definitions:

- [shared/src/types/enums.ts](../shared/src/types/enums.ts)
- [services/auth-service/src/entities/credential.entity.ts](../services/auth-service/src/entities/credential.entity.ts)
- [services/user-service/src/entities/user-profile.entity.ts](../services/user-service/src/entities/user-profile.entity.ts)
- [services/restaurant-service/src/entities/restaurant.entity.ts](../services/restaurant-service/src/entities/restaurant.entity.ts)
- [services/menu-service/src/entities/menu-item.entity.ts](../services/menu-service/src/entities/menu-item.entity.ts)
- [services/order-service/src/entities/order.entity.ts](../services/order-service/src/entities/order.entity.ts)
- [services/payment-service/src/entities/payment.entity.ts](../services/payment-service/src/entities/payment.entity.ts)
- [services/delivery-service/src/entities/delivery.entity.ts](../services/delivery-service/src/entities/delivery.entity.ts)
- [services/driver-service/src/entities/driver.entity.ts](../services/driver-service/src/entities/driver.entity.ts)
- [services/notification-service/src/entities/notification.entity.ts](../services/notification-service/src/entities/notification.entity.ts)
