# Driver Service

## Purpose
Tracks driver profiles, availability, and status transitions for delivery operations.

## Main REST endpoints
From `services/driver-service/src/controllers/drivers.controller.ts`:

- `POST /drivers/register` – register a driver profile for the authenticated driver
- `GET /drivers/me` – fetch the current driver profile
- `POST /drivers/me/online` – mark the driver available
- `POST /drivers/me/offline` – mark the driver offline
- `POST /drivers/me/status` – update status explicitly
- `GET /drivers/available` – list available drivers
- `GET /drivers/:id` – fetch a driver by ID
- `PATCH /drivers/:id/status` – admin/system status update

## Dependencies
- Persists driver data in PostgreSQL
- Consumes `delivery.events` to react to assignment and delivery updates
- Used by `delivery-service` to assign drivers and by `tracking-service` to resolve current driver information

## Events published/consumed
Consumed from `delivery.events`:
- delivery lifecycle and assignment updates

Published:
- no direct producer is implemented in this service

## Required env vars
From `services/driver-service/src/config/app-config.ts`:

- `DATABASE_URL`
- `JWT_SECRET`
- `KAFKA_BROKER` (used in Docker Compose as `kafka:29092`)
- `PORT` (default: `3009`)
- `NODE_ENV` (default: `development`)

## Notes
Driver status transitions are tightly constrained and validated by shared transition rules and role guards.
