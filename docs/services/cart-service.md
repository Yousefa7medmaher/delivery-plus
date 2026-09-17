# Cart Service

## Purpose
Manages the current user cart in Redis, including item quantity changes and computed totals.

## Main REST endpoints
From `services/cart-service/src/controllers/cart.controller.ts`:

- `GET /cart` – get the current user cart with total price
- `POST /cart/items` – add an item to the cart
- `PATCH /cart/items/:menuItemId` – update item quantity (0 removes it)
- `DELETE /cart/items/:menuItemId` – remove an item
- `DELETE /cart` – clear the entire cart

## Dependencies
- Uses Redis via `CartRepository`
- Calls `menu-service` to validate item existence and price/availability via `src/common/menu-service.client.ts`
- Is a dependency of `order-service` when creating an order from the cart

## Events published/consumed
- No Kafka event producer/consumer is implemented in this service.

## Required env vars
From `services/cart-service/src/config/app-config.ts`:

- `REDIS_URL`
- `JWT_SECRET`
- `MENU_SERVICE_URL` (default: `http://localhost:3004`)
- `CART_TTL_SECONDS` (default: `86400`)
- `PORT` (default: `3005`)
- `NODE_ENV` (default: `development`)

## Notes
The cart is intentionally lightweight and backed by Redis, which keeps the read/write operations fast and decoupled from the relational stores.
