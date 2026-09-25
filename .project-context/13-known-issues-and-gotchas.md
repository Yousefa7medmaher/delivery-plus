# Known Issues and Gotchas

## 1. This is a learning/demo-oriented architecture

The project is intentionally structured like a practical microservice backend rather than a hardened production system. Several design decisions are deliberately simple and are meant to be understandable for local development rather than enterprise-scale operations.

## 2. Identity is split across services

The repo uses a shared canonical `userId` pattern, but the actual data is still stored in separate domains:

- `credentials` in auth-service
- `user_profiles` in user-service
- assorted ownership fields in domain services

This is a good pattern for a loosely coupled system, but it can be confusing if a contributor expects one central user table.

## 3. Event contracts are lightweight

Kafka topics are centrally named, but the payload schemas are not formalized in a single event registry. That means a contributor may need to inspect producer code and consumer behavior together to understand a message contract.

## 4. Async flows are not a replacement for strong consistency

The project uses Kafka for event propagation, but it does not implement distributed transactions or guarantee eventual consistency semantics across all operations. In practice, a service may update its own table before or after an event is consumed, depending on implementation details.

## 5. Redis is used for mutable runtime state, not long-term data history

The cart and tracking services store state in Redis because it is suited to low-latency, ephemeral data. This is intentional, but it means those domains should not be treated like permanent relational storage.

## 6. Local environment defaults are convenience defaults

Compose files use default credentials and secrets that are acceptable for local development but not for production. If this project is used beyond demo mode, it should be reworked with secure secrets and stronger deployment controls.

## 7. Service startup order matters

Because the architecture depends on Kafka, Postgres, and Redis, local startup can fail if containers come up in the wrong sequence. The compose file mitigates this with health checks and `depends_on` conditions, but it is still worth remembering when debugging local issues.

## 8. Cross-service call graphs can be confusing

One service may call another to validate menu ownership, restaurant existence, or driver state. The project is designed for modularization, but it can be harder to reason about than a single monolith when following a request end-to-end.

## 9. Gateway routing is a simplification

The gateway acts as a reverse proxy and documentation front door, but it is not modeled as a full API gateway with granular policy, rate limiting, or advanced observability features. It fits the repo’s lightweight architecture, not a production-grade edge layer.

## 10. Testing is not fully centralized

The workspace root defines commands, but actual validation is still service-specific and environment-aware. This means contributors should expect to run targeted checks and inspect health endpoints rather than rely on one single all-encompassing test suite.

## 11. Current implementation gaps

- The API Gateway has no `/health` controller even though Compose probes that path.
- Kafka deduplication is in-memory, and exhausted consumer messages are committed without a real DLQ.
- Delivery event publication is wired but not invoked by the current lifecycle methods.
- Notification payment and delivery handlers are currently no-ops.
- Internal user profile creation requires HMAC service identity, and user profile lookup enforces owner or admin access.
- Outbound service HTTP clients use native `fetch` without a shared timeout, retry, or circuit-breaker policy.
- The payment service contains a manual SQL idempotency upgrade outside the normal TypeORM migration runner.
- CI does not start Compose, execute migrations, run gateway-to-service integration tests, run the E2E script, or collect coverage.

These are documented findings from the current source, not claims that the application should be changed as part of documentation work. Related GitHub roadmap items remain open unless the repository and GitHub state prove otherwise.

## 12. Roadmap and history snapshot

The authenticated GitHub repository currently contains 55 roadmap issues mapped to the active local DP set: 50 open and 5 closed historical items. The closed items cover order idempotency, payment concurrency, production schema synchronization, Compose profiles, and service-level Swagger documentation. The remaining issues are roadmap work, not evidence that the corresponding behavior is implemented.

Recent repository history confirms these completed code/documentation themes:

- production database migration workflow was merged through PR #29 and is present in the Docker startup path
- service Swagger/OpenAPI DTO metadata was standardized through PR #27
- environment-specific Compose files and host Kafka exposure were merged through PR #25
- order creation idempotency was merged through PR #21
- the latest commit (`5b8f306`) ignores local roadmap and issue tooling, so local issue files are not tracked source artifacts

## Source of truth

- Compose stack: [docker-compose.yml](../docker-compose.yml)
- Shared enums and state transitions: [shared/src/types/enums.ts](../shared/src/types/enums.ts)
- Shared Kafka topics: [shared/src/events/topics.ts](../shared/src/events/topics.ts)
- Service docs: [docs/services.md](../docs/services.md)
