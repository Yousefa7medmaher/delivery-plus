# Payment Service

## Purpose
Handles simulated payment creation, processing, and status tracking for orders.

## Main REST endpoints
From `services/payment-service/src/controllers/payments.controller.ts`:

- `POST /payments` – create a payment for an order
- `POST /payments/:id/process` – simulate processing and settle to success or failure
- `GET /payments/:id` – get payment status
- `POST /payments/:id/refund` – refund a completed payment

## Dependencies
- Calls `order-service` to confirm order ownership and update status
- Persists payment records in PostgreSQL
- Publishes payment events to Kafka

## Events published/consumed
Published to `payment.events`:
- `created`
- `completed`
- `failed`

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

## Notes
The implementation is intentionally simulation-based rather than a real payment gateway. The outcome is chosen by a configurable success rate.
