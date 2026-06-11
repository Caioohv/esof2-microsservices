# Olimpo — Plano de Desenvolvimento

## Objetivo

O Olimpo é um marketplace curado de ativos high-ticket: automóveis, imóveis, náutico, aviação, arte e joias. O comprador descobre, filtra e agenda visitas presenciais. A venda ocorre fora da plataforma — o Olimpo gera o lead qualificado.

Lojas parceiras pagam assinatura mensal para listar seus produtos. A curadoria é obrigatória: toda loja passa por aprovação antes de aparecer no marketplace. O diferencial é o posicionamento premium e as recomendações baseadas no perfil de estilo de vida do comprador.

---

## Descrição funcional

### Papéis de usuário

| Role | Quem é | O que pode fazer |
|------|--------|-----------------|
| **CLIENTE** | Comprador | Navegar, buscar, filtrar, salvar favoritos, agendar visitas, preencher perfil de preferências |
| **LOJISTA** | Dono de loja parceira | Criar e gerenciar loja, publicar produtos, confirmar/cancelar visitas agendadas |
| **ADMIN** | Time Olimpo | Aprovar ou rejeitar solicitações de loja |

### Fluxo do comprador

1. Acessa o site e explora o catálogo (sem precisar criar conta)
2. Filtra por categoria (automóveis, imóveis, náutico...) ou busca por texto
3. Cria conta → preenche questionário de preferências (opcional)
4. Recebe recomendações personalizadas na homepage
5. Abre a página do produto → vê galeria, specs e loja responsável
6. Clica "Agendar Visita" → escolhe data e horário
7. Aguarda confirmação do lojista por email/notificação

### Fluxo do lojista

1. Cria conta → solicita perfil de lojista (nome da empresa, descrição)
2. Admin aprova o cadastro
3. Lojista acessa o dashboard → cria a loja (nome, logo, descrição)
4. Publica produtos com nome, preço, categoria, imagens e specs específicas
5. Recebe notificações de visitas agendadas → confirma ou cancela
6. Renova assinatura mensalmente para manter a loja ativa

### Busca e recomendações

- **Busca cross-store:** `GET /products?category=automovel&search=bmw&minPrice=100000` — retorna produtos de todas as lojas aprovadas com paginação
- **Recomendações:** baseadas no `UserProfile` do comprador. O store-service consulta o user-service e aplica heurísticas: faixa de preço por `incomeRange`, quartos mínimos para imóvel, tipo de combustível para veículo, etc. Sem modelo de ML no MVP — filtros determinísticos.
- **Página da loja:** cada loja tem URL própria (`/stores/:id`) com produtos agrupados por categoria, identidade visual e descrição.

---

## Arquitetura

```
Internet
   │
   ▼
[Nginx :80]  ← único entry point externo
   │
   ├── /auth/*     → auth-service  :3001 (Express + PostgreSQL)
   ├── /users/*    → user-service  :3002 (Express + PostgreSQL)
   ├── /payment/*  → payment-service :3003 (Express + PostgreSQL)
   ├── /store/*    → store-service :3004 (Express + PostgreSQL)
   └── /*          → webapp (Nuxt 4 BFF) :3000
```

### Serviços

| Serviço | Porta | DB | Responsável | Status |
|---------|-------|----|-------------|--------|
| auth-service | 3001 | PostgreSQL (`olimpo`) | Caio | ✅ Completo |
| user-service | 3002 | PostgreSQL (`olimpo`) | Mari | 🚧 Em andamento |
| payment-service | 3003 | PostgreSQL (`olimpo`) | Christian | 🚧 Em andamento |
| store-service | 3004 | PostgreSQL (`olimpo`) | Felipe | 🔍 Em revisão |
| webapp (BFF) | 3000 | — | Caio | 🚧 Em andamento |

### Padrões técnicos

