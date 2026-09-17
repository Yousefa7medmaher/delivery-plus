# Menu Service

## Purpose
Owns menu categories, menu items, and restaurant menu availability logic.

## Main REST endpoints
From `services/menu-service/src/controllers/menu.controller.ts`:

- `POST /categories` – create a menu category (owner only)
- `GET /restaurants/:restaurantId/menu` – fetch a restaurant menu
- `GET /menu-items/:id` – fetch one menu item
- `POST /menu-items` – create a menu item (owner only)
- `PATCH /menu-items/:id` – update a menu item (owner only)
- `DELETE /menu-items/:id` – delete a menu item (owner only)
- `PATCH /menu-items/:id/availability` – toggle item availability (owner only)

## Dependencies
- Calls `restaurant-service` to validate ownership via `src/common/restaurant-service.client.ts`
- Stores menu data in PostgreSQL
- Used by `cart-service` during cart item validation through `menu-service.client.ts`

## Events published/consumed
- No Kafka events are published or consumed by this service.

## Required env vars
From `services/menu-service/src/config/app-config.ts`:

- `DATABASE_URL`
- `JWT_SECRET`
- `RESTAURANT_SERVICE_URL` (default: `http://localhost:3003`)
- `PORT` (default: `3004`)
- `NODE_ENV` (default: `development`)

## Notes
This service is a key dependency for carting and ordering because item availability and pricing are validated here.
