# Notification Service

## Purpose
Stores user notifications and subscribes to Kafka events to notify clients when order, payment, or delivery events occur.

## Main REST endpoints
From `services/notification-service/src/controllers/notifications.controller.ts`:

- `GET /notifications` – list notifications for the current user
- `PATCH /notifications/:id/read` – mark one notification as read
- `PATCH /notifications/read-all` – mark all notifications as read

## Dependencies
- Uses PostgreSQL to persist notifications
- Subscribes to Kafka topics emitted by order, payment, and delivery flows
- Consumes events and records notifications for the receiving user

## Events published/consumed
Consumed from:
- `order.events`
- `payment.events`
- `delivery.events`

Published:
- none directly implemented in this service

## Required env vars
From `services/notification-service/src/config/app-config.ts`:

- `DATABASE_URL`
- `JWT_SECRET`
- `KAFKA_BROKER` (used in Docker Compose as `kafka:29092`)
- `PORT` (default: `3011`)
- `NODE_ENV` (default: `development`)

## Notes
This service mainly acts as an event consumer and notification inbox, keeping user-facing updates out of the core business services.
