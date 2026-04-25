# Task 5: Frontend & BFF Foundation

**Goal**: Bootstrap the Nuxt application and the BFF layer to serve as the unified entry point for the showcase.

**Roadmap Phase**: Phase 6: Frontend & Showcase Experience

**Context**: 
- Project: `showcase-app`.
- Tech: Nuxt 3 + Tailwind CSS.
- Purpose: Showcase high-ticket items and provide a bridge to backend services.

**Steps**:
1. Initialize a Nuxt 3 project in `apps/showcase-app`.
2. Setup Tailwind CSS and Nuxt UI (as suggested in README).
3. Create a layout for the "Premium" showcase (dark mode, high-res images focus).
4. Implement basic routing: Home (Landing), Stores List, Product Gallery.
5. Setup the BFF layer (Server Engine in Nuxt) to proxy requests to Auth, User, and Store services.
6. Setup `Dockerfile` for the frontend.

**Acceptance criteria**:
- Frontend starts and shows a premium landing page.
- Able to navigate between catalog and store pages.
- BFF successfully fetches data from at least one backend service (e.g., Store list).

**Files to create/modify**:
- [NEW] `apps/showcase-app/`
- [MODIFY] `docker-compose.yml` (add showcase-app)

**Open questions**:
- Do we want a monolithic frontend for both Lojistas and Clientes, or separate dashboards?
