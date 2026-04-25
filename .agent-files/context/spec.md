# Project Specification - High-Ticket Showcase

## Tech Stack
- **Languages**: JavaScript/TypeScript (Node.js)
- **Frameworks**: 
    - Frontend/BFF: Nuxt (Recommended) or Next.js
    - Backend: ElysiaJS, NestJS, or Express (Under evaluation)
- **Database**: PostgreSQL (Primary), MongoDB (Secondary/Evaluation)
- **Infrastructure**: Docker, Docker Compose, Nginx (Optional)
- **Storage**: S3-compatible (MinIO, LocalStack)
- **Payments**: Stripe, MercadoPago, Efí Pay, or AbacatePay

## Core Architecture
- **Pattern**: Microservices
- **Entry Point**: Nginx reverse proxy routes all external traffic to the appropriate service.
- **Inter-Service Communication**: REST/HTTP over internal Docker network. Auth service exposes `/verify` consumed by other services to validate JWTs. No message broker in MVP scope.
- **Services**:
    - **Auth** (port 3001): Authentication and Authorization (Login, Logout, Token verification)
    - **Users** (port 3002): Identity management and permissions (Roles: Lojista, Cliente)
    - **Payment** (port 3003): Subscription plans and checkout flows for Lojistas
    - **Store** (port 3004): Core business logic for stores, products, and visit scheduling
    - **BFF/Frontend** (port 3000): Nuxt 3 app — SSR frontend + server routes as BFF proxy to backend services.

## Key Decisions
- **ORM**: Prisma (preferred for migrations, type-safety, and DX over TypeORM).
- **Framework**: NestJS for all backend services.
- **DB Isolation**: One PostgreSQL container, separate databases per service (`auth_db`, `users_db`, `store_db`, `payment_db`).
- **Auth Flow**: Auth service owns credential validation and JWT issuance. Other services call `POST /verify` on auth-service to validate tokens — no shared secret propagation.
- **Role Enforcement**: Store service calls user-service `/permissions/verify` to check Lojista role. BFF does not enforce business rules.

## Data Models & Entities
- **User**: ID, Email, PasswordHash, Role (Enum: admin | lojista | cliente), CreatedAt.
- **Store**: ID, Name, OwnerID (→ User), Description, LogoURL, CreatedAt.
- **Product**: ID, Name, Price, StoreID (→ Store), MediaURLs (string[]), CreatedAt.
- **PaymentPlan**: ID, Name, Price, Features (string[]), DurationDays.
- **Subscription**: ID, LojstaID (→ User), PlanID (→ PaymentPlan), Status, ExpiresAt.
- **Visit**: ID, ClientID (→ User), ProductID (→ Product), ScheduledAt, Status (Enum: pending | confirmed | cancelled).
