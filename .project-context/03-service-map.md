# Service Map

This file is the high-level dependency map. For deeper service-by-service detail, use the docs in [../docs/services.md](../docs/services.md) and the pages under [../docs/services](../docs/services).

| Service | Port | Depends on | Depended on by | Owns / persists | Publishes | Consumes |
| --- | ---: | --- | --- | --- | --- | --- |
| api-gateway | 3000 | all app services | clients | none | none | none |
| auth-service | 3001 | PostgreSQL, shared auth guards | gateway | credentials + auth state | none | none |
| user-service | 3002 | PostgreSQL, order-service | gateway, auth-service | user profiles | none | none |
| restaurant-service | 3003 | PostgreSQL | gateway, menu-service, order-service | restaurants | none | none |
| menu-service | 3004 | PostgreSQL, restaurant-service | gateway, cart-service | menu items and categories | none | none |
| cart-service | 3005 | Redis, menu-service | gateway, order-service | user cart state | none | none |
| order-service | 3006 | PostgreSQL, Redis, cart-service, restaurant-service, Kafka | gateway, payment-service, delivery-service | orders | order.events | payment.events, delivery.events |
| payment-service | 3007 | PostgreSQL, order-service, Kafka | gateway | payment records | payment.events | none |
| delivery-service | 3008 | PostgreSQL, order-service, driver-service, Kafka | gateway | delivery records | delivery.events | none |
| driver-service | 3009 | PostgreSQL, Kafka | delivery-service, tracking-service | drivers | none | delivery.events |
| tracking-service | 3010 | Redis, delivery-service, driver-service | gateway | last-known locations | none | none |
| notification-service | 3011 | PostgreSQL, Kafka | gateway | notification records | none | order.events, payment.events, delivery.events |

## Port and route conventions

- Gateway: `3000`
- Service ports follow the default mapping in `docker-compose.yml`
- Service-specific routes are defined in each controller, normally under the route prefix of the service, e.g. `/orders`, `/deliveries`, `/drivers`, `/tracking`

## Cross-service relationships

- `auth-service` creates the user profile via `user-service`
- `menu-service` verifies ownership with `restaurant-service`
- `cart-service` validates menu items from `menu-service`
- `order-service` orchestrates state changes using cart and restaurant checks
- `payment-service` updates order status based on payment outcome
- `delivery-service` assigns drivers and updates order status
- `tracking-service` enriches delivery progress using delivery and driver service data
- `notification-service` listens for asynchronous events and records notifications

## Notes

This document is intentionally map-like and not a full deep dive; the details live in the service docs and the event design file.
