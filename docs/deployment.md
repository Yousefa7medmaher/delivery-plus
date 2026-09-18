# Deployment and Local Infrastructure

## Prerequisites

Use Node.js 20+, npm, and Docker Desktop with Compose v2. Copy `.env.example` to `.env` for local commands, but do not commit the copy.

## Docker Compose

Use the environment-specific Compose overlays instead of the single all-in-one file:

```bash
# local development
docker compose -f docker-compose.base.yml -f docker-compose.dev.yml up --build -d
docker compose -f docker-compose.base.yml -f docker-compose.dev.yml ps
docker compose -f docker-compose.base.yml -f docker-compose.dev.yml logs -f order-service
docker compose -f docker-compose.base.yml -f docker-compose.dev.yml config --quiet
docker compose -f docker-compose.base.yml -f docker-compose.dev.yml down

# test validation
docker compose -f docker-compose.base.yml -f docker-compose.test.yml config --quiet

# production-like validation (fail fast unless secrets are supplied)
# These values are for Compose configuration validation only and must never be used for deployment.
export POSTGRES_USER="compose_validation_user"
export POSTGRES_PASSWORD="compose_validation_only_7f3c2b"
export POSTGRES_USER_URLENCODED="compose_validation_user"
export POSTGRES_PASSWORD_URLENCODED="compose_validation_only_7f3c2b"
export JWT_SECRET="compose_validation_only_jwt_9a41d8"
docker compose -f docker-compose.base.yml -f docker-compose.prod.yml config --quiet
```

```powershell
# PowerShell equivalent
$env:POSTGRES_USER="compose_validation_user"
$env:POSTGRES_PASSWORD="compose_validation_only_7f3c2b"
$env:POSTGRES_USER_URLENCODED="compose_validation_user"
$env:POSTGRES_PASSWORD_URLENCODED="compose_validation_only_7f3c2b"
$env:JWT_SECRET="compose_validation_only_jwt_9a41d8"
docker compose -f docker-compose.base.yml -f docker-compose.prod.yml config --quiet
```

The base file defines shared infrastructure (PostgreSQL 16, Redis 7, Zookeeper, Kafka). The dev overlay exposes local ports and enables Kafka UI. The test overlay is intended for deterministic CI/test orchestration. The production overlay requires secret values and avoids developer-only defaults.

The root multi-stage `Dockerfile` accepts `SERVICE_NAME` and builds the shared package followed by the selected service.

PostgreSQL creates these logical databases: `auth_service`, `user_service`, `restaurant_service`, `menu_service`, `order_service`, `payment_service`, `driver_service`, `delivery_service`, and `notification_service`. Compose passes each service its own database URL.

Internal containers communicate using Docker DNS names such as `http://order-service:3006`, `redis://redis:6379`, and `kafka:29092`. For local host access, Kafka is published as `127.0.0.1:9092` and is reachable from tools running on the machine as `localhost:9092`. Kafka UI remains exposed locally on `127.0.0.1:8085` and connects to the Compose network via `kafka:29092`.

Listener summary:

- Docker services → `kafka:29092`
- Host development tools → `localhost:9092`
- Kafka UI → `localhost:8085`

## Database migrations

This repository uses a migration-first database workflow for every PostgreSQL-backed service.

### Local generation and execution

Start the infrastructure first:

```bash
docker compose up -d postgres redis zookeeper kafka
```

Create or update the service schema from the service folder:

```bash
npm run migration:generate --workspace=@food-delivery/order-service
npm run migration:run --workspace=@food-delivery/order-service
npm run migration:show --workspace=@food-delivery/order-service
```

The generated migration files live under each service’s `src/database/migrations` directory. The migration history is tracked in the service database by TypeORM.

### Fresh database initialization

The Postgres container creates the logical service databases through [docker/postgres/init.sql](../docker/postgres/init.sql). That file creates databases such as `auth_service`, `user_service`, `menu_service`, `order_service`, and `payment_service`.

Application tables are created by TypeORM migrations. Do not rely on runtime schema sync. The repository intentionally keeps `synchronize: false` and `migrationsRun: false` for the service TypeORM configuration.

### Production migration execution

The Docker image startup path runs the service migration before the Node process starts. This means the production-safe flow is:

1. build the image
2. start the Postgres container
3. let the app container execute its migration
4. start the service only after migration success

This matches the repository’s Docker Compose deployment pattern and avoids `synchronize: true` creating implicit schema drift.

### Forward-only expectations and rollback limitations

- migration files are expected to be forward-only once they are published
- do not edit an already-applied migration in a shared environment
- new schema changes must be created as new migration files
- rollback is limited to recovery and local cleanup; it is not the normal deployment path
- schema recovery should be performed with a new migration or a controlled maintenance window, not by re-running `synchronize`

## CI Expectations

CI runs `npm ci`, lint, tests, TypeScript builds, Compose validation, and an API Gateway image build. Trivy scans the filesystem and the built image for unfixed CRITICAL vulnerabilities and secrets. CI does not require production credentials or start the full infrastructure.
