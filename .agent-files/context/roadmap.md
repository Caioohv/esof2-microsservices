# Project Roadmap - High-Ticket Marketplace

## 1. Vision Statement

Marketplace curado de itens high-ticket (imóveis, carros, embarcações, joias, arte) sobre arquitetura distribuída de microsserviços. Lojas entram por aprovação. O cliente navega por produtos de múltiplas lojas, forma seu perfil opcionalmente, e agenda visitas presenciais — o fechamento da venda ocorre fora da plataforma.

---

## 2. Roadmap Phases

### Phase 1: Foundation & Infrastructure ✅
**Goal**: Estabelecer infraestrutura Docker e scaffolding de todos os serviços.
**Key Components**:
- Docker Compose com MySQL (auth-service) e PostgreSQL (databases isolados por serviço)
- Nginx como reverse proxy roteando tráfego externo
- Templates de variáveis de ambiente (`.env.example`)
- Estrutura de monorepo em `services/`

**Dependencies**: None.

---

### Phase 2: Identity & Access Management (IAM) — Partial ⚠️
**Goal**: Stack completo de identidade — autenticação JWT e gerenciamento de permissões por loja.
**Key Components**:
- ✅ **Auth Service (3001)**: JWT, refresh tokens, PBKDF2, `/verify` para inter-service auth
- ⬜ **User Service (3002)**: Perfis de usuário, roles (Lojista/Cliente/Admin), permissões granulares, `UserStoreRole`, sistema de convites
- ⬜ **UserProfile**: Questionário opcional de perfil (estilo de vida, família, preferências) para recomendações

**Dependencies**: Phase 1 complete.

---

### Phase 3: Store, Products & Marketplace ⬜
**Goal**: Lógica de negócio central — lojas, catálogo de produtos e experiência de marketplace.
**Key Components**:
- **Store Service (3004)**: CRUD de lojas (`/stores`) com aprovação administrativa
- **Product Catalog**: CRUD de produtos com upload de mídia via S3/MinIO; campo `category` obrigatório
- **Categorias fechadas**: imóveis, carros, embarcações, joias, arte
- **Busca cross-store**: `GET /products` com filtros por categoria, preço, localização e texto livre
- **Recomendações por perfil**: `GET /products/recommended` — chama user-service para obter `UserProfile`, aplica filtros baseados em perfil (ex: não recomendar apartamento de 2 quartos para família grande)
- **Discovery editorial**: endpoint/lógica para destaques e recém-chegados
- Inter-service call ao user-service para enforcement de role Lojista em operações de escrita

**Dependencies**: Phase 2 complete.

---

### Phase 4: Lead Generation & Scheduling ⬜
**Goal**: Core value proposition — agendamento de visitas presenciais.
**Key Components**:
- Endpoints de agendamento no store-service (`/visits`)
- Lifecycle de status: `pending → confirmed → cancelled`
- Hooks de notificação (email ou webhook) em transições de status
- Fluxo no webapp: discovery → produto → agendamento

**Dependencies**: Phase 3 complete.

---

### Phase 5: Monetization & Payments ⬜
**Goal**: Monetização por assinatura para Lojistas.
**Key Components**:
- **Payment Service (3003)**: Planos de assinatura (`PaymentPlan`, `Subscription`)
- Integração com gateway (Stripe ou MercadoPago — decisão na implementação)
- Webhook para eventos de pagamento
- Verificação de assinatura ativa no store-service antes de permitir publicação de produto

**Dependencies**: Phase 2 complete.

---

### Phase 6: Frontend & Marketplace Experience ⬜
**Goal**: Frontend premium com experiência de marketplace curado.
**Key Components**:
- **Nuxt 4 BFF (3000)**: Server routes como BFF proxy agregando dados de user, store e produtos
- Página inicial com discovery editorial (destaques, recém-chegados, recomendados)
- Onboarding de perfil: questionário opcional com UX cuidada (não parece formulário)
- Busca global com filtros por categoria, preço, localização
- Página de loja (identidade preservada, não só lista de produtos)
- Página de produto + fluxo de agendamento de visita
- Auth flow (login, registro, aceite de convite)
- Navegação por role (dashboard Lojista vs. browse Cliente)

**Dependencies**: Phases 2–4 complete.

---

## 3. Architecture & Standards Alignment

- Todos os backend services usam **NestJS + Prisma + PostgreSQL** (auth-service usa Express + MySQL como legacy).
- Inter-service auth via auth-service `/verify` — sem JWT secrets compartilhados.
- Nginx é o único entry point externo; serviços não são expostos diretamente.
- Role enforcement na camada de negócio de cada serviço (via chamada ao user-service), nunca no BFF.
- Database isolation: um container PostgreSQL, databases separados (`users_db`, `store_db`, `payment_db`).

---

## 4. Success Criteria

- [x] Phase 1: Infraestrutura Docker rodando; auth-service e MySQL containerizados
- [ ] Phase 2: User service operacional; UserProfile com questionário; invitation flow testado
- [ ] Phase 3: Store e product CRUD funcionais; busca cross-store com filtros; recomendações por perfil retornando resultados relevantes
- [ ] Phase 4: Fluxo de agendamento end-to-end com transições de status
- [ ] Phase 5: Criação de assinatura e processamento de webhook funcionais
- [ ] Phase 6: Frontend live com discovery editorial, busca, página de loja e agendamento
- [ ] Integração entre todas as fases validada via teste end-to-end ou walkthrough manual
- [ ] Todos os serviços acessíveis via roteamento Nginx

---

## 5. Futuras Melhorias (fora do escopo atual)

- **Loja Exclusiva**: tier de assinatura premium — loja isolada do marketplace com URL própria (`/loja/nome`) e experiência de site individual, sem aparecer na busca geral. Implementável como flag no `PaymentPlan` sem mudança arquitetural.
