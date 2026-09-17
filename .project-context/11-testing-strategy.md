# Testing Strategy

## Current project stance

This repository is set up as a TypeScript monorepo with workspace-level test scripts, but the concrete test strategy is primarily conventional and service-local rather than a heavy, centralized QA harness.

The root scripts are defined in:

- [package.json](../package.json)

The package scripts run:

- `npm run build --workspaces --if-present`
- `npm run lint --workspaces --if-present`
- `npm run test --workspaces --if-present`

## What the repo expects

The project structure has Jest configuration in each service package, which suggests a service-by-service test model:

- each service has a `jest.config.js`
- each service can run its own tests independently
- shared behavior is validated at the package level rather than through one giant integration suite

This is a typical microservice layout for focused unit and integration tests.

## Recommended test layers

### 1. Unit tests

Use unit tests for:

- enum transition validation logic
- guard checks
- service methods
- DTO validation
- pure mapping functions

This is where most branch-level logic belongs.

### 2. Service-layer tests

These verify:

- a request enters the controller or service properly
- repository interactions are correct
- state transitions are allowed or rejected
- command flows behave as expected for order, payment, and delivery movement

### 3. Integration tests

The project’s architecture benefits from focused integration checks around:

- PostgreSQL-backed domain flows
- Redis cart state handling
- Kafka event publication and consumption
- gateway-to-service routing
- auth token validation paths

These tests should be narrow and explicit because the overall system is distributed.

## State-transition validation is a natural testing target

The shared transition map in:

- [shared/src/types/enums.ts](../shared/src/types/enums.ts)

is an especially good candidate for unit tests because it provides a central definition of allowed lifecycle movement. Tests should confirm:

- valid transitions pass
- invalid transitions fail
- cancellation and terminal states behave as expected

## Docker validation should complement code tests

The stack is designed to run via Docker Compose, and this is a key validation path for local integration confidence:

- [docker-compose.yml](../docker-compose.yml)

A realistic verification flow includes:

- compose build
- compose up
- service health checks
- gateway health verification
- Kafka + Postgres readiness

This is particularly useful for validating that the project boots correctly in a real multi-container setup.

## Local workflow guidance

When working on this repo, the best practical testing order is:

1. validate the shared state and domain rules
2. run service-specific unit tests
3. validate the relevant service in Docker Compose
4. confirm the gateway and dependencies still expose healthy endpoints

## Important caveat

The repository is not a full end-to-end test platform by default. Most meaningful validation will require a combination of:

- workspace-level scripts
- service-level Jest runs
- docker-compose health checks
- manual API checks for gateway and service routes

## Source of truth

- Root scripts: [package.json](../package.json)
- Shared transitions: [shared/src/types/enums.ts](../shared/src/types/enums.ts)
- Compose stack: [docker-compose.yml](../docker-compose.yml)
- Service Jest configs: each service folder under [services](../services)
