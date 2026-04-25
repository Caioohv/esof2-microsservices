# Task 2: Auth Service Bootstrap

**Goal**: Initialize the Authentication microservice using NestJS to handle user login and token generation.

**Roadmap Phase**: Phase 2: Identity & Access Management (IAM)

**Context**: 
- Service name: `auth-service`.
- Framework: NestJS (Preferred for microservices logic).
- Responsibilities: JWT generation, Login, Logout, Refresh Tokens.

**Steps**:
1. Initialize a new NestJS project in `services/auth-service`.
2. Install necessary dependencies: `@nestjs/jwt`, `passport-jwt`, `bcrypt`.
3. Configure `JwtModule` with a secret and expiration time.
4. Implement `/login` endpoint (validates credentials against User service or direct DB for POC).
5. Implement `/verify` endpoint for token validation (used by other services).
6. Setup `Dockerfile` for the service.

**Acceptance criteria**:
- Auth service starts on a dedicated port (e.g., 3001).
- `/login` returns a valid JWT given correct credentials.
- `/verify` returns 200/401 based on token validity.

**Files to create/modify**:
- [NEW] `services/auth-service/`
- [MODIFY] `docker-compose.yml` (add auth-service)

**Open questions**:
- Will the Auth service manage the user credentials database directly, or will it talk to the User service via gRPC/RabbitMQ?
