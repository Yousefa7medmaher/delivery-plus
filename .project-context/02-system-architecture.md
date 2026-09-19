# System Architecture

## High-level architecture

```mermaid
flowchart LR
    Client[Client apps] --> GW[API Gateway<br/>port 3000]

    GW --> AUTH[Auth Service<br/>3001]
    GW --> USER[User Service<br/>3002]
    GW --> REST[Restaurant Service<br/>3003]
    GW --> MENU[Menu Service<br/>3004]
    GW --> CART[Cart Service<br/>3005]
    GW --> ORD[Order Service<br/>3006]
    GW --> PAY[Payment Service<br/>3007]
    GW --> DEL[Delivery Service<br/>3008]
    GW --> DRV[Driver Service<br/>3009]
    GW --> TRK[Tracking Service<br/>3010]
    GW --> NOTIF[Notification Service<br/>3011]

    ORD --> PAY
    ORD --> CART
    ORD --> REST
    DEL --> DRV
    TRK --> DEL
    TRK --> DRV

    ORD -.->|order.events| KAFKA[(Kafka)]
    PAY -.->|payment.events| KAFKA
    DEL -.->|delivery.events wiring| KAFKA

    KAFKA -.->|events| NOTIF
    KAFKA -.->|events| DRV
    KAFKA -.->|events| ORD

    CART -.->|Redis| REDIS[(Redis)]
    TRK -.->|location| REDIS

    AUTH --> PG[(PostgreSQL)]
    USER --> PG
    REST --> PG
    MENU --> PG
    ORD --> PG
    PAY --> PG
    DEL --> PG
    DRV --> PG
    NOTIF --> PG
```

## Service list

| Service              | Purpose                                            |
| -------------------- | -------------------------------------------------- |
| api-gateway          | Proxies client traffic and aggregates Swagger docs |
| auth-service         | Registers users, logs in, and issues JWTs          |
| user-service         | User profile data and order history access         |
| restaurant-service   | Restaurant CRUD and ownership checks               |
| menu-service         | Menu categories and items                          |
| cart-service         | Redis-backed cart state                            |
| order-service        | Order lifecycle and orchestration                  |
| payment-service      | Simulated payment processing                       |
| delivery-service     | Delivery workflow and driver assignment            |
| driver-service       | Driver profile and status transitions              |
| tracking-service     | Last-known driver location and delivery tracking   |
| notification-service | Notification inbox driven by Kafka events          |

## Communication model

### Synchronous

REST between the gateway and service APIs, plus service-to-service HTTP calls for lookups and status updates.

### Asynchronous

Kafka topics from the shared package drive event propagation:

* `order.events`
* `payment.events`
* `delivery.events`

## Gateway routing

The gateway uses `http-proxy-middleware` and proxies routes by prefix, including:

* `/api/auth`
* `/api/users`
* `/api/restaurants`
* `/api/menus`
* `/api/cart`
* `/api/orders`
* `/api/payments`
* `/api/deliveries`
* `/api/drivers`
* `/api/tracking`
* `/api/notifications`

## Source of truth

* Gateway setup: [../services/api-gateway/src/main.ts](../services/api-gateway/src/main.ts)
* Shared Kafka topics: [../shared/src/events/topics.ts](../shared/src/events/topics.ts)
* Docker deployment: [../docker-compose.yml](../docker-compose.yml)
