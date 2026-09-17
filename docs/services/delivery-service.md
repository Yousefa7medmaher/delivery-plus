# Delivery Service

## Purpose
Owns delivery lifecycle management, driver assignment, and delivery status transitions.

## Main REST endpoints
From `services/delivery-service/src/controllers/deliveries.controller.ts`:

- `POST /deliveries` – create a delivery for an order ready for pickup
- `POST /deliveries/:id/assign` – assign an available driver
- `POST /deliveries/:id/pickup` – driver marks the order as picked up
- `POST /deliveries/:id/start` – driver starts the route
- `POST /deliveries/:id/complete` – mark the delivery as completed
- `POST /deliveries/:id/cancel` – cancel a delivery
- `GET /deliveries/:id` – get a delivery by ID

## Dependencies
- Calls `order-service` to validate order state and update order status
- Calls `driver-service` to find and update drivers
- Uses PostgreSQL for delivery records
- Publishes `delivery.events` to Kafka

## Events published/consumed
Published to `delivery.events`:
- dispatch/assignment updates
- pickup/in-transit/complete/cancel transitions

Consumed from:
- none directly implemented in this service

## Required env vars
From `services/delivery-service/src/config/app-config.ts`:

- `DATABASE_URL`
- `JWT_SECRET`
- `ORDER_SERVICE_URL` (default: `http://localhost:3006`)
- `DRIVER_SERVICE_URL` (default: `http://localhost:3009`)
- `KAFKA_BROKER` (used in Docker Compose as `kafka:29092`)
- `PORT` (default: `3008`)
- `NODE_ENV` (default: `development`)

## Notes
Driver assignment is a core orchestration task in this service, with explicit role checks and transition rules.