- **Framework backend:** Express (todos os serviços seguem o padrão do auth-service, não NestJS como está no spec original)
- **ORM:** Prisma 7 com `@prisma/adapter-pg` (necessário para PostgreSQL no Prisma 7)
- **Camadas:** `routes → controller → business → repository` em todos os serviços
- **Testes:** `node:test` nativo + mocks via `Module._load` (zero dependências externas de teste)
- **Auth inter-serviço:** serviços nunca validam JWT localmente. Sempre chamam `POST /auth/verify` no auth-service. Sem `JWT_SECRET` propagado.
- **Verificação de role:** business layer de cada serviço chama `POST /user-service/permissions/verify`. Nunca no BFF.
- **Banco:** um container PostgreSQL, database único `olimpo` compartilhado por todos os serviços. Cada serviço escreve apenas nas suas próprias tabelas — o isolamento é por convenção de código, não por infraestrutura.

---

## Modelo de dados central

### auth-service (PostgreSQL / olimpo)
```
Credential: userId, email, passwordHash, passwordSalt
RefreshToken: userId, tokenHash, expiresAt
```

### user-service (PostgreSQL / olimpo)
```
User: id, name, email, createdAt

SellerProfile: id, userId, businessName, description, status (pending|approved|rejected)
  → solicitação de lojista; aprovado pelo admin

UserProfile: id, userId, lifestyleTags[], incomeRange,
             minBedrooms, minBathrooms, wantsGarage,
             preferredDoors, preferredFuel, preferences (JSON)
  → perfil de preferências do comprador para recomendações
```

### store-service (PostgreSQL / olimpo)
```
Store: id, ownerId, name, description, logoUrl, status (pending|approved|rejected)

Product: id, storeId, name, description, price, category, mediaUrls[], specs (JSON)
  category: automovel | imovel | nautico | aviacao | arte | joia

Visit: id, clientId, productId, scheduledAt, status (pending|confirmed|cancelled)
```

### payment-service (PostgreSQL / olimpo)
```
PaymentPlan: id, name, price, features[], durationDays

Subscription: id, lojistaId, planId, status (active|cancelled|expired), expiresAt
```

---

## Decisões técnicas

| Decisão | Escolha | Motivo |
|---------|---------|--------|
| Framework backend | Express | Consistência com o auth-service já feito. NestJS aumentaria a curva de aprendizado sem benefício real no prazo. |
| ORM | Prisma 7 | Migrações tipadas, DX superior. Requer `@prisma/adapter-pg` no Prisma 7. |
| Testes | `node:test` nativo | Zero dependências. Mocking via `Module._load`. Padrão estabelecido no auth-service. |
| Auth inter-serviço | Chamada HTTP ao auth-service | Evita propagar `JWT_SECRET`. Mudança de algoritmo não exige redeploy de todos os serviços. |
| DB strategy | Um PostgreSQL, banco `olimpo` único | Elimina a necessidade de script de init, remove o MySQL e simplifica o `docker-compose`. Cada serviço escreve só nas suas tabelas — isolamento por convenção de código. |
| Assinatura de loja | Bypass no MVP | Reduz complexidade de integração com Stripe. Estrutura pronta para ativar depois. |
| Recomendações | Heurísticas simples no store-service | Sem modelo de ML. Filtros baseados em `UserProfile` são suficientes para o MVP. |
| Frontend | Nuxt 4 + Vue 3 | SSR para SEO, BFF nativo com server routes, componentes reativos. |

---

## Estado atual

