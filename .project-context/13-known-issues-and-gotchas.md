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

## Source of truth

- Compose stack: [docker-compose.yml](../docker-compose.yml)
- Shared enums and state transitions: [shared/src/types/enums.ts](../shared/src/types/enums.ts)
- Shared Kafka topics: [shared/src/events/topics.ts](../shared/src/events/topics.ts)
- Service docs: [docs/services.md](../docs/services.md)
