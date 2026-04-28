# Task 2: Auth Service Bootstrap

**Goal**: Initialize the Authentication microservice using Express to handle user login and token generation.

**Roadmap Phase**: Phase 2: Identity & Access Management (IAM)

**Context**: 
- Service name: `auth-service`.
- Framework: Express (Node.js).
- Database: MySQL (mysql2 driver).
- Hashing: Node.js built-in `crypto` (PBKDF2).
- Responsibilities: JWT generation, Login, Logout, Refresh Tokens, Credential storage.
- Auth service owns the `credentials` and `refresh_tokens` tables.
- Other services verify tokens via `POST /verify`.
- `POST /register` is an internal endpoint called by user-service to store credentials.

**Steps**:
- [x] Initialize Express project in `services/auth-service`.
- [x] Install dependencies: `express`, `jsonwebtoken`, `mysql2`.
- [x] Implement `POST /login` — validate credentials, issue access + refresh tokens.
- [x] Implement `POST /logout` — revoke refresh token.
- [x] Implement `POST /refresh` — issue new access token from valid refresh token.
- [x] Implement `POST /verify` — validate access token, return user info.
- [x] Implement `POST /register` — internal endpoint for credential creation.
- [x] Setup `init.sql` with `credentials` and `refresh_tokens` tables.
- [x] Setup `Dockerfile` for the service.
- [x] Add auth-service to `docker-compose.yml`.

**Acceptance criteria**:
- Auth service starts on port 3001.
- `POST /login` returns `access_token` + `refresh_token` given valid credentials.
- `POST /verify` returns 200 + user payload or 401.
- `POST /refresh` returns new access token from valid refresh token.
- `POST /logout` deletes refresh token from DB.

**Files created/modified**:
- [NEW] `services/auth-service/`
- [NEW] `docker-compose.yml`
- [NEW] `.env.example`
