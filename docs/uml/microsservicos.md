# Definição dos Microsserviços — High-Ticket Showcase

## Visão Geral

A plataforma é composta por cinco serviços independentes, cada um com responsabilidade única, banco de dados próprio e contêiner dedicado no Docker.

```
┌─────────────────────────────────────────────────────────────┐
│                      Tráfego externo                        │
│                     (navegador / API)                       │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTPS :443
                    ┌────▼────┐
                    │  Nginx  │  Reverse Proxy
                    └────┬────┘
          ┌──────────────┼──────────────┐
          │              │              │
     :3000 BFF      :3001 auth    :3003 pay
     Nuxt 3         auth-svc      payment-svc
                         │
              :3002 user  │  :3004 store
              user-svc    │  store-svc
```

---

## 1. auth-service (porta 3001)

**Responsabilidade**: Autenticação e emissão de tokens JWT.

| Item | Valor |
|---|---|
| Framework | Express (Node.js) |
| Linguagem | JavaScript |
| Banco | MySQL (`auth_db`) |
| Porta | 3001 |

### Endpoints

| Método | Rota | Descrição | Visibilidade |
|---|---|---|---|
| POST | `/login` | Valida credenciais, retorna access + refresh token | Pública |
| POST | `/logout` | Revoga o refresh token | Pública |
| POST | `/refresh` | Emite novo access token a partir do refresh token válido | Pública |
| POST | `/verify` | Valida access token, retorna payload do usuário | Interna |
| POST | `/register` | Cria credenciais (chamado pelo user-service) | Interna |

### Tabelas (auth_db)

- `credentials`: id, user_id, email, password_hash, password_salt
- `refresh_tokens`: id, user_id, token_hash, expires_at

---

## 2. user-service (porta 3002)

**Responsabilidade**: Gerenciamento de perfis de usuário e controle de papéis (roles).

| Item | Valor |
|---|---|
| Framework | NestJS |
| Linguagem | TypeScript |
| Banco | PostgreSQL (`users_db`) |
| ORM | Prisma |
| Porta | 3002 |

### Endpoints

| Método | Rota | Descrição | Visibilidade |
|---|---|---|---|
| POST | `/user/register` | Cria usuário + chama auth-service `/register` | Pública |
| GET | `/user/:id` | Retorna perfil do usuário | Interna |
| GET | `/user/me` | Retorna perfil do usuário autenticado | Autenticada |
| PUT | `/user/:id/role` | Altera o papel do usuário | Admin |
| GET | `/permissions/verify` | Verifica se um usuário tem determinado papel | Interna |

### Entidades

- `User`: id, email, role (ADMIN | LOJISTA | CLIENTE), createdAt

---

## 3. payment-service (porta 3003)

**Responsabilidade**: Gestão de planos de assinatura e integração com Stripe para checkout de Lojistas.

> O pagamento é exclusivo de Lojistas que desejam publicar lojas. Clientes não pagam.

| Item | Valor |
|---|---|
| Framework | NestJS |
| Linguagem | TypeScript |
| Banco | PostgreSQL (`payment_db`) |
| ORM | Prisma |
| Gateway | Stripe |
| Porta | 3003 |

### Endpoints

| Método | Rota | Descrição | Visibilidade |
|---|---|---|---|
| GET | `/plan` | Lista planos disponíveis | Pública |
| POST | `/payment/checkout` | Cria sessão de checkout no Stripe | Autenticada (Lojista) |
| POST | `/payment/webhook` | Recebe eventos do Stripe (assinatura ativada/cancelada) | Stripe |
| GET | `/plan/status` | Retorna status da assinatura do Lojista autenticado | Autenticada |

### Entidades

- `PaymentPlan`: id, name, price, features[], durationDays
- `Subscription`: id, lojistaId, planId, status (ACTIVE | EXPIRED | CANCELLED), expiresAt

---

## 4. store-service (porta 3004)

**Responsabilidade**: CRUD de lojas e produtos, upload de mídia no MinIO/S3, e sistema de agendamento de visitas.

| Item | Valor |
|---|---|
| Framework | NestJS |
| Linguagem | TypeScript |
| Banco | PostgreSQL (`store_db`) |
| ORM | Prisma |
| Storage | MinIO (S3-compatible) |
| Porta | 3004 |

### Endpoints — Lojas

| Método | Rota | Descrição |
|---|---|---|
| POST | `/store` | Cria nova loja (requer Lojista com assinatura ativa) |
| GET | `/store` | Lista todas as lojas |
| GET | `/store/:id` | Retorna uma loja |
| PUT | `/store/:id` | Atualiza loja |

### Endpoints — Produtos

| Método | Rota | Descrição |
|---|---|---|
| POST | `/store/:id/product` | Cria produto em uma loja |
| GET | `/store/:id/product` | Lista produtos de uma loja |
| GET | `/product/:id` | Retorna produto |
| PUT | `/product/:id` | Atualiza produto |
| POST | `/product/:id/media` | Upload de imagem para MinIO |

### Endpoints — Visitas

| Método | Rota | Descrição |
|---|---|---|
| POST | `/visit` | Agenda visita (role: CLIENTE) |
| GET | `/visit` | Lista visitas (filtradas por role) |
| GET | `/visit/:id` | Retorna visita |
| PUT | `/visit/:id` | Atualiza status da visita |

### Entidades

- `Store`: id, name, description, logoURL, ownerId, createdAt
- `Product`: id, name, price, storeId, mediaURLs[], createdAt
- `Visit`: id, clientId, productId, scheduledAt, status (PENDING | CONFIRMED | CANCELLED), notes, createdAt

---

## 5. BFF / showcase-app (porta 3000)

**Responsabilidade**: Interface premium SSR (Nuxt 3) e camada BFF (Backend For Frontend) que agrega e proxy-eia chamadas aos serviços de backend.

| Item | Valor |
|---|---|
| Framework | Nuxt 3 |
| Linguagem | TypeScript |
| CSS | Tailwind CSS |
| Porta | 3000 |

### Responsabilidades do BFF (Server Routes do Nuxt)

- Repassa tokens JWT nas chamadas internas aos serviços.
- Agrega dados de múltiplos serviços (ex: página de produto com dados de store + visit).
- Não aplica regras de negócio — apenas orquestra chamadas HTTP.