### ✅ Pronto
- auth-service completo (JWT, refresh tokens, PBKDF2, `/verify` inter-serviço)
- Webapp com design system completo ("Olimpo") — hero, listagem mockada, login page
- store-service base em camadas com Prisma (PR #6 aguardando merge)
- docker-compose com MySQL + PostgreSQL + health checks

### 🔍 Aguardando decisão (PRs abertos)
- **PR #6** (store-service refatorado pelo Caio) → **deve ser mergeado**
- **PR #7** (store-service do Felipe sem Prisma) → fechar após merge do #6
- **PR #8** (user-service da Mari — só health check) → a implementação local é mais completa

### 🚧 Em andamento
- user-service: código local avançado mas não commitado
- payment-service (PR #2 do Christian): estrutura incorreta, precisa ser reestruturado

### 📋 Pendente (ver `tasks/todo/`)
Tudo que está abaixo no roadmap

---

## Roadmap de execução

Execute as tasks na ordem numérica — cada uma tem dependências declaradas no arquivo.

### Fase 1 — Estabilização da base (tasks 01–06)
Limpar o estado atual: merges pendentes, commits não feitos, configuração de infraestrutura e correção do Prisma driver.

```
01 → Merge PR #6 (store-service)
02 → Commit mudanças unstaged (ownerId, docker-compose)
03 → postgres-init com todos os databases
04 → user-service completo (endpoints, UserProfile, saga de registro)
05 → payment-service reestruturado com bypass
06 → Prisma driver adapter (store + user + payment)
```

### Fase 2 — Regras de negócio dos serviços (tasks 07–11)
Implementar aprovação, autenticação inter-serviço, busca, agendamentos e analytics.

```
07 → Store: status de aprovação + middleware de auth
08 → Store: busca cross-store + página da loja + recomendações
09 → Store: rastreamento de views + sistema de apoio à decisão (analytics)
10 → Store: agendamento de visitas (Visit model + endpoints)
11 → Nginx reverse proxy
```

### Fase 3 — Frontend wired (tasks 12–16)
Conectar a UI existente (dados mockados → API real) e adicionar as telas faltantes.

```
12 → Webapp: login e registro wired à API
13 → Webapp: listagem de produtos conectada ao store-service
14 → Webapp: página da loja + página do produto + agendamento
15 → Webapp: questionário de perfil de preferências
16 → Webapp: dashboard do lojista
```

---

## Distribuição sugerida por membro

| Membro | Responsabilidade principal |
|--------|--------------------------|
| **Caio** | Infra, PR reviews, webapp BFF, coordenação |
| **Mari** | user-service (tasks 04, 09) |
| **Felipe** | store-service (tasks 07, 08, 10) |
| **Christian** | payment-service (task 05) |
| **Gabrielly** | A definir — sugestão: ajudar nas tasks de webapp (12–16) |

---

## Melhorias futuras (fora do MVP)

### Curto prazo (próxima iteração)
- **Integração real com Stripe:** remover o bypass da assinatura e processar cobranças via webhook. A estrutura (`PaymentPlan`, `Subscription`) já estará no lugar.
- **Upload de imagens real:** hoje `mediaUrls` armazena URLs externas. Implementar upload para S3/MinIO com pré-assinatura.
- **Notificações de visita:** email automático para lojista quando visita é agendada e para comprador quando confirmada/cancelada. Implementável com fila simples (ou webhook direto no MVP via sendgrid/resend).
- **Refresh de token automático:** o webapp precisa renovar o access token expirado via `POST /auth/refresh` sem deslogar o usuário.

### Médio prazo
- **Modelo de recomendação melhorado:** substituir as heurísticas determinísticas por score baseado em similaridade de perfil (ex: usuários parecidos compraram isso). Implementável sem mudança de arquitetura — só o algoritmo dentro do `store-service`.
- **Favoritos:** comprador salva produtos favoritos. Tabela `Favorite: userId, productId` no user-service ou store-service.
- **Avaliações de visita:** após a visita, comprador avalia a experiência. Alimenta score de confiabilidade da loja.
- **Analytics do lojista:** já implementado no MVP (task 09) dentro do store-service. Se o volume de eventos crescer, extrair para um `analytics-service` dedicado com armazenamento otimizado para séries temporais (ex: TimescaleDB ou ClickHouse).
- **Múltiplas lojas por lojista:** hoje `SellerProfile` é 1:1 com `User`. Para escalar, trocar por `UserStoreRole` (M2M com permissões granulares por loja).

### Longo prazo
- **Loja exclusiva (tier premium):** loja isolada do marketplace com URL própria (`/loja/nome`), experiência de site individual, não aparece na busca geral. Implementável como flag `isExclusive` no `PaymentPlan` sem mudança arquitetural.
- **App mobile:** a API já é REST; um app React Native / Flutter consumiria os mesmos endpoints.
- **Moderação de conteúdo:** revisão automática de imagens e descrições antes de publicar produto.
- **Sistema de convites para a loja:** lojista convida colaboradores com permissões específicas (`UserStoreRole` + `Invitation`).
- **Analytics como microsserviço independente:** extrair `ProductView` e os endpoints de analytics do store-service para um `analytics-service` próprio. Justificado quando o volume de eventos exigir escala horizontal independente do CRUD de produtos.
