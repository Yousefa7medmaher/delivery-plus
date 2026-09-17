# Deployment and Local Infrastructure

## Prerequisites

Use Node.js 20+, npm, and Docker Desktop with Compose v2. Copy `.env.example` to `.env` for local commands, but do not commit the copy.

## Docker Compose

```bash
docker compose up --build -d
docker compose ps
docker compose logs -f order-service
docker compose config --quiet
docker compose down
```

Compose starts PostgreSQL 16, Redis 7, Kafka with Zookeeper, Kafka UI on port `8085`, the gateway, and all domain services. The root multi-stage `Dockerfile` accepts `SERVICE_NAME` and builds the shared package followed by the selected service.

PostgreSQL creates these logical databases: `auth_service`, `user_service`, `restaurant_service`, `menu_service`, `order_service`, `payment_service`, `driver_service`, `delivery_service`, and `notification_service`. Compose passes each service its own database URL.

Internal containers communicate using Docker DNS names such as `http://order-service:3006`, `redis://redis:6379`, and `kafka:29092`. The local Kafka listener exposed to the host is `localhost:9092`.

## CI Expectations

CI runs `npm ci`, lint, tests, TypeScript builds, Compose validation, and an API Gateway image build. Trivy scans the filesystem and the built image for unfixed CRITICAL vulnerabilities and secrets. CI does not require production credentials or start the full infrastructure.
