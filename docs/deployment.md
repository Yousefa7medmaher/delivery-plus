# Deployment and Local Infrastructure

## Prerequisites

Use Node.js 20+, npm, and Docker Desktop with Compose v2. Copy `.env.example` to `.env` for local commands, but do not commit the copy.

## Docker Compose

This repository uses the single Compose file at [docker-compose.yml](../docker-compose.yml). It starts the shared PostgreSQL 16, Redis 7, Zookeeper, Kafka, and Kafka UI containers alongside the application services.

```bash
# start infra only
docker compose up -d postgres redis zookeeper kafka

# start the full stack
docker compose up -d --build

# validate the compose graph in Linux/WSL
docker compose config --quiet
docker compose ps
```

```powershell
# PowerShell (WSL-hosted validation is also supported)
docker compose config --quiet
docker compose up -d --build
```

The root multi-stage `Dockerfile` accepts `SERVICE_NAME` and builds the shared package followed by the selected service.

PostgreSQL creates these logical databases: `auth_service`, `user_service`, `restaurant_service`, `menu_service`, `order_service`, `payment_service`, `driver_service`, `delivery_service`, and `notification_service`. Compose passes each service its own database URL via `DATABASE_URL`.

The project was validated in WSL using the same Docker Compose stack that the repo ships: `docker compose config --quiet` and `docker compose up -d --wait postgres redis zookeeper kafka` both succeeded, and the service database migration path was exercised against the real Postgres container.

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
