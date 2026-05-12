# Task 1: Infrastructure Setup

**Goal**: Setup the local development environment using Docker Compose to provide PostgreSQL and S3-compatible storage (MinIO).

**Roadmap Phase**: Phase 1: Foundation & Infrastructure

**Context**: 
- The project follows a microservices architecture.
- Database: PostgreSQL (Multiple databases or one shared instance with multiple schemas).
- Storage: MinIO (S3-compatible) for product images.

**Steps**:
1. Create a `docker-compose.yml` file at the root.
2. Define a `db` service using the `postgres:16` image.
3. Define a `minio` service using the `minio/minio` image.
4. Define an `nginx` service using the `nginx:alpine` image as the single entry point.
5. Create `nginx/nginx.conf` with upstream proxy rules: `/auth` → auth-service:3001, `/users` → user-service:3002, `/store` → store-service:3004, `/payment` → payment-service:3003, `/` → bff:3000.
6. Create `scripts/init-db.sh` to initialize four databases: `auth_db`, `users_db`, `store_db`, `payment_db`.
7. Setup environment variables (`.env.example`) for database credentials, S3 access keys, and JWT secret.

**Acceptance criteria**:
- `docker compose up -d` starts PostgreSQL, MinIO, and Nginx without errors.
- All four databases exist and are accessible.
- MinIO console accessible at `http://localhost:9001`.
- Nginx is accessible at `http://localhost:80`.

**Files to create/modify**:
- [NEW] `docker-compose.yml`
- [NEW] `.env.example`
- [NEW] `nginx/nginx.conf`
- [NEW] `scripts/init-db.sh`
