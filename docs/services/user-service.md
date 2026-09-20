# User Service

## Purpose
Owns user profiles and order-history lookups for authenticated users.

## Main REST endpoints
From `services/user-service/src/controllers/users.controller.ts`:

- `POST /internal/users` – internal profile creation endpoint
- `GET /users/me` – get the current authenticated profile
- `PATCH /users/me` – update the current authenticated profile
- `GET /users/me/orders` – fetch current user order history
- `GET /users/:id` – get a user profile by ID

## Dependencies
- Calls `order-service` to fetch order history via `src/common/order-service.client.ts`
- Depends on PostgreSQL for the user profile table
- Trusted by `auth-service` on registration

## Events published/consumed
- No Kafka event producer/consumer is implemented in this service.

## Required env vars
From `services/user-service/src/config/app-config.ts`:

- `DATABASE_URL`
- `JWT_SECRET`
- `ORDER_SERVICE_URL` (default: `http://localhost:3006`)
- `REDIS_URL` (default: `redis://localhost:6379`)
- `INTERNAL_AUTH_SECRET` (required in production; local Compose provides a development-only default)
- `PORT` (default: `3002`)
- `NODE_ENV` (default: `development`)

## Notes
The service acts as the canonical user-data layer for profile details and exposes a few internal endpoints that are intended for service-to-service use. `POST /internal/users` requires the HMAC internal-auth contract in [ADR 001](../adr/001-internal-service-authentication.md). Redis stores short-lived nonces with `SET NX EX` so a signed request cannot be replayed within the acceptance window. Profile ownership enforcement for `GET /users/:id` remains DP-057 work.
