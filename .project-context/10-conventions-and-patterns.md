# Conventions and Patterns

## Monorepo layout

This project uses a workspace-based monorepo pattern. The root package.json defines workspaces for:

- `shared`
- `services/*`

This arrangement makes it easy to treat the codebase as a single project while keeping each service logically separate.

The root package file is:

- [package.json](../package.json)

## NestJS microservice convention

Most services are built as NestJS apps with a conventional structure:

- `app.module.ts`
- `main.ts`
- `config/`
- `common/`
- `controllers/`
- `dto/`
- `entities/`
- `modules/`
- `repositories/`
- `services/`

This pattern is repeated across many services, which keeps the architecture familiar to contributors and helps the repo remain predictable.

## Domain ownership pattern

Each service owns its own business domain and persistence table(s):

- auth-service owns credentials
- user-service owns profiles
- restaurant-service owns restaurants
- menu-service owns menu items
- cart-service owns cart state in Redis
- order-service owns orders
- payment-service owns payments
- delivery-service owns deliveries
- driver-service owns drivers
- tracking-service owns location snapshots
- notification-service owns notifications

This service-owned pattern is central to the platform design and is more important than an over-centralized repository model.

## Enum-driven state modeling

The project relies heavily on shared enums and transition maps to describe lifecycle states. The purpose is to make status progression explicit and enforceable.

The source is:

- [shared/src/types/enums.ts](../shared/src/types/enums.ts)

This helps maintain a consistent contract for:

- order states
- payment states
- delivery states
- driver availability states
- restaurant status states

## HTTP + Kafka hybrid pattern

The application mix is intentionally hybrid:

- synchronous REST is used for direct client interactions and service lookups
- Kafka is used for async cross-service propagation and background updates

This is the most important operational pattern in the repo and directly supports the platform’s microservice design.

## Cross-service reference pattern

The codebase often uses stable identifiers to reference records from another service instead of embedding large nested objects.

Examples:

- `restaurantId` on menu items
- `customerId` on orders and payments
- `driverId` on deliveries
- `orderId` on delivery and payment rows
- `userId` on driver records and notifications

This is a good pattern for decoupled services because it preserves a stable reference while avoiding deep service coupling.

## Validation and guard pattern

Many domain operations are expected to validate business state before they move forward. The shared transition tables are a strong signal that state validation matters and should not be left implicit.

The pattern is:

1. service validates current state
2. it checks if the intended transition is allowed
3. it persists the new state
4. it emits or consumes the relevant event when needed

## Documentation pattern

The repo keeps a separation between:

- high-level system docs in [docs](../docs)
- service-level docs in [docs/services.md](../docs/services.md) and [docs/services](../docs/services)
- AI-readable context in [.project-context](../.project-context)

This makes it easier for humans and AI agents to find the right level of abstraction without digging through service internals.

## Source of truth

- Root workspace setup: [package.json](../package.json)
- Shared domain contracts: [shared/src/types/enums.ts](../shared/src/types/enums.ts)
- Kafka contract definitions: [shared/src/events/topics.ts](../shared/src/events/topics.ts)
- Service guide: [docs/services.md](../docs/services.md)
