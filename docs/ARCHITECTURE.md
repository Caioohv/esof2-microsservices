# Architecture Map - High-Ticket Marketplace

## Visual Architecture

![Architecture Diagram](./ARCHITECTURE.svg)

## Overview

Sistema distribuído de microsserviços que funciona como um **marketplace curado de itens high-ticket** (imóveis, carros, embarcações, joias, arte). Lojas entram por aprovação. O cliente navega por produtos de múltiplas lojas, pode informar seu perfil para receber recomendações personalizadas, e agenda visitas presenciais — a venda ocorre fora da plataforma.

**Stack Principal:**
- **Node.js/TypeScript** - Linguagem primária
- **PostgreSQL** - Banco de dados principal
- **Docker** - Containerização
- **Nginx** - Reverse proxy
- **Nuxt 4** - Frontend + BFF

---

## Estrutura de Camadas

### Camada 1: Cliente (Client Layer)

```
┌─────────────────────┐
│   Frontend/BFF      │
│   (Nuxt 3 - SSR)    │
│   Port: 3000        │
└─────────────────────┘
```

**Responsabilidades:**
- Server-Side Rendering (SSR) para melhor SEO
- BFF (Backend For Frontend) - rotas de servidor que agregam dados
- Proxy para chamar serviços backend
- UI premium para showcase de itens

**Tecnologias:**
- Nuxt 3 (Vue.js)
- Tailwind CSS (styling premium)
- API routes como BFF

---

### Camada 2: API Gateway (Reverse Proxy Layer)

```
┌──────────────────────────┐
│    Nginx Proxy           │
│  (Rota e Load Balance)   │
└──────────────────────────┘
     ↓    ↓    ↓    ↓
```

**Responsabilidades:**
- Rota de tráfego externo para serviços internos
- TLS/SSL termination (HTTPS)
- Load balancing (futuro)
- Rate limiting (futuro)

**Configuração:**
- Port 80/443 (externo)
- Routes internas para serviços na porta 3001-3005

---

### Camada 3: Microserviços (Microservices Layer)

#### Auth Service (Port 3001)

**Propósito:**
- Autenticação centralizada
- Gerenciamento de tokens JWT
- Login, logout, refresh

**Operações:**
- `POST /login` - Autenticar usuário
- `POST /refresh` - Renovar access token
- `POST /verify` - Validar token (usado por outros serviços)
- `POST /logout` - Revogação de token
- `POST /register` - Registrar credenciais (chamado pelo User Service)

**Banco de Dados:**
- MySQL (separado, auth_db)
- Tabelas: `credentials`, `refresh_tokens`

**Tecnologia:**
- Express.js (framework leve, propositalmente simples)
- JWT com PBKDF2 password hashing

**Decisão Arquitetural:**
> ✅ **Auth Centralizado** - Um único serviço é a fonte de verdade para autenticação. Outros serviços chamam `/verify` para validar tokens, não replicam chaves secretas.

---

#### User Service (Port 3002)

**Propósito:**
- Gerenciar identidades de usuários
- Controle de roles e permissões
- Perfil do usuário

**Operações:**
- `POST /users` - Criar novo usuário
- `GET /users/:id` - Obter perfil
- `POST /permissions/verify` - Verificar se usuário tem role específica
- `PATCH /users/:id` - Atualizar perfil

**Banco de Dados:**
- PostgreSQL (users_db)
- Tabelas: `users`, `roles`, `permissions`

**Roles:**
- `lojista` - Vendedor/proprietário de loja
- `cliente` - Cliente/comprador
- `admin` - Administrador

**Tecnologia:**
- NestJS
- Prisma ORM

**Decisão Arquitetural:**
> ✅ **Isolation** - User Service tem DB próprio. Store Service consome `/permissions/verify` para validar permissões, não replica dados.

---

#### Store Service (Port 3004)

**Propósito:**
- Core business logic
- Gerenciar lojas e produtos
- Agendamento de visitas

**Operações:**
- `POST /stores` - Criar loja
- `GET /stores/:id` - Detalhes da loja
- `POST /products` - Criar produto
- `GET /products?store=:id` - Listar produtos
- `POST /visits` - Agendar visita
- `GET /visits/:id` - Status da visita

**Banco de Dados:**
- PostgreSQL (store_db)
- Tabelas: `stores`, `products`, `visits`, `media`

**Fluxo de Autorização:**
1. Cliente envia requisição com Bearer token
2. Store Service valida com Auth Service via `/verify`
3. Store Service verifica permissão com User Service via `/permissions/verify`
4. Se OK, processa requisição

**Tecnologia:**
- NestJS
- Prisma ORM
- MinIO para media storage

