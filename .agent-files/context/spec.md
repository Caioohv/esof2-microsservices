# Project Specification - High-Ticket Showcase

## Tech Stack
- **Languages**: TypeScript (Node.js)
- **Frameworks**:
  - Frontend/BFF: Nuxt 4 + Vue 3
  - Backend Services: NestJS
- **Database**: PostgreSQL (primary), MySQL (auth-service legacy — migrate on next refactor)
- **ORM**: Prisma
- **Infrastructure**: Docker, Docker Compose, Nginx
- **Storage**: S3-compatible (MinIO)
- **Payments**: Stripe, MercadoPago, Efí Pay, or AbacatePay

## Core Architecture
- **Pattern**: Microservices with database-per-service isolation
- **Entry Point**: Nginx reverse proxy — routes all external traffic:
  - `/auth/*` → auth-service (3001)
  - `/users/*` → user-service (3002)
  - `/payment/*` → payment-service (3003)
  - `/store/*` → store-service (3004)
  - `/*` → webapp/BFF (3000)
- **Inter-Service Communication**: REST/HTTP over internal Docker network. No message broker in MVP.
- **Auth Flow**: Auth service owns credential validation and JWT issuance. All other services call `POST /auth/verify` to validate tokens — no shared JWT secret propagated to other services.
- **Role Enforcement**: Business-layer only, via user-service `POST /permissions/verify` call. BFF enforces nothing.

## Services

| Service | Port | Status | Framework | DB |
|---------|------|--------|-----------|-----|
| webapp (BFF) | 3000 | In Progress | Nuxt 4 | — |
| auth-service | 3001 | Complete | Express + Prisma | MySQL |
| user-service | 3002 | Pending | NestJS + Prisma | PostgreSQL |
| payment-service | 3003 | Pending | NestJS + Prisma | PostgreSQL |
| store-service | 3004 | Pending | NestJS + Prisma | PostgreSQL |

## Key Decisions (Locked)
- **ORM**: Prisma — type-safe migrations, superior DX over TypeORM.
- **Backend Framework**: NestJS for all new backend services — DI, module system, consistency.
- **DB Strategy**: One PostgreSQL container, isolated databases per service (`users_db`, `store_db`, `payment_db`). Auth uses its own MySQL container (legacy).
- **Auth**: No shared JWT secret. All verification goes through auth-service `/verify` endpoint.
- **Role Check**: user-service HTTP call from business layer, not BFF.

## Data Models & Entities
- **User**: id, email, password_hash, created_at, updated_at
- **Store**: id, name, owner_id (→ User), description, logo_url, created_at
- **Product**: id, name, price, store_id (→ Store), media_urls (string[]), created_at
- **PaymentPlan**: id, name, price, features (string[]), duration_days
- **Subscription**: id, lojista_id (→ User), plan_id (→ PaymentPlan), status, expires_at
- **Visit**: id, client_id (→ User), product_id (→ Product), scheduled_at, status (pending | confirmed | cancelled)
- **Permission**: id, scope (string), description
- **Role**: id, name, permissions (M2M with Permission)
- **UserStoreRole**: id, user_id, store_id, role_id, additional_permissions (JSON)
- **Invitation**: id, store_id, role_id, email, additional_permissions, token (unique), expires_at, used_at
