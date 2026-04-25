# Project Memory - High-Ticket Showcase

## Historical Decisions
- **Microservices Architecture**: Chosen to separate concerns (Auth, Payment, Store) and allow potential scaling/tech diversity.
- **Product focus**: High-ticket items only (Luxury cars, Real estate). Sales are not completed online; the platform acts as a showcase and lead generator (visits).
- **Nuxt Preference**: Recommended for the frontend/BFF layer for SEO and server-side capabilities.
- **Microservice Communication**: BFF will serve as a single entry point/orchestrator for the UI.

## Known Gotchas / Constraints
- **Non-Online Sales**: Logic must focus on lead generation (visits/scheduling) rather than full e-commerce checkout for goods.
- **Payment Scope**: Likely focused on Loja (Seller) subscriptions or listing fees rather than purchasing the luxury items themselves.
- **Permissions**: Clear separation between Lojista (Store owner) and Cliente (Buyer) is critical.

## Resolved Architecture Decisions
- **Framework**: NestJS chosen for all backend services (consistency, DI, module system).
- **ORM**: Prisma (better DX, type-safe migrations vs TypeORM).
- **DB Strategy**: Shared PostgreSQL container, isolated databases per service (not schemas).
- **Inter-service auth**: Services call auth-service `/verify` endpoint — no shared JWT secret in env vars per service.
- **Role check**: Business-layer role enforcement via user-service HTTP call, not BFF.
- **Nginx**: Included in infra as single entry point routing: `/auth` → auth-service, `/users` → user-service, `/store` → store-service, `/payment` → payment-service, `/` → bff.

## Technical Debt / Limitations
- No message broker (RabbitMQ/Kafka) in MVP — direct HTTP inter-service calls accepted.
- No separate dashboard for Lojistas vs Clientes in MVP — single Nuxt app with role-based routing.
