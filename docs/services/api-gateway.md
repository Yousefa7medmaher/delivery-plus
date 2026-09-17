# API Gateway

## Purpose
The API Gateway is the single public entry point for the platform. It proxies traffic to the downstream microservices and exposes the combined Swagger UI at `/docs`.

## Main routes
The gateway routes are defined in `services/api-gateway/src/main.ts`:

- `/api/auth` -> `auth-service` (`/auth`)
- `/api/users` -> `user-service` (`/users`)
- `/api/restaurants` -> `restaurant-service` (`/restaurants`)
- `/api/menus` -> `menu-service` (`/menus` and menu item routes)
- `/api/cart` -> `cart-service` (`/cart`)
- `/api/orders` -> `order-service` (`/orders`)
- `/api/payments` -> `payment-service` (`/payments`)
- `/api/deliveries` -> `delivery-service` (`/deliveries`)
- `/api/drivers` -> `driver-service` (`/drivers`)
- `/api/tracking` -> `tracking-service` (`/tracking`)
- `/api/notifications` -> `notification-service` (`/notifications`)

The service listens on port `3000` by default and is configured via environment variables such as `AUTH_SERVICE_URL`, `USER_SERVICE_URL`, `ORDER_SERVICE_URL`, etc.

## Dependencies
- Depends on all application services for proxying and health checks.
- Does not own a database.

## Events published/consumed
- None directly published or consumed in this service.

## Required env vars
- `PORT` (default: `3000`)
- `AUTH_SERVICE_URL` (default: `http://localhost:3001`)
- `USER_SERVICE_URL` (default: `http://localhost:3002`)
- `RESTAURANT_SERVICE_URL` (default: `http://localhost:3003`)
- `MENU_SERVICE_URL` (default: `http://localhost:3004`)
- `CART_SERVICE_URL` (default: `http://localhost:3005`)
- `ORDER_SERVICE_URL` (default: `http://localhost:3006`)
- `PAYMENT_SERVICE_URL` (default: `http://localhost:3007`)
- `DELIVERY_SERVICE_URL` (default: `http://localhost:3008`)
- `DRIVER_SERVICE_URL` (default: `http://localhost:3009`)
- `TRACKING_SERVICE_URL` (default: `http://localhost:3010`)
- `NOTIFICATION_SERVICE_URL` (default: `http://localhost:3011`)

## Notes
The gateway is intentionally thin; business logic stays in the downstream services. See the root [README](../../README.md) and the service docs index in [../services.md](../services.md).