**Decisão Arquitetural:**
> ✅ **Composição de Serviços** - Store Service chama Auth + User para validação, mas mantém lógica independente

---

#### Payment Service (Port 3003)

**Propósito:**
- Gerenciar planos de subscripção
- Processar pagamentos para Lojistas
- Checkout flow

**Operações:**
- `GET /plans` - Listar planos disponíveis
- `POST /subscriptions` - Criar subscripção
- `GET /subscriptions/:id` - Status da subscripção
- `POST /checkout` - Iniciar checkout

**Banco de Dados:**
- PostgreSQL (payment_db)
- Tabelas: `payment_plans`, `subscriptions`, `transactions`

**Integrações:**
- Stripe, MercadoPago, Efí Pay, ou AbacatePay
- Webhooks para notificações de pagamento

**Tecnologia:**
- NestJS
- Prisma ORM
- Integração com gateways de pagamento

---

#### Visit Scheduler Service (Port 3005) - *Planned*

**Propósito:**
- Lógica avançada de agendamento
- Notificações de visitas
- Confirmação de presença

**Status:** Planejado para Phase 4

---

### Camada 4: Dados (Data Layer)

#### PostgreSQL Cluster

**Estrutura:**
```
PostgreSQL (Single container em dev, cluster em prod)
├── auth_db           (Auth Service)
├── users_db          (User Service)
├── store_db          (Store Service)
└── payment_db        (Payment Service)
```

**Decisão Arquitetural:**
> ✅ **Database per Service** - Cada microsserviço tem seu próprio banco. Isso garante:
> - Independência: serviços não compartilham schema
> - Escalabilidade: podem usar diferentes engines/configs
> - Falha isolada: problema em um DB não afeta outros

#### MinIO (S3-compatible Storage)

**Uso:**
- Armazenar imagens de produtos
- Logos de lojas
- Mídia de showcase

**Benefícios:**
- Compatível com S3 (fácil migração para AWS)
- Localmente com MinIO em dev
- Production ready

#### Redis (Opcional)

**Potencial Uso:**
- Cache de sessões
- Rate limiting
- Pub/Sub (futuro)

**Status:** Avaliação - não crítico no MVP

---

## Fluxos de Comunicação

### Fluxo 1: Login

```
[Cliente]
    ↓
[Frontend/BFF:3000]
    ↓
[Nginx]
    ↓
[Auth Service:3001] ← POST /login
    ↓ (valida email/senha)
    ↓ (gera JWT access + refresh)
[Resposta com tokens]
    ↓
[Cliente armazena tokens]
```

### Fluxo 2: Requisição Autenticada

```
[Cliente] (com Bearer token)
    ↓
[Frontend/BFF:3000]
    ↓
[Nginx] (passa token via header)
    ↓
[Store Service:3004]
    ↓ (valida com Auth)
[Auth Service:3001] ← POST /verify + token
    ↓ (verifica assinatura/expiração JWT)
[Auth retorna: { valid: true, user: {...} }]
    ↓
[Store Service processa requisição]
    ↓ (se precisa de permissão específica)
[User Service:3002] ← POST /permissions/verify
    ↓
[Resposta ao cliente]
```

### Fluxo 3: Criar Novo Usuário (Signup)

```
[Cliente] (dados de cadastro)
    ↓
[Frontend/BFF:3000]
    ↓
[Nginx]
    ├─→ [User Service:3002]
    │   ├─ Cria registro em users_db
    │   └─ Retorna user_id
    │
    └─→ [Auth Service:3001]
        ├─ POST /register (com user_id, email, password)
        ├─ Hash password com PBKDF2
        └─ Armazena em auth_db
    ↓
[Novo usuário criado - pode fazer login]
```

---

## Decisões Arquiteturais Principais

### 1. Microsserviços vs Monolítico

**Decisão:** ✅ Microsserviços

**Razão:**
- Cada domínio (Auth, Users, Store, Payment) é independente
- Times podem trabalhar em paralelo
- Escalabilidade granular (ex: Payment pode escalar sem Store)

**Trade-off:**
- ❌ Complexidade operacional aumenta
- ❌ Precisa de coordenação entre serviços

---

### 2. Autenticação Centralizada

**Decisão:** ✅ Auth Service centralizado

**Detalhes:**
- Auth Service é a única fonte de verdade para credenciais
- Outros serviços validam tokens via `/verify`
- Não há replicação de secrets entre serviços

**Razão:**
- Single source of truth para segurança
- Fácil auditoria de autenticação
- Logout centralizado

---

### 3. Database per Service

**Decisão:** ✅ Cada serviço tem seu DB

```
┌─────────────┐
│  Auth DB    │ (MySQL para compatibilidade com JWT flow)
├─────────────┤
│  Users DB   │ (PostgreSQL)
├─────────────┤
│  Store DB   │ (PostgreSQL)
├─────────────┤
│ Payment DB  │ (PostgreSQL)
└─────────────┘
```

