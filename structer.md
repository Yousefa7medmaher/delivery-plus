.
├── CODE_OF_CONDUCT.md
├── CONTRIBUTING.md
├── Dockerfile
├── LICENSE
├── README.md
├── SECURITY.md
├── assets
│   ├── icon.png
│   ├── icons
│   │   ├── architecture.png
│   │   ├── contributing.png
│   │   ├── docs.png
│   │   ├── getting_started.png
│   │   ├── license.png
│   │   ├── overview.png
│   │   ├── services.png
│   │   ├── tech_stack.png
│   │   └── testing.png
│   └── logo.png
├── docker
│   └── postgres
│       └── init.sql
├── docker-compose.yml
├── docs
│   ├── README.md
│   ├── adr
│   │   ├── README.md
│   │   └── adr-template.md
│   ├── architecture.md
│   ├── deployment.md
│   ├── project-structure.md
│   ├── runbooks
│   │   └── README.md
│   ├── services
│   │   ├── api-gateway.md
│   │   ├── auth-service.md
│   │   ├── cart-service.md
│   │   ├── delivery-service.md
│   │   ├── driver-service.md
│   │   ├── menu-service.md
│   │   ├── notification-service.md
│   │   ├── order-service.md
│   │   ├── payment-service.md
│   │   ├── restaurant-service.md
│   │   ├── tracking-service.md
│   │   └── user-service.md
│   └── services.md
├── gateway-main.txt
├── package-lock.json
├── package.json
├── scripts
│   ├── e2e.ts
│   └── seed.ts
├── services
│   ├── api-gateway
│   │   ├── dist
│   │   │   ├── app.module.d.ts
│   │   │   ├── app.module.d.ts.map
│   │   │   ├── app.module.js
│   │   │   ├── app.module.js.map
│   │   │   ├── main.d.ts
│   │   │   ├── main.d.ts.map
│   │   │   ├── main.js
│   │   │   └── main.js.map
│   │   ├── jest.config.js
│   │   ├── package.json
│   │   ├── src
│   │   │   ├── app.module.ts
│   │   │   └── main.ts
│   │   └── tsconfig.json
│   ├── auth-service
│   │   ├── dist
│   │   │   ├── app.module.d.ts
│   │   │   ├── app.module.d.ts.map
│   │   │   ├── app.module.js
│   │   │   ├── app.module.js.map
│   │   │   ├── common
│   │   │   │   ├── user-service.client.d.ts
│   │   │   │   ├── user-service.client.d.ts.map
│   │   │   │   ├── user-service.client.js
│   │   │   │   └── user-service.client.js.map
│   │   │   ├── config
│   │   │   │   ├── app-config.d.ts
│   │   │   │   ├── app-config.d.ts.map
│   │   │   │   ├── app-config.js
│   │   │   │   ├── app-config.js.map
│   │   │   │   ├── config.module.d.ts
│   │   │   │   ├── config.module.d.ts.map
│   │   │   │   ├── config.module.js
│   │   │   │   └── config.module.js.map
│   │   │   ├── controllers
│   │   │   │   ├── auth.controller.d.ts
│   │   │   │   ├── auth.controller.d.ts.map
│   │   │   │   ├── auth.controller.js
│   │   │   │   ├── auth.controller.js.map
│   │   │   │   ├── health.controller.d.ts
│   │   │   │   ├── health.controller.d.ts.map
│   │   │   │   ├── health.controller.js
│   │   │   │   └── health.controller.js.map
│   │   │   ├── dto
│   │   │   │   ├── auth-response.dto.d.ts
│   │   │   │   ├── auth-response.dto.d.ts.map
│   │   │   │   ├── auth-response.dto.js
│   │   │   │   ├── auth-response.dto.js.map
│   │   │   │   ├── login.dto.d.ts
│   │   │   │   ├── login.dto.d.ts.map
│   │   │   │   ├── login.dto.js
│   │   │   │   ├── login.dto.js.map
│   │   │   │   ├── register.dto.d.ts
│   │   │   │   ├── register.dto.d.ts.map
│   │   │   │   ├── register.dto.js
│   │   │   │   └── register.dto.js.map
│   │   │   ├── entities
│   │   │   │   ├── credential.entity.d.ts
│   │   │   │   ├── credential.entity.d.ts.map
│   │   │   │   ├── credential.entity.js
│   │   │   │   └── credential.entity.js.map
│   │   │   ├── main.d.ts
│   │   │   ├── main.d.ts.map
│   │   │   ├── main.js
│   │   │   ├── main.js.map
│   │   │   ├── modules
│   │   │   │   └── auth
│   │   │   │       ├── auth.module.d.ts
│   │   │   │       ├── auth.module.d.ts.map
│   │   │   │       ├── auth.module.js
│   │   │   │       └── auth.module.js.map
│   │   │   ├── repositories
│   │   │   │   ├── credentials.repository.d.ts
│   │   │   │   ├── credentials.repository.d.ts.map
│   │   │   │   ├── credentials.repository.js
│   │   │   │   └── credentials.repository.js.map
│   │   │   └── services
│   │   │       ├── auth.service.d.ts
│   │   │       ├── auth.service.d.ts.map
│   │   │       ├── auth.service.js
│   │   │       ├── auth.service.js.map
│   │   │       ├── auth.service.spec.d.ts
│   │   │       ├── auth.service.spec.d.ts.map
│   │   │       ├── auth.service.spec.js
│   │   │       └── auth.service.spec.js.map
│   │   ├── jest.config.js
│   │   ├── package.json
│   │   ├── src
│   │   │   ├── app.module.ts
│   │   │   ├── common
│   │   │   │   └── user-service.client.ts
│   │   │   ├── config
│   │   │   │   ├── app-config.ts
│   │   │   │   └── config.module.ts
│   │   │   ├── controllers
│   │   │   │   ├── auth.controller.ts
│   │   │   │   └── health.controller.ts
│   │   │   ├── dto
│   │   │   │   ├── auth-response.dto.ts
│   │   │   │   ├── login.dto.ts
│   │   │   │   └── register.dto.ts
│   │   │   ├── entities
│   │   │   │   └── credential.entity.ts
│   │   │   ├── main.ts
│   │   │   ├── modules
│   │   │   │   └── auth
│   │   │   │       └── auth.module.ts
│   │   │   ├── repositories
│   │   │   │   └── credentials.repository.ts
│   │   │   └── services
│   │   │       ├── auth.service.spec.ts
│   │   │       └── auth.service.ts
│   │   └── tsconfig.json
│   ├── cart-service
│   │   ├── dist
│   │   │   ├── app.module.d.ts
│   │   │   ├── app.module.d.ts.map
│   │   │   ├── app.module.js
│   │   │   ├── app.module.js.map
│   │   │   ├── common
│   │   │   │   ├── menu-service.client.d.ts
│   │   │   │   ├── menu-service.client.d.ts.map
│   │   │   │   ├── menu-service.client.js
│   │   │   │   └── menu-service.client.js.map
│   │   │   ├── config
│   │   │   │   ├── app-config.d.ts
│   │   │   │   ├── app-config.d.ts.map
│   │   │   │   ├── app-config.js
│   │   │   │   ├── app-config.js.map
│   │   │   │   ├── config.module.d.ts
│   │   │   │   ├── config.module.d.ts.map
│   │   │   │   ├── config.module.js
│   │   │   │   └── config.module.js.map
│   │   │   ├── controllers
│   │   │   │   ├── cart.controller.d.ts
│   │   │   │   ├── cart.controller.d.ts.map
│   │   │   │   ├── cart.controller.js
│   │   │   │   ├── cart.controller.js.map
│   │   │   │   ├── health.controller.d.ts
│   │   │   │   ├── health.controller.d.ts.map
│   │   │   │   ├── health.controller.js
│   │   │   │   └── health.controller.js.map
│   │   │   ├── dto
│   │   │   │   ├── add-cart-item.dto.d.ts
│   │   │   │   ├── add-cart-item.dto.d.ts.map
│   │   │   │   ├── add-cart-item.dto.js
│   │   │   │   ├── add-cart-item.dto.js.map
│   │   │   │   ├── update-cart-item.dto.d.ts
│   │   │   │   ├── update-cart-item.dto.d.ts.map
│   │   │   │   ├── update-cart-item.dto.js
│   │   │   │   └── update-cart-item.dto.js.map
│   │   │   ├── entities
│   │   │   │   ├── cart.model.d.ts
│   │   │   │   ├── cart.model.d.ts.map
│   │   │   │   ├── cart.model.js
│   │   │   │   └── cart.model.js.map
│   │   │   ├── main.d.ts
│   │   │   ├── main.d.ts.map
│   │   │   ├── main.js
│   │   │   ├── main.js.map
│   │   │   ├── modules
│   │   │   │   └── cart
│   │   │   │       ├── cart.module.d.ts
│   │   │   │       ├── cart.module.d.ts.map
│   │   │   │       ├── cart.module.js
│   │   │   │       └── cart.module.js.map
│   │   │   ├── repositories
│   │   │   │   ├── cart.repository.d.ts
│   │   │   │   ├── cart.repository.d.ts.map
│   │   │   │   ├── cart.repository.js
│   │   │   │   └── cart.repository.js.map
│   │   │   └── services
│   │   │       ├── cart.service.d.ts
│   │   │       ├── cart.service.d.ts.map
│   │   │       ├── cart.service.js
│   │   │       ├── cart.service.js.map
│   │   │       ├── cart.service.spec.d.ts
│   │   │       ├── cart.service.spec.d.ts.map
│   │   │       ├── cart.service.spec.js
│   │   │       └── cart.service.spec.js.map
│   │   ├── jest.config.js
│   │   ├── package.json
│   │   ├── src
│   │   │   ├── app.module.ts
│   │   │   ├── common
│   │   │   │   └── menu-service.client.ts
│   │   │   ├── config
│   │   │   │   ├── app-config.ts
│   │   │   │   └── config.module.ts
│   │   │   ├── controllers
│   │   │   │   ├── cart.controller.ts
│   │   │   │   └── health.controller.ts
│   │   │   ├── dto
│   │   │   │   ├── add-cart-item.dto.ts
│   │   │   │   └── update-cart-item.dto.ts
│   │   │   ├── entities
│   │   │   │   └── cart.model.ts
│   │   │   ├── events
│   │   │   ├── main.ts
│   │   │   ├── modules
│   │   │   │   └── cart
│   │   │   │       └── cart.module.ts
│   │   │   ├── repositories
│   │   │   │   └── cart.repository.ts
│   │   │   └── services
│   │   │       ├── cart.service.spec.ts
│   │   │       └── cart.service.ts
│   │   └── tsconfig.json
│   ├── delivery-service
│   │   ├── dist
│   │   │   ├── app.module.d.ts
│   │   │   ├── app.module.d.ts.map
│   │   │   ├── app.module.js
│   │   │   ├── app.module.js.map
│   │   │   ├── common
│   │   │   │   ├── driver-service.client.d.ts
│   │   │   │   ├── driver-service.client.d.ts.map
│   │   │   │   ├── driver-service.client.js
│   │   │   │   ├── driver-service.client.js.map
│   │   │   │   ├── order-service.client.d.ts
│   │   │   │   ├── order-service.client.d.ts.map
│   │   │   │   ├── order-service.client.js
│   │   │   │   ├── order-service.client.js.map
│   │   │   │   ├── system-token.service.d.ts
│   │   │   │   ├── system-token.service.d.ts.map
│   │   │   │   ├── system-token.service.js
│   │   │   │   └── system-token.service.js.map
│   │   │   ├── config
│   │   │   │   ├── app-config.d.ts
│   │   │   │   ├── app-config.d.ts.map
│   │   │   │   ├── app-config.js
│   │   │   │   ├── app-config.js.map
│   │   │   │   ├── config.module.d.ts
│   │   │   │   ├── config.module.d.ts.map
│   │   │   │   ├── config.module.js
│   │   │   │   └── config.module.js.map
│   │   │   ├── controllers
│   │   │   │   ├── deliveries.controller.d.ts
│   │   │   │   ├── deliveries.controller.d.ts.map
│   │   │   │   ├── deliveries.controller.js
│   │   │   │   ├── deliveries.controller.js.map
│   │   │   │   ├── health.controller.d.ts
│   │   │   │   ├── health.controller.d.ts.map
│   │   │   │   ├── health.controller.js
│   │   │   │   └── health.controller.js.map
│   │   │   ├── dto
│   │   │   │   ├── create-delivery.dto.d.ts
│   │   │   │   ├── create-delivery.dto.d.ts.map
│   │   │   │   ├── create-delivery.dto.js
│   │   │   │   └── create-delivery.dto.js.map
│   │   │   ├── entities
│   │   │   │   ├── delivery.entity.d.ts
│   │   │   │   ├── delivery.entity.d.ts.map
│   │   │   │   ├── delivery.entity.js
│   │   │   │   └── delivery.entity.js.map
│   │   │   ├── main.d.ts
│   │   │   ├── main.d.ts.map
│   │   │   ├── main.js
│   │   │   ├── main.js.map
│   │   │   ├── modules
│   │   │   │   └── deliveries
│   │   │   │       ├── deliveries.module.d.ts
│   │   │   │       ├── deliveries.module.d.ts.map
│   │   │   │       ├── deliveries.module.js
│   │   │   │       └── deliveries.module.js.map
│   │   │   ├── repositories
│   │   │   │   ├── deliveries.repository.d.ts
│   │   │   │   ├── deliveries.repository.d.ts.map
│   │   │   │   ├── deliveries.repository.js
│   │   │   │   └── deliveries.repository.js.map
│   │   │   └── services
│   │   │       ├── deliveries.service.d.ts
│   │   │       ├── deliveries.service.d.ts.map
│   │   │       ├── deliveries.service.js
│   │   │       ├── deliveries.service.js.map
│   │   │       ├── deliveries.service.spec.d.ts
│   │   │       ├── deliveries.service.spec.d.ts.map
│   │   │       ├── deliveries.service.spec.js
│   │   │       └── deliveries.service.spec.js.map
│   │   ├── jest.config.js
│   │   ├── package.json
│   │   ├── src
│   │   │   ├── app.module.ts
│   │   │   ├── common
│   │   │   │   ├── driver-service.client.ts
│   │   │   │   ├── order-service.client.ts
│   │   │   │   └── system-token.service.ts
│   │   │   ├── config
│   │   │   │   ├── app-config.ts
│   │   │   │   └── config.module.ts
│   │   │   ├── controllers
│   │   │   │   ├── deliveries.controller.ts
│   │   │   │   └── health.controller.ts
│   │   │   ├── dto
│   │   │   │   └── create-delivery.dto.ts
│   │   │   ├── entities
│   │   │   │   └── delivery.entity.ts
│   │   │   ├── events
│   │   │   ├── main.ts
│   │   │   ├── modules
│   │   │   │   └── deliveries
│   │   │   │       └── deliveries.module.ts
│   │   │   ├── repositories
│   │   │   │   └── deliveries.repository.ts
│   │   │   └── services
│   │   │       ├── deliveries.service.spec.ts
│   │   │       └── deliveries.service.ts
│   │   └── tsconfig.json
│   ├── driver-service
│   │   ├── dist
│   │   │   ├── app.module.d.ts
│   │   │   ├── app.module.d.ts.map
│   │   │   ├── app.module.js
│   │   │   ├── app.module.js.map
│   │   │   ├── common
│   │   │   │   ├── driver-transition-rules.d.ts
│   │   │   │   ├── driver-transition-rules.d.ts.map
│   │   │   │   ├── driver-transition-rules.js
│   │   │   │   └── driver-transition-rules.js.map
│   │   │   ├── config
│   │   │   │   ├── app-config.d.ts
│   │   │   │   ├── app-config.d.ts.map
│   │   │   │   ├── app-config.js
│   │   │   │   ├── app-config.js.map
│   │   │   │   ├── config.module.d.ts
│   │   │   │   ├── config.module.d.ts.map
│   │   │   │   ├── config.module.js
│   │   │   │   └── config.module.js.map
│   │   │   ├── controllers
│   │   │   │   ├── drivers.controller.d.ts
│   │   │   │   ├── drivers.controller.d.ts.map
│   │   │   │   ├── drivers.controller.js
│   │   │   │   ├── drivers.controller.js.map
│   │   │   │   ├── health.controller.d.ts
│   │   │   │   ├── health.controller.d.ts.map
│   │   │   │   ├── health.controller.js
│   │   │   │   └── health.controller.js.map
│   │   │   ├── dto
│   │   │   │   ├── list-drivers-query.dto.d.ts
│   │   │   │   ├── list-drivers-query.dto.d.ts.map
│   │   │   │   ├── list-drivers-query.dto.js
│   │   │   │   ├── list-drivers-query.dto.js.map
│   │   │   │   ├── register-driver.dto.d.ts
│   │   │   │   ├── register-driver.dto.d.ts.map
│   │   │   │   ├── register-driver.dto.js
│   │   │   │   ├── register-driver.dto.js.map
│   │   │   │   ├── update-driver-status.dto.d.ts
│   │   │   │   ├── update-driver-status.dto.d.ts.map
│   │   │   │   ├── update-driver-status.dto.js
│   │   │   │   └── update-driver-status.dto.js.map
│   │   │   ├── entities
│   │   │   │   ├── driver.entity.d.ts
│   │   │   │   ├── driver.entity.d.ts.map
│   │   │   │   ├── driver.entity.js
│   │   │   │   └── driver.entity.js.map
│   │   │   ├── main.d.ts
│   │   │   ├── main.d.ts.map
│   │   │   ├── main.js
│   │   │   ├── main.js.map
│   │   │   ├── modules
│   │   │   │   └── drivers
│   │   │   │       ├── drivers.module.d.ts
│   │   │   │       ├── drivers.module.d.ts.map
│   │   │   │       ├── drivers.module.js
│   │   │   │       └── drivers.module.js.map
│   │   │   ├── repositories
│   │   │   │   ├── drivers.repository.d.ts
│   │   │   │   ├── drivers.repository.d.ts.map
│   │   │   │   ├── drivers.repository.js
│   │   │   │   └── drivers.repository.js.map
│   │   │   └── services
│   │   │       ├── drivers.service.d.ts
│   │   │       ├── drivers.service.d.ts.map
│   │   │       ├── drivers.service.js
│   │   │       ├── drivers.service.js.map
│   │   │       ├── drivers.service.spec.d.ts
│   │   │       ├── drivers.service.spec.d.ts.map
│   │   │       ├── drivers.service.spec.js
│   │   │       └── drivers.service.spec.js.map
│   │   ├── jest.config.js
│   │   ├── package.json
│   │   ├── src
│   │   │   ├── app.module.ts
│   │   │   ├── common
│   │   │   │   └── driver-transition-rules.ts
│   │   │   ├── config
│   │   │   │   ├── app-config.ts
│   │   │   │   └── config.module.ts
│   │   │   ├── controllers
│   │   │   │   ├── drivers.controller.ts
│   │   │   │   └── health.controller.ts
│   │   │   ├── dto
│   │   │   │   ├── list-drivers-query.dto.ts
│   │   │   │   ├── register-driver.dto.ts
│   │   │   │   └── update-driver-status.dto.ts
│   │   │   ├── entities
│   │   │   │   └── driver.entity.ts
│   │   │   ├── events
│   │   │   ├── main.ts
│   │   │   ├── modules
│   │   │   │   └── drivers
│   │   │   │       └── drivers.module.ts
│   │   │   ├── repositories
│   │   │   │   └── drivers.repository.ts
│   │   │   └── services
│   │   │       ├── drivers.service.spec.ts
│   │   │       └── drivers.service.ts
│   │   └── tsconfig.json
│   ├── menu-service
│   │   ├── dist
│   │   │   ├── app.module.d.ts
│   │   │   ├── app.module.d.ts.map
│   │   │   ├── app.module.js
│   │   │   ├── app.module.js.map
│   │   │   ├── common
│   │   │   │   ├── restaurant-service.client.d.ts
│   │   │   │   ├── restaurant-service.client.d.ts.map
│   │   │   │   ├── restaurant-service.client.js
│   │   │   │   └── restaurant-service.client.js.map
│   │   │   ├── config
│   │   │   │   ├── app-config.d.ts
│   │   │   │   ├── app-config.d.ts.map
│   │   │   │   ├── app-config.js
│   │   │   │   ├── app-config.js.map
│   │   │   │   ├── config.module.d.ts
│   │   │   │   ├── config.module.d.ts.map
│   │   │   │   ├── config.module.js
│   │   │   │   └── config.module.js.map
│   │   │   ├── controllers
│   │   │   │   ├── health.controller.d.ts
│   │   │   │   ├── health.controller.d.ts.map
│   │   │   │   ├── health.controller.js
│   │   │   │   ├── health.controller.js.map
│   │   │   │   ├── menu.controller.d.ts
│   │   │   │   ├── menu.controller.d.ts.map
│   │   │   │   ├── menu.controller.js
│   │   │   │   └── menu.controller.js.map
│   │   │   ├── dto
│   │   │   │   ├── create-category.dto.d.ts
│   │   │   │   ├── create-category.dto.d.ts.map
│   │   │   │   ├── create-category.dto.js
│   │   │   │   ├── create-category.dto.js.map
│   │   │   │   ├── create-menu-item.dto.d.ts
│   │   │   │   ├── create-menu-item.dto.d.ts.map
│   │   │   │   ├── create-menu-item.dto.js
│   │   │   │   ├── create-menu-item.dto.js.map
│   │   │   │   ├── update-availability.dto.d.ts
│   │   │   │   ├── update-availability.dto.d.ts.map
│   │   │   │   ├── update-availability.dto.js
│   │   │   │   ├── update-availability.dto.js.map
│   │   │   │   ├── update-menu-item.dto.d.ts
│   │   │   │   ├── update-menu-item.dto.d.ts.map
│   │   │   │   ├── update-menu-item.dto.js
│   │   │   │   └── update-menu-item.dto.js.map
│   │   │   ├── entities
│   │   │   │   ├── category.entity.d.ts
│   │   │   │   ├── category.entity.d.ts.map
│   │   │   │   ├── category.entity.js
│   │   │   │   ├── category.entity.js.map
│   │   │   │   ├── menu-item.entity.d.ts
│   │   │   │   ├── menu-item.entity.d.ts.map
│   │   │   │   ├── menu-item.entity.js
│   │   │   │   └── menu-item.entity.js.map
│   │   │   ├── main.d.ts
│   │   │   ├── main.d.ts.map
│   │   │   ├── main.js
│   │   │   ├── main.js.map
│   │   │   ├── modules
│   │   │   │   └── menu
│   │   │   │       ├── menu.module.d.ts
│   │   │   │       ├── menu.module.d.ts.map
│   │   │   │       ├── menu.module.js
│   │   │   │       └── menu.module.js.map
│   │   │   ├── repositories
│   │   │   │   ├── categories.repository.d.ts
│   │   │   │   ├── categories.repository.d.ts.map
│   │   │   │   ├── categories.repository.js
│   │   │   │   ├── categories.repository.js.map
│   │   │   │   ├── menu-items.repository.d.ts
│   │   │   │   ├── menu-items.repository.d.ts.map
│   │   │   │   ├── menu-items.repository.js
│   │   │   │   └── menu-items.repository.js.map
│   │   │   └── services
│   │   │       ├── menu.service.d.ts
│   │   │       ├── menu.service.d.ts.map
│   │   │       ├── menu.service.js
│   │   │       ├── menu.service.js.map
│   │   │       ├── menu.service.spec.d.ts
│   │   │       ├── menu.service.spec.d.ts.map
│   │   │       ├── menu.service.spec.js
│   │   │       └── menu.service.spec.js.map
│   │   ├── jest.config.js
│   │   ├── package.json
│   │   ├── src
│   │   │   ├── app.module.ts
│   │   │   ├── common
│   │   │   │   └── restaurant-service.client.ts
│   │   │   ├── config
│   │   │   │   ├── app-config.ts
│   │   │   │   └── config.module.ts
│   │   │   ├── controllers
│   │   │   │   ├── health.controller.ts
│   │   │   │   └── menu.controller.ts
│   │   │   ├── dto
│   │   │   │   ├── create-category.dto.ts
│   │   │   │   ├── create-menu-item.dto.ts
│   │   │   │   ├── update-availability.dto.ts
│   │   │   │   └── update-menu-item.dto.ts
│   │   │   ├── entities
│   │   │   │   ├── category.entity.ts
│   │   │   │   └── menu-item.entity.ts
│   │   │   ├── events
│   │   │   ├── main.ts
│   │   │   ├── modules
│   │   │   │   └── menu
│   │   │   │       └── menu.module.ts
│   │   │   ├── repositories
│   │   │   │   ├── categories.repository.ts
│   │   │   │   └── menu-items.repository.ts
│   │   │   └── services
│   │   │       ├── menu.service.spec.ts
│   │   │       └── menu.service.ts
│   │   └── tsconfig.json
│   ├── notification-service
│   │   ├── dist
│   │   │   ├── app.module.d.ts
│   │   │   ├── app.module.d.ts.map
│   │   │   ├── app.module.js
│   │   │   ├── app.module.js.map
│   │   │   ├── config
│   │   │   │   ├── app-config.d.ts
│   │   │   │   ├── app-config.d.ts.map
│   │   │   │   ├── app-config.js
│   │   │   │   ├── app-config.js.map
│   │   │   │   ├── config.module.d.ts
│   │   │   │   ├── config.module.d.ts.map
│   │   │   │   ├── config.module.js
│   │   │   │   └── config.module.js.map
│   │   │   ├── controllers
│   │   │   │   ├── health.controller.d.ts
│   │   │   │   ├── health.controller.d.ts.map
│   │   │   │   ├── health.controller.js
│   │   │   │   ├── health.controller.js.map
│   │   │   │   ├── notifications.controller.d.ts
│   │   │   │   ├── notifications.controller.d.ts.map
│   │   │   │   ├── notifications.controller.js
│   │   │   │   └── notifications.controller.js.map
│   │   │   ├── dto
│   │   │   │   ├── list-notifications-query.dto.d.ts
│   │   │   │   ├── list-notifications-query.dto.d.ts.map
│   │   │   │   ├── list-notifications-query.dto.js
│   │   │   │   └── list-notifications-query.dto.js.map
│   │   │   ├── entities
│   │   │   │   ├── notification.entity.d.ts
│   │   │   │   ├── notification.entity.d.ts.map
│   │   │   │   ├── notification.entity.js
│   │   │   │   └── notification.entity.js.map
│   │   │   ├── main.d.ts
│   │   │   ├── main.d.ts.map
│   │   │   ├── main.js
│   │   │   ├── main.js.map
│   │   │   ├── modules
│   │   │   │   ├── notifications.module.d.ts
│   │   │   │   ├── notifications.module.d.ts.map
│   │   │   │   ├── notifications.module.js
│   │   │   │   └── notifications.module.js.map
│   │   │   ├── repositories
│   │   │   │   ├── notifications.repository.d.ts
│   │   │   │   ├── notifications.repository.d.ts.map
│   │   │   │   ├── notifications.repository.js
│   │   │   │   └── notifications.repository.js.map
│   │   │   └── services
│   │   │       ├── notifications.service.d.ts
│   │   │       ├── notifications.service.d.ts.map
│   │   │       ├── notifications.service.js
│   │   │       └── notifications.service.js.map
│   │   ├── jest.config.js
│   │   ├── package.json
│   │   ├── src
│   │   │   ├── app.module.ts
│   │   │   ├── config
│   │   │   │   ├── app-config.ts
│   │   │   │   └── config.module.ts
│   │   │   ├── controllers
│   │   │   │   ├── health.controller.ts
│   │   │   │   └── notifications.controller.ts
│   │   │   ├── dto
│   │   │   │   └── list-notifications-query.dto.ts
│   │   │   ├── entities
│   │   │   │   └── notification.entity.ts
│   │   │   ├── main.ts
│   │   │   ├── modules
│   │   │   │   └── notifications.module.ts
│   │   │   ├── repositories
│   │   │   │   └── notifications.repository.ts
│   │   │   └── services
│   │   │       └── notifications.service.ts
│   │   └── tsconfig.json
│   ├── order-service
│   │   ├── dist
│   │   │   ├── app.module.d.ts
│   │   │   ├── app.module.d.ts.map
│   │   │   ├── app.module.js
│   │   │   ├── app.module.js.map
│   │   │   ├── common
│   │   │   │   ├── cart-service.client.d.ts
│   │   │   │   ├── cart-service.client.d.ts.map
│   │   │   │   ├── cart-service.client.js
│   │   │   │   ├── cart-service.client.js.map
│   │   │   │   ├── order-transition-rules.d.ts
│   │   │   │   ├── order-transition-rules.d.ts.map
│   │   │   │   ├── order-transition-rules.js
│   │   │   │   ├── order-transition-rules.js.map
│   │   │   │   ├── restaurant-service.client.d.ts
│   │   │   │   ├── restaurant-service.client.d.ts.map
│   │   │   │   ├── restaurant-service.client.js
│   │   │   │   └── restaurant-service.client.js.map
│   │   │   ├── config
│   │   │   │   ├── app-config.d.ts
│   │   │   │   ├── app-config.d.ts.map
│   │   │   │   ├── app-config.js
│   │   │   │   ├── app-config.js.map
│   │   │   │   ├── config.module.d.ts
│   │   │   │   ├── config.module.d.ts.map
│   │   │   │   ├── config.module.js
│   │   │   │   └── config.module.js.map
│   │   │   ├── controllers
│   │   │   │   ├── health.controller.d.ts
│   │   │   │   ├── health.controller.d.ts.map
│   │   │   │   ├── health.controller.js
│   │   │   │   ├── health.controller.js.map
│   │   │   │   ├── orders.controller.d.ts
│   │   │   │   ├── orders.controller.d.ts.map
│   │   │   │   ├── orders.controller.js
│   │   │   │   └── orders.controller.js.map
│   │   │   ├── dto
│   │   │   │   ├── list-orders-query.dto.d.ts
│   │   │   │   ├── list-orders-query.dto.d.ts.map
│   │   │   │   ├── list-orders-query.dto.js
│   │   │   │   ├── list-orders-query.dto.js.map
│   │   │   │   ├── update-order-status.dto.d.ts
│   │   │   │   ├── update-order-status.dto.d.ts.map
│   │   │   │   ├── update-order-status.dto.js
│   │   │   │   └── update-order-status.dto.js.map
│   │   │   ├── entities
│   │   │   │   ├── order-item.entity.d.ts
│   │   │   │   ├── order-item.entity.d.ts.map
│   │   │   │   ├── order-item.entity.js
│   │   │   │   ├── order-item.entity.js.map
│   │   │   │   ├── order.entity.d.ts
│   │   │   │   ├── order.entity.d.ts.map
│   │   │   │   ├── order.entity.js
│   │   │   │   └── order.entity.js.map
│   │   │   ├── main.d.ts
│   │   │   ├── main.d.ts.map
│   │   │   ├── main.js
│   │   │   ├── main.js.map
│   │   │   ├── modules
│   │   │   │   └── orders
│   │   │   │       ├── orders.module.d.ts
│   │   │   │       ├── orders.module.d.ts.map
│   │   │   │       ├── orders.module.js
│   │   │   │       └── orders.module.js.map
│   │   │   ├── repositories
│   │   │   │   ├── orders.repository.d.ts
│   │   │   │   ├── orders.repository.d.ts.map
│   │   │   │   ├── orders.repository.js
│   │   │   │   └── orders.repository.js.map
│   │   │   └── services
│   │   │       ├── orders.service.d.ts
│   │   │       ├── orders.service.d.ts.map
│   │   │       ├── orders.service.js
│   │   │       ├── orders.service.js.map
│   │   │       ├── orders.service.spec.d.ts
│   │   │       ├── orders.service.spec.d.ts.map
│   │   │       ├── orders.service.spec.js
│   │   │       └── orders.service.spec.js.map
│   │   ├── jest.config.js
│   │   ├── package.json
│   │   ├── src
│   │   │   ├── app.module.ts
│   │   │   ├── common
│   │   │   │   ├── cart-service.client.ts
│   │   │   │   ├── order-transition-rules.ts
│   │   │   │   └── restaurant-service.client.ts
│   │   │   ├── config
│   │   │   │   ├── app-config.ts
│   │   │   │   └── config.module.ts
│   │   │   ├── controllers
│   │   │   │   ├── health.controller.ts
│   │   │   │   └── orders.controller.ts
│   │   │   ├── dto
│   │   │   │   ├── list-orders-query.dto.ts
│   │   │   │   └── update-order-status.dto.ts
│   │   │   ├── entities
│   │   │   │   ├── order-item.entity.ts
│   │   │   │   └── order.entity.ts
│   │   │   ├── events
│   │   │   ├── main.ts
│   │   │   ├── modules
│   │   │   │   └── orders
│   │   │   │       └── orders.module.ts
│   │   │   ├── repositories
│   │   │   │   └── orders.repository.ts
│   │   │   └── services
│   │   │       ├── orders.service.spec.ts
│   │   │       └── orders.service.ts
│   │   └── tsconfig.json
│   ├── payment-service
│   │   ├── dist
│   │   │   ├── app.module.d.ts
│   │   │   ├── app.module.d.ts.map
│   │   │   ├── app.module.js
│   │   │   ├── app.module.js.map
│   │   │   ├── common
│   │   │   │   ├── order-service.client.d.ts
│   │   │   │   ├── order-service.client.d.ts.map
│   │   │   │   ├── order-service.client.js
│   │   │   │   ├── order-service.client.js.map
│   │   │   │   ├── system-token.service.d.ts
│   │   │   │   ├── system-token.service.d.ts.map
│   │   │   │   ├── system-token.service.js
│   │   │   │   └── system-token.service.js.map
│   │   │   ├── config
│   │   │   │   ├── app-config.d.ts
│   │   │   │   ├── app-config.d.ts.map
│   │   │   │   ├── app-config.js
│   │   │   │   ├── app-config.js.map
│   │   │   │   ├── config.module.d.ts
│   │   │   │   ├── config.module.d.ts.map
│   │   │   │   ├── config.module.js
│   │   │   │   └── config.module.js.map
│   │   │   ├── controllers
│   │   │   │   ├── health.controller.d.ts
│   │   │   │   ├── health.controller.d.ts.map
│   │   │   │   ├── health.controller.js
│   │   │   │   ├── health.controller.js.map
│   │   │   │   ├── payments.controller.d.ts
│   │   │   │   ├── payments.controller.d.ts.map
│   │   │   │   ├── payments.controller.js
│   │   │   │   └── payments.controller.js.map
│   │   │   ├── dto
│   │   │   │   ├── create-payment.dto.d.ts
│   │   │   │   ├── create-payment.dto.d.ts.map
│   │   │   │   ├── create-payment.dto.js
│   │   │   │   ├── create-payment.dto.js.map
│   │   │   │   ├── process-payment.dto.d.ts
│   │   │   │   ├── process-payment.dto.d.ts.map
│   │   │   │   ├── process-payment.dto.js
│   │   │   │   └── process-payment.dto.js.map
│   │   │   ├── entities
│   │   │   │   ├── payment.entity.d.ts
│   │   │   │   ├── payment.entity.d.ts.map
│   │   │   │   ├── payment.entity.js
│   │   │   │   └── payment.entity.js.map
│   │   │   ├── main.d.ts
│   │   │   ├── main.d.ts.map
│   │   │   ├── main.js
│   │   │   ├── main.js.map
│   │   │   ├── modules
│   │   │   │   └── payments
│   │   │   │       ├── payments.module.d.ts
│   │   │   │       ├── payments.module.d.ts.map
│   │   │   │       ├── payments.module.js
│   │   │   │       └── payments.module.js.map
│   │   │   ├── repositories
│   │   │   │   ├── payments.repository.d.ts
│   │   │   │   ├── payments.repository.d.ts.map
│   │   │   │   ├── payments.repository.js
│   │   │   │   └── payments.repository.js.map
│   │   │   └── services
│   │   │       ├── payments.service.d.ts
│   │   │       ├── payments.service.d.ts.map
│   │   │       ├── payments.service.js
│   │   │       ├── payments.service.js.map
│   │   │       ├── payments.service.spec.d.ts
│   │   │       ├── payments.service.spec.d.ts.map
│   │   │       ├── payments.service.spec.js
│   │   │       └── payments.service.spec.js.map
│   │   ├── jest.config.js
│   │   ├── package.json
│   │   ├── src
│   │   │   ├── app.module.ts
│   │   │   ├── common
│   │   │   │   ├── order-service.client.ts
│   │   │   │   └── system-token.service.ts
│   │   │   ├── config
│   │   │   │   ├── app-config.ts
│   │   │   │   └── config.module.ts
│   │   │   ├── controllers
│   │   │   │   ├── health.controller.ts
│   │   │   │   └── payments.controller.ts
│   │   │   ├── dto
│   │   │   │   ├── create-payment.dto.ts
│   │   │   │   └── process-payment.dto.ts
│   │   │   ├── entities
│   │   │   │   └── payment.entity.ts
│   │   │   ├── events
│   │   │   ├── main.ts
│   │   │   ├── modules
│   │   │   │   └── payments
│   │   │   │       └── payments.module.ts
│   │   │   ├── repositories
│   │   │   │   └── payments.repository.ts
│   │   │   └── services
│   │   │       ├── payments.service.spec.ts
│   │   │       └── payments.service.ts
│   │   └── tsconfig.json
│   ├── restaurant-service
│   │   ├── dist
│   │   │   ├── app.module.d.ts
│   │   │   ├── app.module.d.ts.map
│   │   │   ├── app.module.js
│   │   │   ├── app.module.js.map
│   │   │   ├── config
│   │   │   │   ├── app-config.d.ts
│   │   │   │   ├── app-config.d.ts.map
│   │   │   │   ├── app-config.js
│   │   │   │   ├── app-config.js.map
│   │   │   │   ├── config.module.d.ts
│   │   │   │   ├── config.module.d.ts.map
│   │   │   │   ├── config.module.js
│   │   │   │   └── config.module.js.map
│   │   │   ├── controllers
│   │   │   │   ├── health.controller.d.ts
│   │   │   │   ├── health.controller.d.ts.map
│   │   │   │   ├── health.controller.js
│   │   │   │   ├── health.controller.js.map
│   │   │   │   ├── restaurants.controller.d.ts
│   │   │   │   ├── restaurants.controller.d.ts.map
│   │   │   │   ├── restaurants.controller.js
│   │   │   │   └── restaurants.controller.js.map
│   │   │   ├── dto
│   │   │   │   ├── create-restaurant.dto.d.ts
│   │   │   │   ├── create-restaurant.dto.d.ts.map
│   │   │   │   ├── create-restaurant.dto.js
│   │   │   │   ├── create-restaurant.dto.js.map
│   │   │   │   ├── list-restaurants-query.dto.d.ts
│   │   │   │   ├── list-restaurants-query.dto.d.ts.map
│   │   │   │   ├── list-restaurants-query.dto.js
│   │   │   │   ├── list-restaurants-query.dto.js.map
│   │   │   │   ├── update-restaurant-status.dto.d.ts
│   │   │   │   ├── update-restaurant-status.dto.d.ts.map
│   │   │   │   ├── update-restaurant-status.dto.js
│   │   │   │   ├── update-restaurant-status.dto.js.map
│   │   │   │   ├── update-restaurant.dto.d.ts
│   │   │   │   ├── update-restaurant.dto.d.ts.map
│   │   │   │   ├── update-restaurant.dto.js
│   │   │   │   └── update-restaurant.dto.js.map
│   │   │   ├── entities
│   │   │   │   ├── restaurant.entity.d.ts
│   │   │   │   ├── restaurant.entity.d.ts.map
│   │   │   │   ├── restaurant.entity.js
│   │   │   │   └── restaurant.entity.js.map
│   │   │   ├── main.d.ts
│   │   │   ├── main.d.ts.map
│   │   │   ├── main.js
│   │   │   ├── main.js.map
│   │   │   ├── modules
│   │   │   │   └── restaurants
│   │   │   │       ├── restaurants.module.d.ts
│   │   │   │       ├── restaurants.module.d.ts.map
│   │   │   │       ├── restaurants.module.js
│   │   │   │       └── restaurants.module.js.map
│   │   │   ├── repositories
│   │   │   │   ├── restaurants.repository.d.ts
│   │   │   │   ├── restaurants.repository.d.ts.map
│   │   │   │   ├── restaurants.repository.js
│   │   │   │   └── restaurants.repository.js.map
│   │   │   └── services
│   │   │       ├── restaurants.service.d.ts
│   │   │       ├── restaurants.service.d.ts.map
│   │   │       ├── restaurants.service.js
│   │   │       ├── restaurants.service.js.map
│   │   │       ├── restaurants.service.spec.d.ts
│   │   │       ├── restaurants.service.spec.d.ts.map
│   │   │       ├── restaurants.service.spec.js
│   │   │       └── restaurants.service.spec.js.map
│   │   ├── jest.config.js
│   │   ├── package.json
│   │   ├── src
│   │   │   ├── app.module.ts
│   │   │   ├── config
│   │   │   │   ├── app-config.ts
│   │   │   │   └── config.module.ts
│   │   │   ├── controllers
│   │   │   │   ├── health.controller.ts
│   │   │   │   └── restaurants.controller.ts
│   │   │   ├── dto
│   │   │   │   ├── create-restaurant.dto.ts
│   │   │   │   ├── list-restaurants-query.dto.ts
│   │   │   │   ├── update-restaurant-status.dto.ts
│   │   │   │   └── update-restaurant.dto.ts
│   │   │   ├── entities
│   │   │   │   └── restaurant.entity.ts
│   │   │   ├── main.ts
│   │   │   ├── modules
│   │   │   │   └── restaurants
│   │   │   │       └── restaurants.module.ts
│   │   │   ├── repositories
│   │   │   │   └── restaurants.repository.ts
│   │   │   └── services
│   │   │       ├── restaurants.service.spec.ts
│   │   │       └── restaurants.service.ts
│   │   └── tsconfig.json
│   ├── tracking-service
│   │   ├── dist
│   │   │   ├── app.module.d.ts
│   │   │   ├── app.module.d.ts.map
│   │   │   ├── app.module.js
│   │   │   ├── app.module.js.map
│   │   │   ├── common
│   │   │   │   ├── delivery-service.client.d.ts
│   │   │   │   ├── delivery-service.client.d.ts.map
│   │   │   │   ├── delivery-service.client.js
│   │   │   │   ├── delivery-service.client.js.map
│   │   │   │   ├── driver-service.client.d.ts
│   │   │   │   ├── driver-service.client.d.ts.map
│   │   │   │   ├── driver-service.client.js
│   │   │   │   └── driver-service.client.js.map
│   │   │   ├── config
│   │   │   │   ├── app-config.d.ts
│   │   │   │   ├── app-config.d.ts.map
│   │   │   │   ├── app-config.js
│   │   │   │   ├── app-config.js.map
│   │   │   │   ├── config.module.d.ts
│   │   │   │   ├── config.module.d.ts.map
│   │   │   │   ├── config.module.js
│   │   │   │   └── config.module.js.map
│   │   │   ├── controllers
│   │   │   │   ├── health.controller.d.ts
│   │   │   │   ├── health.controller.d.ts.map
│   │   │   │   ├── health.controller.js
│   │   │   │   ├── health.controller.js.map
│   │   │   │   ├── tracking.controller.d.ts
│   │   │   │   ├── tracking.controller.d.ts.map
│   │   │   │   ├── tracking.controller.js
│   │   │   │   └── tracking.controller.js.map
│   │   │   ├── dto
│   │   │   │   ├── update-location.dto.d.ts
│   │   │   │   ├── update-location.dto.d.ts.map
│   │   │   │   ├── update-location.dto.js
│   │   │   │   └── update-location.dto.js.map
│   │   │   ├── entities
│   │   │   │   ├── location.model.d.ts
│   │   │   │   ├── location.model.d.ts.map
│   │   │   │   ├── location.model.js
│   │   │   │   └── location.model.js.map
│   │   │   ├── main.d.ts
│   │   │   ├── main.d.ts.map
│   │   │   ├── main.js
│   │   │   ├── main.js.map
│   │   │   ├── modules
│   │   │   │   └── tracking
│   │   │   │       ├── tracking.module.d.ts
│   │   │   │       ├── tracking.module.d.ts.map
│   │   │   │       ├── tracking.module.js
│   │   │   │       └── tracking.module.js.map
│   │   │   ├── repositories
│   │   │   │   ├── location.repository.d.ts
│   │   │   │   ├── location.repository.d.ts.map
│   │   │   │   ├── location.repository.js
│   │   │   │   └── location.repository.js.map
│   │   │   └── services
│   │   │       ├── tracking.service.d.ts
│   │   │       ├── tracking.service.d.ts.map
│   │   │       ├── tracking.service.js
│   │   │       ├── tracking.service.js.map
│   │   │       ├── tracking.service.spec.d.ts
│   │   │       ├── tracking.service.spec.d.ts.map
│   │   │       ├── tracking.service.spec.js
│   │   │       └── tracking.service.spec.js.map
│   │   ├── jest.config.js
│   │   ├── package.json
│   │   ├── src
│   │   │   ├── app.module.ts
│   │   │   ├── common
│   │   │   │   ├── delivery-service.client.ts
│   │   │   │   └── driver-service.client.ts
│   │   │   ├── config
│   │   │   │   ├── app-config.ts
│   │   │   │   └── config.module.ts
│   │   │   ├── controllers
│   │   │   │   ├── health.controller.ts
│   │   │   │   └── tracking.controller.ts
│   │   │   ├── dto
│   │   │   │   └── update-location.dto.ts
│   │   │   ├── entities
│   │   │   │   └── location.model.ts
│   │   │   ├── events
│   │   │   ├── main.ts
│   │   │   ├── modules
│   │   │   │   └── tracking
│   │   │   │       └── tracking.module.ts
│   │   │   ├── repositories
│   │   │   │   └── location.repository.ts
│   │   │   └── services
│   │   │       ├── tracking.service.spec.ts
│   │   │       └── tracking.service.ts
│   │   └── tsconfig.json
│   └── user-service
│       ├── dist
│       │   ├── app.module.d.ts
│       │   ├── app.module.d.ts.map
│       │   ├── app.module.js
│       │   ├── app.module.js.map
│       │   ├── common
│       │   │   ├── order-service.client.d.ts
│       │   │   ├── order-service.client.d.ts.map
│       │   │   ├── order-service.client.js
│       │   │   └── order-service.client.js.map
│       │   ├── config
│       │   │   ├── app-config.d.ts
│       │   │   ├── app-config.d.ts.map
│       │   │   ├── app-config.js
│       │   │   ├── app-config.js.map
│       │   │   ├── config.module.d.ts
│       │   │   ├── config.module.d.ts.map
│       │   │   ├── config.module.js
│       │   │   └── config.module.js.map
│       │   ├── controllers
│       │   │   ├── health.controller.d.ts
│       │   │   ├── health.controller.d.ts.map
│       │   │   ├── health.controller.js
│       │   │   ├── health.controller.js.map
│       │   │   ├── users.controller.d.ts
│       │   │   ├── users.controller.d.ts.map
│       │   │   ├── users.controller.js
│       │   │   └── users.controller.js.map
│       │   ├── dto
│       │   │   ├── create-profile.dto.d.ts
│       │   │   ├── create-profile.dto.d.ts.map
│       │   │   ├── create-profile.dto.js
│       │   │   ├── create-profile.dto.js.map
│       │   │   ├── update-profile.dto.d.ts
│       │   │   ├── update-profile.dto.d.ts.map
│       │   │   ├── update-profile.dto.js
│       │   │   └── update-profile.dto.js.map
│       │   ├── entities
│       │   │   ├── user-profile.entity.d.ts
│       │   │   ├── user-profile.entity.d.ts.map
│       │   │   ├── user-profile.entity.js
│       │   │   └── user-profile.entity.js.map
│       │   ├── main.d.ts
│       │   ├── main.d.ts.map
│       │   ├── main.js
│       │   ├── main.js.map
│       │   ├── modules
│       │   │   └── users
│       │   │       ├── users.module.d.ts
│       │   │       ├── users.module.d.ts.map
│       │   │       ├── users.module.js
│       │   │       └── users.module.js.map
│       │   ├── repositories
│       │   │   ├── profiles.repository.d.ts
│       │   │   ├── profiles.repository.d.ts.map
│       │   │   ├── profiles.repository.js
│       │   │   └── profiles.repository.js.map
│       │   └── services
│       │       ├── users.service.d.ts
│       │       ├── users.service.d.ts.map
│       │       ├── users.service.js
│       │       ├── users.service.js.map
│       │       ├── users.service.spec.d.ts
│       │       ├── users.service.spec.d.ts.map
│       │       ├── users.service.spec.js
│       │       └── users.service.spec.js.map
│       ├── jest.config.js
│       ├── package.json
│       ├── src
│       │   ├── app.module.ts
│       │   ├── common
│       │   │   └── order-service.client.ts
│       │   ├── config
│       │   │   ├── app-config.ts
│       │   │   └── config.module.ts
│       │   ├── controllers
│       │   │   ├── health.controller.ts
│       │   │   └── users.controller.ts
│       │   ├── dto
│       │   │   ├── create-profile.dto.ts
│       │   │   └── update-profile.dto.ts
│       │   ├── entities
│       │   │   └── user-profile.entity.ts
│       │   ├── main.ts
│       │   ├── modules
│       │   │   └── users
│       │   │       └── users.module.ts
│       │   ├── repositories
│       │   │   └── profiles.repository.ts
│       │   └── services
│       │       ├── users.service.spec.ts
│       │       └── users.service.ts
│       └── tsconfig.json
├── setup-gateway.ps1
├── shared
│   ├── dist
│   │   ├── errors
│   │   │   ├── app-error.d.ts
│   │   │   ├── app-error.d.ts.map
│   │   │   ├── app-error.js
│   │   │   └── app-error.js.map
│   │   ├── events
│   │   │   ├── base-event.d.ts
│   │   │   ├── base-event.d.ts.map
│   │   │   ├── base-event.js
│   │   │   ├── base-event.js.map
│   │   │   ├── delivery-events.d.ts
│   │   │   ├── delivery-events.d.ts.map
│   │   │   ├── delivery-events.js
│   │   │   ├── delivery-events.js.map
│   │   │   ├── index.d.ts
│   │   │   ├── index.d.ts.map
│   │   │   ├── index.js
│   │   │   ├── index.js.map
│   │   │   ├── order-events.d.ts
│   │   │   ├── order-events.d.ts.map
│   │   │   ├── order-events.js
│   │   │   ├── order-events.js.map
│   │   │   ├── payment-events.d.ts
│   │   │   ├── payment-events.d.ts.map
│   │   │   ├── payment-events.js
│   │   │   ├── payment-events.js.map
│   │   │   ├── topics.d.ts
│   │   │   ├── topics.d.ts.map
│   │   │   ├── topics.js
│   │   │   └── topics.js.map
│   │   ├── index.d.ts
│   │   ├── index.d.ts.map
│   │   ├── index.js
│   │   ├── index.js.map
│   │   ├── kafka
│   │   │   ├── index.d.ts
│   │   │   ├── index.d.ts.map
│   │   │   ├── index.js
│   │   │   ├── index.js.map
│   │   │   ├── kafka-consumer.service.d.ts
│   │   │   ├── kafka-consumer.service.d.ts.map
│   │   │   ├── kafka-consumer.service.js
│   │   │   ├── kafka-consumer.service.js.map
│   │   │   ├── kafka-producer.service.d.ts
│   │   │   ├── kafka-producer.service.d.ts.map
│   │   │   ├── kafka-producer.service.js
│   │   │   ├── kafka-producer.service.js.map
│   │   │   ├── kafka.module.d.ts
│   │   │   ├── kafka.module.d.ts.map
│   │   │   ├── kafka.module.js
│   │   │   └── kafka.module.js.map
│   │   ├── logging
│   │   │   ├── logger.d.ts
│   │   │   ├── logger.d.ts.map
│   │   │   ├── logger.js
│   │   │   └── logger.js.map
│   │   ├── nest
│   │   │   ├── auth
│   │   │   │   ├── jwt-auth.guard.d.ts
│   │   │   │   ├── jwt-auth.guard.d.ts.map
│   │   │   │   ├── jwt-auth.guard.js
│   │   │   │   ├── jwt-auth.guard.js.map
│   │   │   │   ├── jwt-payload.interface.d.ts
│   │   │   │   ├── jwt-payload.interface.d.ts.map
│   │   │   │   ├── jwt-payload.interface.js
│   │   │   │   ├── jwt-payload.interface.js.map
│   │   │   │   ├── roles.guard.d.ts
│   │   │   │   ├── roles.guard.d.ts.map
│   │   │   │   ├── roles.guard.js
│   │   │   │   └── roles.guard.js.map
│   │   │   ├── decorators
│   │   │   │   ├── current-user.decorator.d.ts
│   │   │   │   ├── current-user.decorator.d.ts.map
│   │   │   │   ├── current-user.decorator.js
│   │   │   │   └── current-user.decorator.js.map
│   │   │   ├── filters
│   │   │   │   ├── http-exception.filter.d.ts
│   │   │   │   ├── http-exception.filter.d.ts.map
│   │   │   │   ├── http-exception.filter.js
│   │   │   │   └── http-exception.filter.js.map
│   │   │   └── middleware
│   │   │       ├── correlation-id.middleware.d.ts
│   │   │       ├── correlation-id.middleware.d.ts.map
│   │   │       ├── correlation-id.middleware.js
│   │   │       └── correlation-id.middleware.js.map
│   │   ├── redis
│   │   │   ├── cache.service.d.ts
│   │   │   ├── cache.service.d.ts.map
│   │   │   ├── cache.service.js
│   │   │   ├── cache.service.js.map
│   │   │   ├── index.d.ts
│   │   │   ├── index.d.ts.map
│   │   │   ├── index.js
│   │   │   ├── index.js.map
│   │   │   ├── rate-limit.decorator.d.ts
│   │   │   ├── rate-limit.decorator.d.ts.map
│   │   │   ├── rate-limit.decorator.js
│   │   │   ├── rate-limit.decorator.js.map
│   │   │   ├── rate-limit.guard.d.ts
│   │   │   ├── rate-limit.guard.d.ts.map
│   │   │   ├── rate-limit.guard.js
│   │   │   ├── rate-limit.guard.js.map
│   │   │   ├── rate-limiter.service.d.ts
│   │   │   ├── rate-limiter.service.d.ts.map
│   │   │   ├── rate-limiter.service.js
│   │   │   ├── rate-limiter.service.js.map
│   │   │   ├── redis.module.d.ts
│   │   │   ├── redis.module.d.ts.map
│   │   │   ├── redis.module.js
│   │   │   └── redis.module.js.map
│   │   ├── types
│   │   │   ├── enums.d.ts
│   │   │   ├── enums.d.ts.map
│   │   │   ├── enums.js
│   │   │   ├── enums.js.map
│   │   │   ├── error-response.d.ts
│   │   │   ├── error-response.d.ts.map
│   │   │   ├── error-response.js
│   │   │   └── error-response.js.map
│   │   └── utils
│   │       ├── id.d.ts
│   │       ├── id.d.ts.map
│   │       ├── id.js
│   │       └── id.js.map
│   ├── package.json
│   ├── src
│   │   ├── errors
│   │   │   └── app-error.ts
│   │   ├── events
│   │   │   ├── base-event.ts
│   │   │   ├── delivery-events.ts
│   │   │   ├── index.ts
│   │   │   ├── order-events.ts
│   │   │   ├── payment-events.ts
│   │   │   └── topics.ts
│   │   ├── index.ts
│   │   ├── kafka
│   │   │   ├── index.ts
│   │   │   ├── kafka-consumer.service.ts
│   │   │   ├── kafka-producer.service.ts
│   │   │   └── kafka.module.ts
│   │   ├── logging
│   │   │   └── logger.ts
│   │   ├── nest
│   │   │   ├── auth
│   │   │   │   ├── jwt-auth.guard.ts
│   │   │   │   ├── jwt-payload.interface.ts
│   │   │   │   └── roles.guard.ts
│   │   │   ├── decorators
│   │   │   │   └── current-user.decorator.ts
│   │   │   ├── filters
│   │   │   │   └── http-exception.filter.ts
│   │   │   └── middleware
│   │   │       └── correlation-id.middleware.ts
│   │   ├── redis
│   │   │   ├── cache.service.ts
│   │   │   ├── index.ts
│   │   │   ├── rate-limit.decorator.ts
│   │   │   ├── rate-limit.guard.ts
│   │   │   ├── rate-limiter.service.ts
│   │   │   └── redis.module.ts
│   │   ├── types
│   │   │   ├── enums.ts
│   │   │   └── error-response.ts
│   │   └── utils
│   │       └── id.ts
│   └── tsconfig.json
├── structer.md
└── tsconfig.base.json

273 directories, 1050 files
