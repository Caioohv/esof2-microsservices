# Project Roadmap - High-Ticket Showcase

This roadmap outlines the development phases for the distributed showcase system.

## Phase 1: Foundation & Infrastructure
- [ ] Setup Docker Compose for core dependencies (PostgreSQL, MinIO).
- [ ] Define shared configurations (monorepo structure or individual repos).
- [ ] Implement initial CI/CD skeletons.

## Phase 2: Identity & Access Management (IAM)
- [ ] **Auth Service**: Implement JWT authentication, refresh tokens, and password hashing.
- [ ] **User Service**: Implement user profiles, roles (Lojista, Cliente), and permission management.

## Phase 3: Store & Product Management
- [ ] **Store Service**: Implement CRUD for stores (Lojas).
- [ ] **Product Catalog**: Implement CRUD for products, integrated with S3 for media storage.
- [ ] Initial search and filtering capabilities.

## Phase 4: Lead Generation & Scheduling
- [ ] **Visit System**: Implement scheduling logic for physical visits.
- [ ] Notification system for scheduled events.

## Phase 5: Monetization & Payments
- [ ] **Payment Service**: Integrate with payment gateways (Stripe/MercadoPago).
- [ ] Implement subscription plans for Lojistas.

## Phase 6: Frontend & Showcase Experience
- [ ] **Nuxt Frontend**: Build a premium showcase UI for high-ticket items.
- [ ] **BFF Integration**: Unified API layer for search and data aggregation.