**Razão:**
- Evita tight coupling via schema compartilhado
- Cada serviço pode escolher seu tipo de DB ideal
- Falhas isoladas

**Constraint:** 
- Sem transactions distribuídas
- Eventual consistency

---

### 4. Inter-Service Communication

**Decisão:** ✅ REST/HTTP over Docker network

**Protocolo:**
- HTTP (interno, sem HTTPS necessário)
- JSON payloads
- Síncrono (para agora)

**Por que não Message Queue?**
- MVP não precisa de eventual consistency
- REST é mais simples para casos de uso atuais
- Pub/Sub pode ser adicionado depois

---

### 5. Frontend Architecture

**Decisão:** ✅ Nuxt 3 como Frontend + BFF

**Estrutura:**
```
Nuxt 3 (port 3000)
├─ Pages (SSR)
├─ API routes (/api/*)
│  └─ BFF: proxies para Auth/User/Store/Payment
└─ Components (Vue)
```

**Razão:**
- SSR melhora SEO (importante para showcase)
- BFF simplifica lógica no frontend
- Nuxt é full-stack (minimiza código duplication)

---

### 6. ORM & Migrations

**Decisão:** ✅ Prisma para NestJS services

**Razão:**
- Type-safe (TypeScript first)
- Migrations automáticas
- DX excelente
- Funciona bem com NestJS

---

## Roadmap por Fase

### Phase 1: Foundation & Infrastructure
- [ ] Docker Compose setup
- [ ] PostgreSQL + MinIO
- [ ] Basic CI/CD

### Phase 2: Identity & Access
- [ ] Auth Service (Login, JWT, Refresh)
- [ ] User Service (Profiles, Roles)

### Phase 3: Store, Products & Marketplace
- [ ] Store Service (CRUD + aprovação administrativa)
- [ ] Product Catalog (com S3/MinIO) + categorias fechadas
- [ ] Busca cross-store com filtros (categoria, preço, localização)
- [ ] Recomendações por perfil (`GET /products/recommended`)
- [ ] Discovery editorial (destaques, recém-chegados)

### Phase 4: Scheduling & Leads
- [ ] Agendamento de visitas presenciais
- [ ] Lifecycle de status (pending → confirmed → cancelled)
- [ ] Notificações em transições de status

### Phase 5: Monetization
- [ ] Payment Service
- [ ] Planos de assinatura para Lojistas

### Phase 6: Frontend
- [ ] Nuxt 4 com experiência de marketplace curado
- [ ] Onboarding de perfil (questionário opcional)
- [ ] Página de loja + busca global + agendamento

---

## Segurança

### Por Serviço

| Serviço | Responsabilidade |
|---------|------------------|
| Auth | Credential validation, JWT issuance |
| Nginx | TLS termination, rate limiting |
| Cada serviço | Validar token via `/verify` antes de processar |

### Fluxo de Validação

```
Requisição chega com: Authorization: Bearer <token>
    ↓
Serviço extrai token do header
    ↓
Serviço chama Auth Service `/verify` com token
    ↓
Auth Service verifica:
    • Assinatura JWT (com JWT_SECRET)
    • Expiração (iat, exp timestamps)
    • Token não foi revogado (para refresh)
    ↓
Auth retorna: { valid: true, user: {id, email} }
    ↓
Serviço processa requisição com user info
```

### Dados Sensíveis

- Senhas: Hasheadas com PBKDF2 (100k iterações)
- Tokens: Armazenados como SHA256 no DB (não em plaintext)
- Secrets: Em `.env`, NUNCA em código
- CORS: Configurado por serviço
- Rate Limiting: Nginx (a implementar)

---

## Deploy

### Development
```bash
docker-compose up
# Todos os serviços rodam localmente
```

### Production
- PostgreSQL: Managed service (RDS)
- MinIO: S3 cloud (AWS)
- Services: Kubernetes ou ECS
- Nginx: Load balancer gerenciado
- Auth: Environment-based secrets

---

## Documentação por Serviço

- **[Auth Service](./services/auth/README.md)** - Documentação completa
- **User Service** - (em desenvolvimento)
- **Store Service** - (em desenvolvimento)
- **Payment Service** - (em desenvolvimento)
- **Frontend/BFF** - (em desenvolvimento)

---

## Referências

- Especificação completa: [spec.md](./.agent-files/context/spec.md)
- Goals: [goals.md](./.agent-files/context/goals.md)
- Roadmap: [roadmap.md](./.agent-files/context/roadmap.md)
- UML: [microsservices.md](./uml/microsservicos.md)
