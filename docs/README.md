# Contributor Documentation

This folder is the main human-readable documentation hub for the repository.

## Start here

- [Overview](../README.md) – project summary and quick start
- [Architecture](./architecture.md) – service boundaries and communication model
- [Deployment](./deployment.md) – Docker, environment variables, and runtime setup
- [Services index](./services.md) – links to all service-level docs
- [ADR index](./adr/README.md) – architecture decision records
- [Runbooks](./runbooks/README.md) – operational playbooks and incident guides

## Service docs

- [API Gateway](./services/api-gateway.md)
- [Auth Service](./services/auth-service.md)
- [User Service](./services/user-service.md)
- [Restaurant Service](./services/restaurant-service.md)
- [Menu Service](./services/menu-service.md)
- [Cart Service](./services/cart-service.md)
- [Order Service](./services/order-service.md)
- [Payment Service](./services/payment-service.md)
- [Delivery Service](./services/delivery-service.md)
- [Driver Service](./services/driver-service.md)
- [Tracking Service](./services/tracking-service.md)
- [Notification Service](./services/notification-service.md)

## Notes

The project is structured as a Node.js + NestJS microservice platform with PostgreSQL, Redis, and Kafka backing the domain services. For implementation details, prefer the service pages and the root README; they reflect the current code in the repository.
