# Task 3: User Service Bootstrap

**Goal**: Initialize the User microservice to handle user profiles, registrations, and roles (Lojista/Cliente).

**Roadmap Phase**: Phase 2: Identity & Access Management (IAM)

**Context**: 
- Service name: `user-service`.
- Framework: NestJS.
- Database: PostgreSQL (with Prisma ORM).
- Responsibilities: User CRUD, granular permission management, multi-store access, invitation/onboarding system.
- Permission model: Support multi-tenant access (e.g., user can be owner of Store A, manager at Store B, employee at Store C with specific permissions).

**Granular Permissions Model**:
Each user can have multiple roles across different stores:
- **Permission Scopes** (e.g., `visits:read`, `visits:create`, `visits:update`, `ads:read`, `ads:create`, `ads:delete`).
- **Roles** (predefined sets of scopes): Owner, Manager, VisitAgent, AdvertisementManager, etc.
- **UserStoreRole**: Junction table linking User → Store → Role with additive custom permissions.
  - Base role defines a minimum set of scopes.
  - Custom scopes in `additional_permissions` (JSON array) add extra scopes beyond the role.

**Invitation System**:
- Store owner can create invitations without requiring invitee to have an existing account.
- **Invitation**: id, storeId, roleId, email, additional_permissions, token, expires_at, used_at.
- Invitee receives a link with token → creates account → invitation auto-links them to store.
- A user account can accept invitations from multiple stores → same person manages multiple stores.

Example use case:
- Lojista (owner) of Store A: has all permissions.
- Lojista invites João (joão@mail.com) as VisitAgent to Store A.
- João creates account → gets `visits:read`, `visits:create` automatically.
- Later, Lojista of Store B invites João as Manager → João now has access to both stores with different permissions.

**Steps**:
1. Initialize a new NestJS project in `services/user-service`.
2. Setup Prisma ORM and PostgreSQL connection.
3. Define Prisma models:
   - `User`: id, email, password_hash, created_at, updated_at.
   - `Permission`: id, scope (string), description.
   - `Role`: id, name, permissions (M2M with Permission).
   - `UserStoreRole`: id, userId, storeId, roleId, additional_permissions (JSON array for additive scopes).
   - `Invitation`: id, storeId, roleId, email, additional_permissions, token (unique), expires_at, used_at.
4. Implement `/register` endpoint (create User).
5. Implement `/invitations/accept?token=X` endpoint (accept invitation → create UserStoreRole).
6. Implement `/me` endpoint (return user + all store accesses with full permission list).
7. Implement `/stores/:storeId/team` endpoint (list all users + roles for a store, owner-only).
8. Implement `/stores/:storeId/invitations` endpoints (POST create, GET list, DELETE revoke).
9. Implement permission checking middleware/decorator: `@RequirePermission('scope', 'storeId')`.
10. Setup `Dockerfile` for the service.

**Acceptance criteria**:
- User service starts on a dedicated port (e.g., 3002).
- User can register and access `GET /me` (returns user + all store accesses + full permission list).
- Store owner can create invitation: `POST /stores/{storeId}/invitations` with email + roleId.
- Invitee receives token, creates account via `/register` or uses existing account.
- Invitee accepts invitation: `GET /invitations/accept?token=X` → links to store with role + additional_permissions.
- Permission decorator `@RequirePermission('scope', 'storeId')` enforces scopes per store.
- Example: João has `visits:read, visits:create, ads:read` in Store A but only `ads:read` in Store B.
- Database contains: `users`, `permissions`, `roles`, `role_permissions`, `user_store_roles`, `invitations` tables.

**Files to create/modify**:
- [NEW] `services/user-service/` (NestJS project with Prisma)
- [NEW] `services/user-service/prisma/schema.prisma`
- [NEW] `services/user-service/src/modules/` (users, roles, invitations, permissions)
- [NEW] `services/user-service/src/decorators/require-permission.decorator.ts`
- [MODIFY] `docker-compose.yml` (add user-service + postgres)
