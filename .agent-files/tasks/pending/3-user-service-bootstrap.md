# Task 3: User Service Bootstrap

**Goal**: Initialize the User microservice to handle user profiles, registrations, and roles (Lojista/Cliente).

**Roadmap Phase**: Phase 2: Identity & Access Management (IAM)

**Context**: 
- Service name: `user-service`.
- Framework: NestJS.
- Database: PostgreSQL (Shared or isolated).
- Responsibilities: User CRUD, Role assignment, Permissions.

**Steps**:
1. Initialize a new NestJS project in `services/user-service`.
2. Install TypeORM/Prisma for database interaction.
3. Define the `User` entity: id, email, password_hash, role (Enum), permissions.
4. Implement `/register` endpoint.
5. Implement `/me` endpoint (to be used by frontend via BFF).
6. Setup `Dockerfile` for the service.

**Acceptance criteria**:
- User service starts on a dedicated port (e.g., 3002).
- Can successfully register a new user and retrieve their data.
- Database contains the `users` table with correct columns.

**Files to create/modify**:
- [NEW] `services/user-service/`
- [MODIFY] `docker-compose.yml` (add user-service)

**Open questions**:
- Should we use Prisma or TypeORM for database migrations? (README mentions PostgreSQL).
