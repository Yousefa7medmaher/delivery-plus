# Local Stack Troubleshooting

This runbook covers the repository's committed Docker Compose workflow. It is for local diagnosis only; it is not a production deployment procedure.

## Validate configuration first

From the repository root:

```bash
docker compose -f docker-compose.yml config --quiet
docker compose -f docker-compose.yml ps --all
```

The first command validates interpolation and Compose syntax. The second shows service state. If no containers are listed, no runtime logs are available from the current Docker context.

## Start-up sequence

```bash
docker compose -f docker-compose.yml up -d --build
docker compose -f docker-compose.yml ps --all
docker compose -f docker-compose.yml logs --no-color --tail=200 <service>
```

Infrastructure services are PostgreSQL, Redis, Zookeeper, Kafka, and Kafka UI. Application services wait on Compose health conditions for their declared dependencies. This is an ordering aid, not a complete readiness guarantee.

## Known healthcheck limitation

Compose probes `/health` on the API Gateway at port `3000`, but the gateway currently has no controller that serves that route. A running gateway process can therefore remain unhealthy. Check the gateway logs and test a known proxied route separately; do not treat gateway health status as proof that every downstream route is healthy.

The domain services expose `/health` routes. Their readiness controllers may query PostgreSQL, but application readiness does not generally verify Kafka or Redis availability.

## Database and migrations

PostgreSQL creates the service databases from `docker/postgres/init.sql` on first initialization. PostgreSQL-backed application containers run TypeORM migrations during image startup; cart, tracking, and the gateway skip the TypeORM migration path because they do not own relational schemas.

Check migration output with:

```bash
docker compose -f docker-compose.yml logs --no-color --tail=200 <postgres-backed-service>
```

TypeORM configuration uses `synchronize: false` and `migrationsRun: false`. The payment service also contains a manual SQL upgrade under `services/payment-service/migrations/`; that file is not automatically executed by the normal TypeORM migration runner and must be handled explicitly when applicable.

## Kafka and Redis checks

Kafka clients inside Compose use `kafka:29092`; host tools use the published `localhost:9092` listener. Kafka UI is published on `localhost:8085` by the development overlay.

Redis-backed cart and tracking state is ephemeral. A Redis restart can remove current cart/location state unless the configured volume or recovery process preserves it.

The shared Kafka consumer retries a handler three times with exponential backoff. It keeps processed event IDs only in memory. After retries are exhausted it commits the offset and logs a DLQ message, but no actual dead-letter topic is implemented.

## Escalation notes

Record a reproducible symptom, the affected service, the relevant Compose logs, and whether the issue is caused by configuration, dependency readiness, migration state, or application behavior. Never place passwords, tokens, or complete secret-bearing environment values in an issue or documentation.

## Related documentation

- [Deployment](../deployment.md)
- [Architecture](../architecture.md)
- [Docker and infrastructure context](../../.project-context/08-docker-and-infra.md)
- [Known issues and gotchas](../../.project-context/13-known-issues-and-gotchas.md)
