# Payment Service

## Purpose
Handles simulated payment creation, processing, and status tracking for orders.

## Main REST endpoints
From `services/payment-service/src/controllers/payments.controller.ts` (exposed through the gateway under `/api/payments`):

- `POST /payments` – create a payment for an order (moves the order to `PAYMENT_PENDING`). Accepts an optional `Idempotency-Key` header.
- `POST /payments/:id/process` – simulate processing and settle to success or failure. Retry-safe.
- `GET /payments/:id` – get payment status
- `POST /payments/:id/refund` – refund a completed payment

## Idempotency and retries

Payment creation and processing are safe to retry after a client timeout or network error.

### `POST /payments` with `Idempotency-Key`

Clients should send a key they generate once per checkout attempt (a UUID v4 is recommended) and reuse it on every retry of that attempt.

```
POST /api/payments
Authorization: Bearer <token>
Idempotency-Key: 3f0c7a52-8d1e-4c1b-9a7e-5b2d6e8f1a90
Content-Type: application/json

{ "orderId": "..." }
```

| Situation | Response |
|---|---|
| First request with a key | `201` with the new payment (`PENDING`) |
| Retry with the same key and same `orderId` | `201` with the **original** payment in its current state (no new row, no second `payment.created`, no second order update) |
| Same key reused for a different `orderId` | `409 Conflict` |
| Order already has an active payment (other key, or no key) | `409 Conflict` |
| Malformed key (empty, > 255 chars, spaces or non-ASCII, header sent twice) | `400 Bad Request` |
| No key | Previous behaviour: one payment is created; a retry gets `409` because an active payment exists |

Rules:

- Keys are scoped to the authenticated customer: two customers can use the same key independently.
- Keys are stored with the payment and do not expire.
- The key is checked **before** the order status. After a successful first attempt the order is `PAYMENT_PENDING`, so without the key a retry would be rejected; with it, the retry returns the original payment.
- If the first attempt failed after the row was inserted (Kafka or order-service down), the payment exists and the retry with the same key finishes the missing side effects.

### One active payment per order

Independently of the key, the database allows at most one payment per order in `PENDING`, `PROCESSING` or `COMPLETED` (partial unique index `UQ_payments_active_order`). Concurrent create requests for one order produce exactly one payment; the others get `409`. `FAILED` and `REFUNDED` payments do not count, so a failed attempt can be followed by a new payment.

### `POST /payments/:id/process`

| Current status | Behaviour |
|---|---|
| `PENDING` | Atomically claimed (`UPDATE ... WHERE status = 'PENDING'`), settled to `COMPLETED` or `FAILED`, then side effects run. Only one concurrent request can claim it. |
| `PROCESSING` | `409 Conflict` — another request is settling it. Retry shortly. |
| `COMPLETED` / `FAILED` | Returns the payment as-is. The outcome never changes on retry, even if `simulateFailure` differs. Only side effects that failed earlier are re-attempted. |
| `REFUNDED` | `409` invalid state transition (unchanged). |

### Side effects: Kafka event + order update

Each status that has side effects (`PENDING` → `payment.created` + order `PAYMENT_PENDING`; `COMPLETED` → `payment.completed` + order `CONFIRMED`; `FAILED` → `payment.failed` + order `FAILED`) records its progress on the payment row:

- `publishedEventStatus` — status whose event was published
- `orderSyncedStatus` — status whose order update was applied

A retry performs only the steps whose marker does not match the current status, in order (event first, then order). If a step fails, the error is returned to the client, the payment keeps its state, and the next retry resumes from that step.

A short lease (`sideEffectsLeaseUntil`, 30 s, based on the database clock) ensures only one request performs side effects at a time. A retry arriving while another request holds it returns the settled payment (or `409` for a `PENDING` payment whose creation side effects are still running). If the holder crashes, the lease expires and a later retry takes over.

Before settling a `PENDING` payment, `process` first finishes any creation side effects still owed, so the order always goes `CREATED → PAYMENT_PENDING → CONFIRMED/FAILED`.

### Delivery guarantees and known limits

- Events are **at-least-once**. A crash between a successful Kafka publish and writing `publishedEventStatus` causes the next retry to publish again. Every re-publish uses the same deterministic `eventId` (UUID v5 of `paymentId:eventType`), so consumers can deduplicate — see `.project-context/05-event-driven-design.md`.
- The same crash window exists for the order update. If order-service rejects the repeated update as an invalid transition (the order is already `CONFIRMED`), the retry returns that error; the payment itself stays correct.
- If a process dies after claiming `PROCESSING` and before settling, the payment stays `PROCESSING` and `process` returns `409`. A real provider integration would reconcile by querying the provider; with the simulator this needs manual repair.

## Database migration (production)

Production runs with `synchronize: false`. Apply `services/payment-service/migrations/20260917_payment_idempotency.sql` to the `payment_service` database **before** deploying this version:

1. Run the pre-check query at the top of the script. If any order has more than one active payment, resolve it first (keep the `COMPLETED` or oldest one, mark the others `FAILED`); otherwise the unique index cannot be built.
2. Run the script with `psql` (not inside an explicit transaction: the indexes use `CREATE INDEX CONCURRENTLY`). It is idempotent.
3. Deploy the service.

The script backfills the side-effect markers for existing payments so the new code does not re-publish historical events. Deploying the code before the script makes every payment query fail, because the new columns are missing. The old code keeps working after the script runs, so the rollback path is simply redeploying the previous version.

In development (`synchronize: true`) TypeORM creates the columns and indexes automatically.

## Dependencies
- Calls `order-service` to confirm order ownership and update status
- Persists payment records in PostgreSQL
- Publishes payment events to Kafka

## Events published/consumed
Published to `payment.events` (payload `{ paymentId, orderId, amount, status }`, unchanged):
- `payment.created`
- `payment.completed`
- `payment.failed`

`eventId` is deterministic per payment and event type; see "Delivery guarantees" above.

Consumed from:
- none directly implemented in this service

## Required env vars
From `services/payment-service/src/config/app-config.ts`:

- `DATABASE_URL`
- `JWT_SECRET`
- `ORDER_SERVICE_URL` (default: `http://localhost:3006`)
- `KAFKA_BROKER` (used in Docker Compose as `kafka:29092`)
- `PAYMENT_SUCCESS_RATE` (default: `0.9`)
- `PORT` (default: `3007`)
- `NODE_ENV` (default: `development`)

Test-only:

- `PAYMENT_TEST_DATABASE_URL` – disposable PostgreSQL database for `payments.repository.integration.spec.ts` (schema is dropped). When unset the integration suite is skipped.

## Testing

```
npm test -w services/payment-service

# including the PostgreSQL integration suite (race/uniqueness/migration):
docker compose up -d postgres
docker compose exec postgres psql -U postgres -c 'CREATE DATABASE payment_service_test'
PAYMENT_TEST_DATABASE_URL=postgres://postgres:postgres@localhost:5432/payment_service_test \
  npm test -w services/payment-service
```

## Notes
The implementation is intentionally simulation-based rather than a real payment gateway. The outcome is chosen by a configurable success rate.
