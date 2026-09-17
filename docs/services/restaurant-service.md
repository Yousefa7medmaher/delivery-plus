# Restaurant Service

## Purpose
Maintains restaurant records, status, and ownership checks for menu and ordering flows.

## Main REST endpoints
From `services/restaurant-service/src/controllers/restaurants.controller.ts`:

- `POST /restaurants` – create a restaurant (owner only)
- `GET /restaurants` – list restaurants (public, paginated/filterable)
- `GET /restaurants/:id` – fetch a restaurant by ID
- `PATCH /restaurants/:id` – update restaurant details (owner only)
- `PATCH /restaurants/:id/status` – update status (owner or admin)
- `GET /restaurants/:id/ownership/:userId` – internal ownership verification used by menu-service

## Dependencies
- Uses PostgreSQL for restaurant data
- `menu-service` checks ownership via this service
- No Kafka usage is implemented here

## Events published/consumed
- No Kafka events are published or consumed by this service.

## Required env vars
From `services/restaurant-service/src/config/app-config.ts`:

- `DATABASE_URL`
- `JWT_SECRET`
- `PORT` (default: `3003`)
- `NODE_ENV` (default: `development`)

## Notes
The service enforces restaurant ownership rules and is a central dependency for menu and order flows.
