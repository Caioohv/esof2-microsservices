# 🗺️ Architecture Map - Complete Guide

## 📊 Visual Representations

### 1. **Architecture Diagram (SVG)**
**File:** [`ARCHITECTURE.svg`](./ARCHITECTURE.svg)

Visual representation of the entire system showing:
- Client layer (Frontend/BFF)
- API Gateway (Nginx)
- Microservices with ports and technologies
- Data layer (PostgreSQL, MinIO, Redis)
- Key architectural decisions in side panel
- Communication patterns

**Best for:** Understanding the overall structure at a glance

---

### 2. **Detailed Architecture Guide (Markdown)**
**File:** [`ARCHITECTURE.md`](./ARCHITECTURE.md)

Comprehensive documentation covering:
- Layer-by-layer breakdown of each component
- Service responsibilities and endpoints
- Communication flows with diagrams
- Architectural decision rationale
- Security considerations
- Deployment strategy
- Roadmap by phase

**Best for:** Deep understanding and implementation guidance

---

### 3. **Machine-Readable Schema (YAML)**
**File:** [`architecture.yaml`](./architecture.yaml)

Structured data format containing:
- Complete system specification
- Technology stack details
- Service definitions (ports, databases, endpoints)
- Architectural decisions with rationale
- Data models
- Communication patterns
- Roadmap phases
- Security configurations

**Best for:** Automation, validation, code generation

---

## 🎯 Quick Navigation

### By Role

