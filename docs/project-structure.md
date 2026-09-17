# Project Structure

This document captures the repository layout and the role of the main directories that matter to contributors.

## Top-level layout

- `README.md` – project overview and landing page
- `docs/` – contributor-facing documentation and architecture references
- `services/` – each NestJS microservice package
- `shared/` – reusable internal library for events, guards, Redis helpers, logging, and Nest utilities
- `scripts/` – local scripts for seed and e2e runs
- `docker/` – Docker-related support files such as the Postgres initialization SQL
- `docker-compose.yml` – development/local runtime orchestration
- `Dockerfile` – multi-service container build definition
- `.github/` – issue templates, PR template, and CI workflow

## Service package layout

Each service follows the same internal convention:

- `src/app.module.ts` – root module registration
- `src/main.ts` – bootstrap entry point
- `src/config/` – environment config loader
- `src/controllers/` – HTTP endpoints
- `src/dto/` – validation and request payload objects
- `src/entities/` – persistence models / TypeORM entities
- `src/repositories/` – persistence or data access layer
- `src/services/` – business logic
- `src/common/` – clients to other services and reusable helpers
- `src/modules/` – Nest feature modules

## Notes

The repository was reorganized to keep the source logic under `services/*/src` and `shared/src` untouched while exposing documentation and project map files in the `docs/` and `.project-context/` areas.
