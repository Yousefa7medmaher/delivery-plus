# Auth Service

## Purpose
Handles registration, authentication, and JWT-based identity for users and roles.

## Main REST endpoints
From `services/auth-service/src/controllers/auth.controller.ts`:

- `POST /auth/register` – register a new user and create a profile
- `POST /auth/login` – sign in and receive a JWT token
- `GET /auth/me` – return the current user payload from the bearer token

## Dependencies
- Calls `user-service` internally for user profile creation and lookup via `src/common/user-service.client.ts`
- Requires `DATABASE_URL` and `JWT_SECRET`
- Uses Redis indirectly through shared rate-limit infrastructure and shared app config

## Events published/consumed
- No Kafka producers or consumers are implemented in this service.

## Required env vars
From `services/auth-service/src/config/app-config.ts` and `docker-compose.yml`:

- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_EXPIRES_IN` (default: `1h`)
- `USER_SERVICE_URL` (default: `http://localhost:3002`)
- `PORT` (default: `3001`)
- `NODE_ENV` (default: `development`)

## Notes
The auth service validates credentials and issues JSON Web Tokens; downstream access control is enforced with shared guards from `@food-delivery/shared`. Its profile-creation call is currently an unauthenticated internal HTTP request. The accepted target for that call is the HMAC service-auth contract in [ADR 001](../adr/001-internal-service-authentication.md), to be applied through DP-010.
