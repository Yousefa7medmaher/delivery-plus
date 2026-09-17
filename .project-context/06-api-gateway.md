# API Gateway

## Role of the gateway

The API gateway is the publicly reachable entry point for the platform. It accepts client traffic, routes requests to downstream services, and centralizes the routing and cross-cutting concerns that should not be duplicated across every service.

The main implementation entry point is:

- [services/api-gateway/src/main.ts](../services/api-gateway/src/main.ts)

## Routing model

The gateway uses HTTP proxy middleware to forward path prefixes to service-specific internal URLs.

The main route groups are:

- `/api/auth`
- `/api/users`
- `/api/restaurants`
- `/api/menus`
- `/api/cart`
- `/api/orders`
- `/api/payments`
- `/api/deliveries`
- `/api/drivers`
- `/api/tracking`
- `/api/notifications`

These route mappings are intentionally coarse and align with the underlying service boundaries.

## Gateway responsibilities

### 1. External access boundary

All client-facing requests enter through the gateway. That keeps the internal service network private and keeps downstream services easier to evolve.

### 2. Service discovery via environment configuration

The gateway is configured with upstream URLs such as:

- `AUTH_SERVICE_URL`
- `USER_SERVICE_URL`
- `RESTAURANT_SERVICE_URL`
- `MENU_SERVICE_URL`
- `CART_SERVICE_URL`
- `ORDER_SERVICE_URL`
- `PAYMENT_SERVICE_URL`
- `DELIVERY_SERVICE_URL`
- `DRIVER_SERVICE_URL`
- `TRACKING_SERVICE_URL`
- `NOTIFICATION_SERVICE_URL`

Those values are set in [docker-compose.yml](../docker-compose.yml) and enable the gateway to forward traffic to the correct service by path prefix.

### 3. Swagger aggregation

The gateway sets up Swagger endpoints and exposes grouped API documentation, making the platform easier to explore without contacting each service individually.

## Health and readiness

The gateway exposes a health route and is included in the compose healthcheck flow, which means the stack waits for all app services to be reachable before considering the deployment healthy.

This is documented in:

- [docker-compose.yml](../docker-compose.yml)

## Security and auth flow

The gateway acts as the boundary where client requests are routed, but the actual auth enforcement is still service-level. The platform uses a shared auth pattern with JWTs and role-based checks. In practice:

- client authenticates through the auth service
- token is passed on subsequent requests
- downstream services validate those tokens and roles as needed

The gateway should not be treated as the only enforcement layer; actual permission logic should still happen in the application services.

## Current architecture assumptions

The gateway is not a full API management layer. It is a thin reverse-proxy and documentation front door, which fits this repository’s microservice style.

The system design implicitly assumes:

- clients rely on the gateway for entry
- service-to-service calls remain internal and HTTP-based where needed
- async coordination is handled with Kafka rather than direct synchronous orchestrations

## Source of truth

- Gateway implementation: [services/api-gateway/src/main.ts](../services/api-gateway/src/main.ts)
- Compose environment wiring: [docker-compose.yml](../docker-compose.yml)
- Shared topic definitions: [shared/src/events/topics.ts](../shared/src/events/topics.ts)
- Service docs index: [docs/services.md](../docs/services.md)
