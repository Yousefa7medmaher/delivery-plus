<p align="center">
  <img src="./assets/logo.png" alt="Delivery Plus" width="420">
</p>

<h3 align="center">A cloud-native, event-driven microservices platform for on-demand delivery</h3>

<p align="center">
  <a href="./LICENSE"><img src="https://img.shields.io/badge/license-MIT-red.svg" alt="License: MIT"></a>
  <img src="https://img.shields.io/badge/node-%3E%3D18-red.svg" alt="Node >= 18">
  <img src="https://img.shields.io/badge/NestJS-11-red.svg?logo=nestjs&logoColor=white" alt="NestJS">
  <img src="https://img.shields.io/badge/TypeScript-5-red.svg?logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Docker-ready-red.svg?logo=docker&logoColor=white" alt="Docker Ready">
  <img src="https://img.shields.io/badge/PostgreSQL-15-red.svg?logo=postgresql&logoColor=white" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/Redis-cache-red.svg?logo=redis&logoColor=white" alt="Redis">
  <img src="https://img.shields.io/badge/Kafka-events-red.svg?logo=apachekafka&logoColor=white" alt="Kafka">
</p>

<p align="center">
  <img src="https://img.shields.io/badge/PRs-welcome-red.svg" alt="PRs Welcome">
  <img src="https://img.shields.io/badge/open%20source-yes-red.svg" alt="Open Source">
  <img src="https://img.shields.io/badge/build-passing-brightgreen.svg" alt="Build Passing">
  <img src="https://img.shields.io/badge/code%20style-eslint-red.svg" alt="Code Style: ESLint">
  <img src="https://img.shields.io/badge/tests-jest-red.svg?logo=jest&logoColor=white" alt="Tests: Jest">
</p>

<p align="center">
  <a href="#-architecture">Architecture</a> ·
  <a href="#-tech-stack">Tech Stack</a> ·
  <a href="#-services">Services</a> ·
  <a href="#-getting-started">Getting Started</a> ·
  <a href="#-testing">Testing</a> ·
  <a href="#-contributing">Contributing</a> ·
  <a href="#-license">License</a>
</p>

---

## <img src="./assets/icons/overview.png" width="26" valign="middle"> Overview

**Delivery Plus** is the backend engine behind a full-scale food delivery platform, built as a set of independently deployable **microservices** that communicate over REST and **Kafka** events. Every domain — auth, restaurants, menus, carts, orders, payments, drivers, deliveries, tracking, notifications and users — lives in its own service with its own database access layer, so teams can build, test, and ship each piece on its own schedule without stepping on each other.

This is a **backend-only** repository — no frontend/UI is included here by design. It's meant to be consumed by web, mobile, or third-party clients through the **API Gateway**.

## <img src="./assets/icons/architecture.png" width="26" valign="middle"> Architecture

```mermaid
flowchart LR
    Client[Client Apps] --> GW[API Gateway]

    GW --> AUTH[Auth Service]
    GW --> USER[User Service]
    GW --> REST[Restaurant Service]
    GW --> MENU[Menu Service]
    GW --> CART[Cart Service]
    GW --> ORD[Order Service]

    ORD --> PAY[Payment Service]
    ORD --> CART
    ORD --> REST

    PAY --> ORD

    ORD -. events .-> KAFKA[(Kafka)]
    DEL[Delivery Service] -. events .-> KAFKA
    DRV[Driver Service] -. events .-> KAFKA
    TRK[Tracking Service] -. events .-> KAFKA
    NOTIF[Notification Service] -. events .-> KAFKA

    KAFKA -. events .-> DEL
    KAFKA -. events .-> NOTIF

    DEL --> DRV
    TRK --> DRV
    TRK --> DEL

    CART -. cache .-> REDIS[(Redis)]
    TRK -. live location .-> REDIS

    AUTH --> PG[(PostgreSQL)]
    USER --> PG
    REST --> PG
    MENU --> PG
    ORD --> PG
    PAY --> PG
    DRV --> PG
    DEL --> PG
```

Every service is self-contained (own `src`, `dto`, `entities`, `repositories`, `controllers`) and shares a common foundation through the internal `shared` library — logging, Kafka producer/consumer, Redis caching, JWT/roles guards, error handling, and correlation-ID middleware.

## <img src="./assets/icons/tech_stack.png" width="26" valign="middle"> Tech Stack

| Layer | Technology |
|---|---|
| Language | TypeScript |
| Framework | NestJS |
| Database | PostgreSQL |
| Cache / Real-time state | Redis |
| Messaging / Events | Apache Kafka |
| Containerization | Docker & Docker Compose |
| Testing | Jest (unit + e2e) |
| Shared internals | Custom `shared` package (events, guards, filters, utils) |

## <img src="./assets/icons/services.png" width="26" valign="middle"> Services

| Service | Responsibility |
|---|---|
| `api-gateway` | Single entry point, request routing to downstream services |
| `auth-service` | Authentication, credentials, JWT issuing |
| `user-service` | User profiles |
| `restaurant-service` | Restaurant records & status |
| `menu-service` | Menu categories & items, availability |
| `cart-service` | Shopping cart (Redis-backed) |
| `order-service` | Order lifecycle & orchestration |
| `payment-service` | Payment processing |
| `driver-service` | Driver registration & status transitions |
| `delivery-service` | Delivery lifecycle |
| `tracking-service` | Live location tracking (Redis-backed) |
| `notification-service` | User notifications |

Each service exposes a `/health` endpoint and follows the same internal layout: `controllers → services → repositories → entities`.

## <img src="./assets/icons/getting_started.png" width="26" valign="middle"> Getting Started

### Prerequisites
- Node.js ≥ 18
- Docker & Docker Compose

### Run locally

```bash
# clone the repo
git clone https://github.com/<your-org>/delivery-plus.git
cd delivery-plus

# install dependencies
npm install

# spin up Postgres, Redis, Kafka and every service
docker-compose up --build
```

### Seed sample data

```bash
npm run seed
```

The API Gateway will be available at `http://localhost:<gateway-port>` — see [`docs/deployment.md`](./docs/deployment.md) for full port/env configuration.

## <img src="./assets/icons/testing.png" width="26" valign="middle"> Testing

```bash
# unit tests for a given service
npm run test --workspace=services/order-service

# end-to-end tests across the stack
npm run e2e
```

## <img src="./assets/icons/docs.png" width="26" valign="middle"> Documentation

- [`docs/architecture.md`](./docs/architecture.md) — deep dive into service boundaries & event flows
- [`docs/deployment.md`](./docs/deployment.md) — environment variables, ports, deployment guide
- [`docs/services.md`](./docs/services.md) — per-service API reference

## <img src="./assets/icons/contributing.png" width="26" valign="middle"> Contributing

Contributions are what make open source great. Please read [`CONTRIBUTING.md`](./CONTRIBUTING.md) and our [`CODE_OF_CONDUCT.md`](./CODE_OF_CONDUCT.md) before opening a PR.

1. Fork the repo
2. Create your branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Found a security issue? Please follow the process in [`SECURITY.md`](./SECURITY.md) instead of opening a public issue.

## <img src="./assets/icons/license.png" width="26" valign="middle"> License

Distributed under the **MIT License**. See [`LICENSE`](./LICENSE) for details.

---

<p align="center">
  <img src="./assets/icon.png" width="20" valign="middle">
  Made by the Delivery Plus team
</p>