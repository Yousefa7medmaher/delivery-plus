# Project Overview

## What this platform does
This repository implements a backend-only food delivery platform built as a set of NestJS microservices. It covers user accounts, restaurant and menu management, cart operations, order orchestration, payment simulation, driver lifecycle, delivery flow, tracking, and notifications.

## Business domain
Core business actors and entities include:

- Customers
- Restaurant owners
- Drivers
- Admins
- Orders
- Carts
- Restaurants
- Menu items and categories
- Payments
- Deliveries
- Driver location snapshots
- Notifications

## Domain model summary

| Entity | Typical owner | Notes |
| --- | --- | --- |
| User profile | user-service | Auth registration creates a profile entry |
| Restaurant | restaurant-service | Has owner and status |
| Menu item | menu-service | Belongs to a restaurant and has availability |
| Cart | cart-service | Redis-backed and customer-scoped |
| Order | order-service | Central orchestration model |
| Payment | payment-service | Simulated payment flow |
| Driver | driver-service | Availability and status transitions |
| Delivery | delivery-service | Delivery assignment and lifecycle |
| Tracking location | tracking-service | Redis-based last-known location |
| Notification | notification-service | Event-driven inbox records |

## Roles and access model
The codebase uses user roles from the shared library, including:

- `ADMIN`
- `CUSTOMER`
- `RESTAURANT_OWNER`
- `DRIVER`

The auth layer issues JWTs and the shared guards enforce access rules at service boundaries.

## Runtime notes
- The API gateway is the front door for the platform.
- Business logic lives in domain services rather than the gateway.
- Kafka is used for async coordination between order, payment, delivery, and notification flows.
- Redis is used for cart and location state.
- PostgreSQL stores structured domain records in service-owned databases.

## Source of truth
This summary is intentionally high-level. For route-level and configuration-level truth, see:

- [../docs/services.md](../docs/services.md)
- [../docs/services/api-gateway.md](../docs/services/api-gateway.md)
- [../docker-compose.yml](../docker-compose.yml)
