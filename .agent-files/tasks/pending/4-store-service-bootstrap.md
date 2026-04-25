# Task 4: Store Service Bootstrap

**Goal**: Initialize the Store microservice to manage store catalogs, products, and media integration.

**Roadmap Phase**: Phase 3: Store & Product Management

**Context**: 
- Service name: `store-service`.
- Framework: NestJS.
- Responsibilities: Store CRUD, Product CRUD, Image upload coordination with MinIO.

**Steps**:
1. Initialize a new NestJS project in `services/store-service`.
2. Define entities: `Store` (name, description, owner_id) and `Product` (name, price, store_id, images[]).
3. Implement Store CRUD endpoints.
4. Implement Product CRUD endpoints.
5. Integrate with MinIO/S3 for product image storage (using a shared storage client or library).
6. Setup `Dockerfile` for the service.

**Acceptance criteria**:
- Store service starts on a dedicated port (e.g., 3004).
- Lojista can create a store and add products to it.
- Product images are correctly uploaded and retrieved from MinIO.

**Files to create/modify**:
- [NEW] `services/store-service/`
- [MODIFY] `docker-compose.yml` (add store-service)

**Open questions**:
- How will the Store service verify if a user has the `Lojista` role? (BFF check vs service-to-service call).
