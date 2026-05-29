# Project Roadmap - High-Ticket Showcase

## 1. Vision Statement

Build a premium, distributed microservices platform that showcases high-ticket items (luxury cars, real estate) and connects high-net-worth clients with sellers through visit scheduling and product presentation.

---

## 2. Roadmap Phases

### Phase 1: Foundation & Infrastructure ✅
**Goal**: Establish the Docker-based infrastructure and project scaffolding for all services.
**Key Components**:
- Docker Compose with MySQL (auth-service) and PostgreSQL (shared, isolated databases per service)
- Nginx reverse proxy routing all external traffic to appropriate services
- Base environment variable templates (`.env.example`)
- Shared folder conventions and monorepo structure under `services/`

**Dependencies**: None.

---

### Phase 2: Identity & Access Management (IAM) — Partial ⚠️
**Goal**: Implement full identity stack — JWT authentication and granular, multi-store permission management.
**Key Components**:
- ✅ **Auth Service (3001)**: JWT issuance, refresh tokens, PBKDF2 password hashing, `/verify` endpoint for inter-service auth
- ⬜ **User Service (3002)**: User profiles, roles (Lojista/Cliente/Admin), granular permission scopes, multi-store access via `UserStoreRole`, invitation system

**Dependencies**: Phase 1 complete.

---

### Phase 3: Store & Product Management ⬜
**Goal**: Implement core business logic for stores and product catalogs.
**Key Components**:
- **Store Service (3004)**: CRUD for stores (`/stores`)
- **Product Catalog**: CRUD for products with S3/MinIO media upload
- Basic search and filtering by store and product attributes
- Inter-service call to user-service to enforce Lojista role on write operations

**Dependencies**: Phase 2 complete (user-service `/permissions/verify` must be available).

---

### Phase 4: Lead Generation & Scheduling ⬜
**Goal**: Implement the core value proposition — visit scheduling between Clientes and Lojistas.
**Key Components**:
- Visit scheduling endpoints in store-service (`/visits`)
- Status lifecycle: `pending → confirmed → cancelled`
- Notification hooks (email or webhook) on status transitions
- Client-side scheduling flow in the webapp

**Dependencies**: Phase 3 complete (products must exist to schedule visits).

---

### Phase 5: Monetization & Payments ⬜
**Goal**: Implement subscription-based monetization for Lojistas.
**Key Components**:
- **Payment Service (3003)**: Subscription plans (`PaymentPlan`, `Subscription` models)
- Gateway integration (Stripe or MercadoPago — decision deferred to implementation)
- Webhook handling for payment events
- Subscription status check in store-service before allowing product publication

**Dependencies**: Phase 2 complete (Lojista identity must exist).

---

### Phase 6: Frontend & Showcase Experience ⬜
**Goal**: Deliver a premium, SSR-rendered frontend showcasing the full platform.
**Key Components**:
- **Nuxt 4 BFF (3000)**: Server routes as BFF proxy aggregating user, store, and product data
- Product showcase pages (SSR for SEO)
- Visit scheduling UI
- Auth flow (login, registration, invitation acceptance)
- Role-based navigation (Lojista dashboard vs. Cliente browsing)
- Olimpo Design System fully applied

**Dependencies**: Phases 2–4 complete.

---

## 3. Architecture & Standards Alignment

- All backend services use **NestJS + Prisma + PostgreSQL** (auth-service uses Express + MySQL as legacy — migrate on refactor).
- Inter-service auth uses auth-service `/verify` — no shared JWT secrets across services.
- Nginx is the single external entry point; services are not directly exposed.
- Role enforcement lives in the business layer of each service (via user-service call), never in the BFF.
- Database isolation: one PostgreSQL container, separate databases (`users_db`, `store_db`, `payment_db`).

---

## 4. Success Criteria

- [x] Phase 1: Docker infrastructure running; auth-service and MySQL containerized
- [ ] Phase 2: User service operational; invitation flow end-to-end tested
- [ ] Phase 3: Store and product CRUD functional; S3 media upload working
- [ ] Phase 4: Visit scheduling flow working end-to-end with status transitions
- [ ] Phase 5: Subscription creation and payment webhook processing functional
- [ ] Phase 6: Full frontend live; role-based routing and SSR product pages working
- [ ] Integration between all phases validated via end-to-end test or manual walkthrough
- [ ] All services accessible through Nginx routing
