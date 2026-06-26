# Planejamento: Perfil de Usuário e Vendedor (MVP)

## Contexto

Ao entrar no site, o usuário faz login ou registro. Após o registro, um **perfil de comprador** é criado automaticamente. O usuário pode opcionalmente solicitar um **perfil de vendedor**, que passa por aprovação interna antes de poder criar lojas e publicar anúncios.

---

## Fluxo de Registro

```
Frontend
  │
  ├─ POST /users (user-service)      ← { name, email }
  │    └─ retorna { id, name, email }
  │
  └─ POST /register (auth-service)   ← { user_id, email, password }
       └─ retorna 201
```

O `user_id` gerado pelo user-service é o elo entre os dois serviços.

---

## Fluxo de Perfil de Vendedor

```
Usuário logado
  │
  └─ POST /users/:id/seller-profile  ← { businessName, description }
       └─ status: "pending"

Admin interno
  │
  └─ PATCH /users/:id/seller-profile ← { status: "approved" | "rejected" }
       └─ atualiza status

Vendedor aprovado
  │
  └─ POST /store (store-service)     ← { name, description, category, owner_id }
       └─ cria loja vinculada ao vendedor
```

---

## Novos Microsserviços

### user-service (novo — porta 3002)

**Responsabilidades:**
- Criar e gerenciar perfis de compradores
- Criar e gerenciar solicitações de perfis de vendedores
- Expor status de aprovação de vendedor para outros serviços

**Banco:** PostgreSQL (`user_db`)

**Modelos Prisma:**

| Modelo          | Campos principais                                      |
|-----------------|-------------------------------------------------------|
| `User`          | id, name, email, createdAt, updatedAt                 |
| `SellerProfile` | id, userId (FK), businessName, description, status, createdAt, updatedAt |

`status` de `SellerProfile`: `pending` \| `approved` \| `rejected`

**Endpoints:**

| Método | Rota                                | Descrição                              |
|--------|-------------------------------------|----------------------------------------|
| POST   | /users                              | Cria perfil de comprador               |
| GET    | /users/:id                          | Retorna dados do comprador             |
| PATCH  | /users/:id                          | Atualiza dados do comprador            |
| POST   | /users/:id/seller-profile           | Solicita perfil de vendedor (pending)  |
| GET    | /users/:id/seller-profile           | Retorna perfil de vendedor             |
| PATCH  | /users/:id/seller-profile           | Atualiza status (aprovação interna)    |

---

## Alterações em Serviços Existentes

### store-service

- Adicionar campo `ownerId` (userId do vendedor) ao modelo `Store`
- `POST /store` passa a exigir `owner_id` no body
- `GET /store` aceita query param `?owner_id=xxx` para filtrar lojas do vendedor

### auth-service

- Sem alterações. Já aceita `user_id` externo no `POST /register`.

---

## Tarefas de Implementação

- [x] Criar `user-service` completo (src, prisma schema, package.json, Dockerfile)
- [x] Testes unitários para `user.bs.js` e `seller.bs.js`
- [x] Adicionar `ownerId` ao Store no store-service (schema + repositório + business + testes)
- [x] Atualizar `docker-compose.yml` com user-service e `user_db`

---

## Pendente (pós-MVP)

- Middleware de autenticação nos endpoints do user-service (verificar JWT via auth-service)
- Endpoint interno de verificação de seller aprovado (para uso do store-service)
- Notificação por e-mail ao aprovar/rejeitar vendedor
- Painel administrativo de aprovação
