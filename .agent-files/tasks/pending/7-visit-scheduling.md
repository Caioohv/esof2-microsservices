# Task 7: Visit Scheduling System

**Goal**: Implement the visit scheduling feature — the core value proposition of the platform — allowing Clientes to book in-person visits to view high-ticket products.

**Roadmap Phase**: Phase 4: Lead Generation & Scheduling

**Context**: 
- This feature lives inside `store-service` (port 3004) — visits are closely tied to products and stores.
- A Visit links a Cliente (user) to a Product at a scheduled time.
- The Lojista must be able to confirm or cancel a visit request.
- Status flow: `pending` → `confirmed` | `cancelled`.

**Steps**:
1. Add the `Visit` Prisma model to `store-service` schema: `id, clientId, productId, scheduledAt, status (pending | confirmed | cancelled), notes, createdAt`.
2. Implement `POST /visit` — Cliente submits a visit request for a specific product. Requires valid JWT with `cliente` role.
3. Implement `GET /visit` — List visits. Lojistas see visits for their store products; Clientes see their own visits (filtered by JWT identity via auth-service `/verify`).
4. Implement `GET /visit/:id` — Get a single visit by ID.
5. Implement `PUT /visit/:id` — Update visit status. Only the owning Lojista can confirm/cancel; only the Cliente can cancel their own pending request.
6. Add basic email notification stub (console log or placeholder) for visit confirmation — real email integration is out of MVP scope.

**Acceptance criteria**:
- Cliente can create a visit request for a product.
- Lojista can list all pending visits for their store and confirm or cancel them.
- Cliente can list and cancel their own pending visits.
- Status transitions are enforced (e.g., cannot confirm an already-cancelled visit).
- Unauthorized users cannot access or modify visits.

**Files to create/modify**:
- [MODIFY] `services/store-service/prisma/schema.prisma` (add Visit model)
- [MODIFY] `services/store-service/src/` (add visit module, controller, service)

**Dependencies**:
- Task 4 (Store Service Bootstrap) must be complete.
- Task 3 (User Service Bootstrap) must be complete (to resolve clientId and verify roles).
