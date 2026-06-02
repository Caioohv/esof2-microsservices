# User Service — API Reference

Base URL local: `http://localhost:3002` (via Nginx: `/users/*`).

---

## POST /register

Cria um usuário e registra suas credenciais no auth-service. Fluxo orquestrado:

1. Cria o usuário no `users_db` (gera o `id`).
2. Chama `POST auth-service/register` com `{ user_id, email, password }`.
3. Se o auth-service falhar, o usuário recém-criado é removido (rollback).

**Autenticação**: ❌ pública.

**Request**:
```json
{
  "name": "Ana Silva",
  "email": "ana@example.com",
  "password": "senha123",
  "type": "CLIENTE"
}
```

`type` é opcional e aceita `LOJISTA` ou `CLIENTE` (default `CLIENTE`).

**Response `201`**:
```json
{
  "id": "user-uuid",
  "email": "ana@example.com",
  "name": "Ana Silva",
  "type": "CLIENTE"
}
```

**Erros**:

| Status | Quando |
|--------|--------|
| 400 | `name`, `email` ou `password` ausentes; e-mail inválido; `type` inválido |
| 409 | E-mail já cadastrado (no user_db ou no auth-service) |
| 502 | auth-service indisponível (usuário sofre rollback) |

---

## GET /me

Retorna os dados do usuário autenticado. O token é validado via
`auth-service/verify` (sem segredo JWT compartilhado neste serviço).

**Autenticação**: Bearer Token.

**Headers**:
```
Authorization: Bearer <access_token>
```

**Response `200`**:
```json
{
  "id": "user-uuid",
  "email": "ana@example.com",
  "name": "Ana Silva",
  "type": "CLIENTE"
}
```

**Erros**: `401` (token ausente/inválido), `404` (usuário não existe).

---

## GET /users/:id

Lookup por id. Uso interno (outros serviços resolvendo identidade).

**Response `200`**: mesmo formato de `/me`. **Erros**: `404`.

---

## POST /permissions/verify

Verifica se um usuário possui um escopo. Uso interno (chamado pela business layer
de outros serviços, ex.: store-service antes de uma escrita).

**Request**:
```json
{
  "user_id": "user-uuid",
  "scope": "store:create",
  "store_id": "store-uuid"
}
```

`store_id` é opcional e ignorado no MVP (reservado para o modelo multi-loja futuro).

**Response `200`**:
```json
{
  "allowed": true,
  "type": "LOJISTA"
}
```

**Erros**: `400` (`user_id`/`scope` ausentes), `404` (usuário não existe).

### Escopos por tipo (MVP)

| Tipo | Escopos |
|------|---------|
| LOJISTA | `store:*`, `product:*`, `visit:read`, `visit:update` |
| CLIENTE | `store:read`, `product:read`, `visit:create`, `visit:read` |
