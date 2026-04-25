# Task 6: Payment Service Bootstrap

**Goal**: Initialize the Payment microservice to manage subscription plans and checkout flows for Lojistas.

**Roadmap Phase**: Phase 5: Monetization & Payments

**Context**: 
- Service name: `payment-service`.
- Framework: NestJS, port 3003.
- Payment gateway: Stripe (primary choice — supports webhooks, subscriptions, and checkout sessions).
- Responsibility: Lojistas pay to list their stores. Payment is NOT for end-customers buying products (those sales happen offline).

**Steps**:
1. Initialize a new NestJS project in `services/payment-service`.
2. Install `stripe` SDK and `@nestjs/config`.
3. Define entities: `Plan` (id, name, price, features, durationDays) and `Subscription` (id, lojistId, planId, status, expiresAt).
4. Implement `GET /plan` — list available plans.
5. Implement `POST /payment/checkout` — create a Stripe Checkout Session and return the redirect URL.
6. Implement `POST /payment/webhook` — handle Stripe webhook events (`checkout.session.completed`, `customer.subscription.deleted`) to update Subscription status.
7. Implement `GET /plan/status` — return the current subscription status for the authenticated Lojista (calls auth-service `/verify` to extract user ID from token).
8. Setup `Dockerfile` for the service.

**Acceptance criteria**:
- Payment service starts on port 3003.
- `GET /plan` returns a list of plans from the database.
- `POST /payment/checkout` returns a valid Stripe Checkout Session URL given a valid Lojista JWT.
- Stripe webhook correctly updates subscription status in the database.
- `GET /plan/status` returns correct subscription status for the calling Lojista.

**Files to create/modify**:
- [NEW] `services/payment-service/`
- [MODIFY] `docker-compose.yml` (add payment-service)

**Open questions**:
- Should the plan seed data be committed as a Prisma seed script or managed via an admin endpoint?
