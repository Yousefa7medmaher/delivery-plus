# Auth and Security

## Authentication model

The repository is designed around JWT-based authentication with distinct service-level authorization checks.

The canonical identity is created in the auth service:

- [services/auth-service/src/entities/credential.entity.ts](../services/auth-service/src/entities/credential.entity.ts)

That entity defines:

- `email`
- `passwordHash`
- `role`
- the generated `id` that acts as the shared user identifier

## Shared roles

The available roles live in the shared package:

- [shared/src/types/enums.ts](../shared/src/types/enums.ts)

The defined roles are:

- `CUSTOMER`
- `RESTAURANT_OWNER`
- `DRIVER`
- `ADMIN`

These values are used as role enums in the credentials table and by guard logic across service boundaries.

## Identity and profile split

The platform separates identity from profile:

- `auth-service` owns authentication credentials
- `user-service` owns profile information such as name, email, phone, and address

This pattern appears in:

- [services/auth-service/src/entities/credential.entity.ts](../services/auth-service/src/entities/credential.entity.ts)
- [services/user-service/src/entities/user-profile.entity.ts](../services/user-service/src/entities/user-profile.entity.ts)

The design is intentionally consistent:

- same logical user
- same UUID as canonical `userId`
- different tables for different concerns

## Authorization pattern

The project uses shared JWT and access guard patterns instead of a monolithic auth layer. In practical terms:

- auth-service issues tokens
- downstream services validate the token and role claims
- role-based access checks constrain domain operations such as restaurant ownership, driver actions, and admin-only actions

This is a typical microservice approach: authentication at the edge, enforcement near the domain logic.

## Service ownership boundaries

Several service entities attach ownership to user identifiers:

- `restaurant-service` → `ownerId`
- `driver-service` → `userId`
- `notification-service` → `userId`
- `order-service` → `customerId`

This means the platform often relies on consistent user identifiers while still keeping business ownership state local to the service that owns the domain data.

## Implemented behavior

- Registration, login, and `GET /auth/me` are implemented in `auth-service`.
- JWT validation and role guards are shared by the domain services.
- Roles are `CUSTOMER`, `RESTAURANT_OWNER`, `DRIVER`, and `ADMIN`.

## Current auth backlog and planned hardening

The current auth implementation is intentionally minimal and is tracked as a managed backlog in the issue registry. The current documented gaps are:

- refresh-token lifecycle and rotation
- logout and token revocation
- password change and reset flows
- verification workflows for email and account state
- failed-login tracking and lockout behavior
- MFA / 2FA enhancement after the base security model is in place

These gaps are tracked in GitHub and local issue metadata, especially:

- [../issues/024-auth-refresh-token-lifecycle.md](../issues/024-auth-refresh-token-lifecycle.md)
- [../issues/025-auth-password-change-and-recovery.md](../issues/025-auth-password-change-and-recovery.md)
- [../issues/026-auth-account-verification-and-lockout.md](../issues/026-auth-account-verification-and-lockout.md)

## Security assumptions and caveats

This project is structured for a backend learning/demo environment, not a production-grade identity platform. The current design assumptions include:

- JWT secret values are configured via environment variables
- local development uses a default secret in compose files
- services trust the authenticated identity provided through the token and associated guards
- cross-service trust is relatively lightweight and assumes the internal network is controlled
- `POST /internal/users` is not protected by a JWT or service credential
- `GET /users/:id` validates a JWT but does not enforce self-access or admin ownership rules
- service-to-service authentication has no standardized implementation yet

The accepted target design is documented in [ADR 001](../docs/adr/001-internal-service-authentication.md): HMAC-signed internal requests with an explicit service identity, timestamp, nonce, and body-bound signature. This is a design contract for DP-058; guards, secrets, nonce storage, and endpoint enforcement remain implementation work under DP-010 and related issues.

The repo is therefore secure enough for a local development stack, but not designed as a finished production auth architecture out of the box.

## Source of truth

For role definitions and state enums:

- [shared/src/types/enums.ts](../shared/src/types/enums.ts)

For identity storage:

- [services/auth-service/src/entities/credential.entity.ts](../services/auth-service/src/entities/credential.entity.ts)
- [services/user-service/src/entities/user-profile.entity.ts](../services/user-service/src/entities/user-profile.entity.ts)

For gateway and service wiring:

- [services/api-gateway/src/main.ts](../services/api-gateway/src/main.ts)
- [docker-compose.yml](../docker-compose.yml)