#### 👨‍💼 **Project Manager / Stakeholder**
1. Start: [ARCHITECTURE.md - Overview](./ARCHITECTURE.md#overview)
2. Review: [Roadmap](./ARCHITECTURE.md#-roadmap-por-fase)
3. Reference: [ARCHITECTURE.svg](./ARCHITECTURE.svg) (visual overview)

#### 👨‍💻 **Backend Developer**
1. Study: [ARCHITECTURE.md - Microservices](./ARCHITECTURE.md#camada-3-microserviços-microservices-layer)
2. Check: Service-specific documentation:
   - [Auth Service Docs](./services/auth/README.md)
   - User Service (TBD)
   - Store Service (TBD)
   - Payment Service (TBD)
3. Reference: [Communication Flows](./ARCHITECTURE.md#-fluxos-de-comunicação)
4. Implement: Use [architecture.yaml](./architecture.yaml) for exact specs

#### 🎨 **Frontend Developer**
1. Review: [Frontend Architecture](./ARCHITECTURE.md#frontend-architecture)
2. Understand: [BFF Pattern](./ARCHITECTURE.md#-fluxos-de-comunicação)
3. Check: [Fluxo de Requisição Autenticada](./ARCHITECTURE.md#fluxo-2-requisição-autenticada)
4. Integrate: Follow [Auth Service Integration Guide](./services/auth/INTEGRATION.md#integração-no-frontend)

#### 🛠️ **DevOps / Infrastructure**
1. Review: [Data Layer](./ARCHITECTURE.md#camada-4-dados-data-layer)
2. Setup: [Docker deployment](./ARCHITECTURE.md#-deploy)
3. Configure: Use [architecture.yaml](./architecture.yaml) for service specs
4. Monitor: [Security & Monitoring](./ARCHITECTURE.md#-segurança)

#### 🔒 **Security / Compliance**
1. Study: [Security Section](./ARCHITECTURE.md#-segurança)
2. Verify: [Auth Flow](./ARCHITECTURE.md#fluxo-2-requisição-autenticada)
3. Reference: [Data Models](./architecture.yaml#data_models)

---

## 📚 Documentation Structure

```
docs/
├── ARCHITECTURE.md              # 📖 Main guide (detailed)
├── ARCHITECTURE.svg             # 🖼️ Visual diagram
├── architecture.yaml            # 📋 Machine-readable spec
├── ARCHITECTURE_INDEX.md        # 📍 This file
│
├── services/
│   └── auth/
│       ├── README.md            # Overview & quick start
│       ├── SETUP.md             # Installation & configuration
│       ├── API.md               # Complete endpoint reference
│       ├── INTEGRATION.md       # Integration guides (all languages)
│       └── FLOW.md              # Authentication flow diagrams
│
└── uml/
    ├── microsservices.md        # Service relationships
    ├── comunicacao.md           # Communication patterns
    └── pubsub.md                # Pub/Sub architecture (future)
```

---

## 🔑 Key Architectural Decisions at a Glance

| Decision | What | Why | Trade-off |
|----------|------|-----|-----------|
| **Microservices** | Independent services per domain | Scalability, parallel teams | Higher operational complexity |
| **Auth Centralized** | Single Auth Service validates all | Single source of truth | Extra network hop |
| **DB per Service** | Each service has own database | Loose coupling | Eventual consistency |
| **REST Communication** | HTTP/REST between services | Simple, MVP-ready | No async messaging |
| **Nuxt Frontend + BFF** | SSR with aggregation routes | SEO + simplified APIs | Node.js runtime needed |
| **NestJS Backend** | Standard framework for services | Type-safety, consistency | Slightly heavier |
| **Prisma ORM** | Type-safe database layer | TypeScript integration, migrations | Vendor specificity |

---

## 🏛️ System Layers Visualization

```
┌─────────────────────────────────────────────────────┐
│  🌐 CLIENT LAYER                                    │
│  Frontend/BFF (Nuxt 3) - Port 3000                  │
└─────────────────┬───────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────┐
│  🔀 API GATEWAY LAYER                               │
│  Nginx Reverse Proxy - Ports 80/443                 │
└─────────────────┬───────────────────────────────────┘
                  │
    ┌─────────────┼─────────────┬────────────────┐
    │             │             │                │
┌───▼──┐  ┌──────▼──┐  ┌──────▼──┐  ┌──────────▼──┐
│ 🔐   │  │  👥    │  │  🏪    │  │  💳        │
│ Auth │  │ User   │  │ Store  │  │ Payment    │
│ 3001 │  │ 3002   │  │ 3004   │  │ 3003       │
│      │  │        │  │        │  │            │
└──┬───┘  └──┬─────┘  └──┬─────┘  └────┬───────┘
   │         │          │              │
   │ auth_db │ users_db │ store_db     │ payment_db
   │         │          │              │
   └─┬───────┴──────────┴──────────────┘
     │
┌────▼──────────────────────────────────────────────┐
│  💾 DATA LAYER                                    │
│  PostgreSQL + MinIO + Redis (opt)                │
└─────────────────────────────────────────────────┘
```

---

## 🚀 Service Endpoints Quick Reference

### Auth Service (3001)
```
POST   /login              - Authenticate user
POST   /refresh            - Renew access token
POST   /verify             - Validate token (internal)
POST   /logout             - Revoke refresh token
POST   /register           - Register credentials (internal)
```

### User Service (3002) - *Planned*
```
POST   /users              - Create user
GET    /users/:id          - Get profile
PATCH  /users/:id          - Update profile
POST   /permissions/verify - Check role/permission
```

### Store Service (3004) - *Planned*
```
POST   /stores             - Create store
GET    /stores/:id         - Get store details
PATCH  /stores/:id         - Update store
POST   /products           - Create product
GET    /products           - List products
POST   /visits             - Schedule visit
GET    /visits/:id         - Get visit details
PATCH  /visits/:id         - Update visit status
```

### Payment Service (3003) - *Planned*
```
GET    /plans              - List subscription plans
POST   /subscriptions      - Create subscription
GET    /subscriptions/:id  - Get subscription details
PATCH  /subscriptions/:id  - Update subscription
POST   /checkout           - Initiate checkout
POST   /webhooks/payment   - Payment gateway webhook
```

---

## 🔄 Main Communication Flows

### 1. **Authentication Flow**
```
User → Frontend → BFF → Nginx → Auth Service
                                ↓
                        Validate credentials
                                ↓
                        Generate JWT tokens
                                ↓
← ← ← ← ← ← ← ← ← ← ← ← Return tokens
                                
User stores tokens locally
```

### 2. **Authenticated Request Flow**
```
User (with token) → Frontend → BFF → Nginx → Service X
                                              ↓
                                    Call Auth /verify
                                    ↓
                                    (valid?) → Call User /permissions/verify
                                    ↓
                                    Process request
                                    ↓
← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← Return response
```

### 3. **New User Registration Flow**
```
User Data → Frontend → BFF
                       ├─→ User Service (create user) → users_db
                       │
                       └─→ Auth Service (register) → auth_db
                       ↓
            User ready to login
```

---

## 📅 Development Phases

| Phase | Focus | Status |
|-------|-------|--------|
| **Phase 1** | Infrastructure setup | In Progress |
| **Phase 2** | Identity & Access (Auth + User) | In Progress |
| **Phase 3** | Store & Products | Planned |
| **Phase 4** | Scheduling & Leads | Planned |
| **Phase 5** | Monetization (Payments) | Planned |
| **Phase 6** | Frontend Excellence | Planned |

---

## 🔗 Cross-References

### Service Documentation
- **[Auth Service Complete Docs](./services/auth/README.md)** - All you need to know about authentication
- **[Auth API Reference](./services/auth/API.md)** - Endpoint by endpoint
- **[Auth Integration Guide](./services/auth/INTEGRATION.md)** - How to use from your code
- **[Auth Flow Diagrams](./services/auth/FLOW.md)** - How authentication works

### UML Diagrams
- **[Microservices Relationships](./uml/microsservices.md)**
- **[Inter-Service Communication](./uml/comunicacao.md)**
- **[Event Architecture (Future)](./uml/pubsub.md)**

### Project Files
- **[Project Spec](../.agent-files/context/spec.md)** - Technical requirements
- **[Project Goals](../.agent-files/context/goals.md)** - Vision and objectives
- **[Project Roadmap](../.agent-files/context/roadmap.md)** - Timelines

---

## 💡 How to Use This Documentation

### Scenario 1: "I need to understand the system"
1. View [`ARCHITECTURE.svg`](./ARCHITECTURE.svg) (2 min)
2. Read [`ARCHITECTURE.md` - Overview section](./ARCHITECTURE.md#overview) (5 min)
3. Review [`architecture.yaml`](./architecture.yaml) sections as needed

### Scenario 2: "I'm building a new microservice"
1. Read [`ARCHITECTURE.md` - Microservices section](./ARCHITECTURE.md#camada-3-microserviços-microservices-layer)
2. Check existing service (Auth) as template
3. Follow [`architecture.yaml`](./architecture.yaml) for exact specs (ports, databases, etc.)

### Scenario 3: "I'm integrating with Auth Service"
1. Start: [`Auth Service README`](./services/auth/README.md)
2. Reference: [`Auth API Reference`](./services/auth/API.md)
3. Implement: [`Auth Integration Guide`](./services/auth/INTEGRATION.md) for your stack

### Scenario 4: "I need to deploy this"
1. Understand: [`ARCHITECTURE.md` - Data Layer](./ARCHITECTURE.md#camada-4-dados-data-layer)
2. Check: [`ARCHITECTURE.md` - Deploy section](./ARCHITECTURE.md#-deploy)
3. Reference: [`architecture.yaml` - deployment section](./architecture.yaml#deployment)

### Scenario 5: "I'm reviewing architecture decisions"
1. Read: [`ARCHITECTURE.md` - Key Decisions](./ARCHITECTURE.md#-decisões-arquiteturais-principais)
2. Compare: Trade-offs section

---

## 🎯 Success Metrics

This architecture aims for:
- ✅ **Seamless Integration** - Services work together smoothly
- ✅ **Fast APIs** - Sub-200ms response times
- ✅ **High Availability** - 99.9% uptime
- ✅ **Premium UX** - Responsive, beautiful interface
- ✅ **Maintainability** - Clear patterns, easy to extend
- ✅ **Scalability** - Handle growth without redesign

---

## 📞 Questions?

### Architecture Questions
→ See [`ARCHITECTURE.md`](./ARCHITECTURE.md)

### Service-Specific Questions
→ Check service documentation in [`docs/services/`](./services/)

### Integration Help
→ Read [`docs/services/auth/INTEGRATION.md`](./services/auth/INTEGRATION.md)

### Setup/Deployment Issues
→ Consult [`docs/services/auth/SETUP.md`](./services/auth/SETUP.md) (same pattern applies)

---

## 📝 Document Versions

| Document | Version | Last Updated | Format |
|----------|---------|--------------|--------|
| ARCHITECTURE.md | 1.0 | 2024 | Markdown |
| ARCHITECTURE.svg | 1.0 | 2024 | SVG |
| architecture.yaml | 1.0 | 2024 | YAML |
| ARCHITECTURE_INDEX.md | 1.0 | 2024 | Markdown (this file) |

---

**Start exploring the architecture now! Pick a format that works best for you.** 🚀
