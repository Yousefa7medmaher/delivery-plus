# Tracking Service

## Purpose
Collects real-time driver location updates and exposes delivery-tracking summaries.

## Main REST endpoints
From `services/tracking-service/src/controllers/tracking.controller.ts`:

- `POST /tracking/location` – driver reports their current location
- `GET /tracking/driver/:userId` – fetch a driver’s last known location
- `GET /tracking/delivery/:deliveryId` – fetch delivery status plus driver location

## Dependencies
- Uses Redis for location snapshots via `LocationRepository`
- Calls `delivery-service` and `driver-service` for verification and metadata
- Used by client tracking UI and operational dashboards

## Events published/consumed
- No Kafka producer/consumer is implemented in this service.

## Required env vars
From `services/tracking-service/src/config/app-config.ts`:

- `REDIS_URL`
- `JWT_SECRET`
- `DELIVERY_SERVICE_URL` (default: `http://localhost:3008`)
- `DRIVER_SERVICE_URL` (default: `http://localhost:3009`)
- `LOCATION_TTL_SECONDS` (default: `300`)
- `PORT` (default: `3010`)
- `NODE_ENV` (default: `development`)

## Notes
This service is intentionally lightweight and focuses on location storage and retrieval rather than business logic.
