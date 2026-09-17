# Glossary

## API Gateway
The entry point for client requests. It forwards traffic to backend services and exposes a shared Swagger surface.

## Auth Service
The service responsible for user identity, authentication, and JWT issuance.

## Cart Service
The Redis-backed service that manages a customer’s current shopping cart.

## Credential
The auth record that stores a user’s email, hashed password, and role.

## Delivery Service
The service responsible for delivery lifecycle management, including assignment and completion events.

## Driver Service
The service that owns driver records, status, availability, and driver-specific metadata.

## Event-driven architecture
A design in which services communicate asynchronously through messages rather than relying on synchronous API calls for every business change.

## Kafka
The message broker used to distribute domain events across services.

## Menu Service
The service responsible for restaurant menu items and catalog behavior.

## Microservice
An application design pattern where functionality is separated into independently deployable services with clear ownership boundaries.

## Order Service
The orchestration service for order creation, state progression, and cross-domain coordination.

## Payment Service
The service that handles payment lifecycle state such as pending, processing, and completion.

## PostgreSQL
The relational database used for durable structured data in the platform.

## Redis
The in-memory data store used for cart and tracking state.

## Restaurant Service
The service responsible for restaurant records and ownership checks.

## Tracking Service
The service responsible for last-known driver and delivery location information.

## User Service
The service responsible for user profile information and profile-related access.

## UserId
The consistent identifier used across services to refer to the same user or actor, derived from the auth credential ID.

## Workspace monorepo
A repository layout where multiple packages or services are managed as a single project rooted at the top-level package.json.

## Source of truth
This glossary is intentionally concise. For terminology backed by code, use the shared enums and the service entity files in this repo.
