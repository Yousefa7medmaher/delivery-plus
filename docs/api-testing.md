# API Testing Architecture

This repository uses a layered test strategy instead of a single monolithic test harness:

1. Service-level Jest specs validate domain logic, DTO validation, guard behavior, and service transitions.
2. The API Gateway remains the entry point for all public traffic, and its rewrite logic is validated in the service-level Jest suite.
3. The public contract is generated from the canonical public route map and exported as a single OpenAPI document.
4. The generated document is imported into Apidog for API-level automation, environment-driven workflow coverage, and regression validation.
5. Kafka integration tests stay separate from the gateway and HTTP tests because the Kafka behavior is asynchronous and broker-backed.

## Public OpenAPI contract

The generated file lives at:

- `docs/openapi/delivery-plus-public.json`

It is produced by:

- `npm run openapi:generate`

It is validated by:

- `npm run openapi:validate`

The architecture is:

```
Service OpenAPI / route map
      ↓
Public OpenAPI generator
      ↓
docs/openapi/delivery-plus-public.json
      ↓
Apidog API Automation
```

The document intentionally reflects the public Gateway API, not the internal service-only routes or private `/internal/*` endpoints.

## Gateway contract boundaries

The public API is mapped through the Gateway prefixes listed below:

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

The Menu service is treated as a special case because its controllers are mounted at the root rather than under `/menu`, so the public contract preserves the actual menu routes while still exposing them under `/api/menus` at the gateway.

## Apidog setup

1. Import `docs/openapi/delivery-plus-public.json` into Apidog.
2. Add environment variables such as `baseUrl`, `accessToken`, `refreshToken`, `userId`, and `orderId`.
3. Use request chaining and assertions to model the customer, restaurant-owner, and driver flows.
4. Keep any real secrets in environment variables or GitHub Actions secret storage only; never commit them.

## CI and local validation

The repository already runs lint, unit tests, build, and Docker compose validation in GitHub Actions. The OpenAPI validation is a required additional gate so the public contract stays aligned with the actual public route map.

Apidog CLI execution is intentionally not committed here because it requires external project credentials and a hosted Apidog setup. The workflow is prepared for a `secrets.APIDOG_API_TOKEN`-style configuration when that environment is available.

## Kafka testing foundation

Kafka-specific tests remain in the integration layer and follow the project’s existing service pattern rather than being forced into the HTTP contract generator. The repository already contains service-level Kafka event assertions and event-driven consumers, which is the right place to extend event/integration coverage without inventing a second Kafka testing framework.
