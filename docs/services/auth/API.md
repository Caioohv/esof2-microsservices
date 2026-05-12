# Auth Service - API Reference

Documentação completa de todos os endpoints do Auth Service.

## Base URL

```
http://localhost:3001
```

---

## 🔓 POST /login

Autentica um usuário com email e senha, retornando tokens de acesso.

### Request

```http
POST /login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "senha123"
}
```

### Query Parameters

Nenhum

### Request Body

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `email` | string | ✅ Sim | Email do usuário |
| `password` | string | ✅ Sim | Senha em texto plano |

### Response

#### ✅ 200 OK - Login bem-sucedido

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `access_token` | string | JWT para usar em requisições autenticadas (válido por 15 minutos) |
| `refresh_token` | string | JWT para renovar o access token (válido por 7 dias) |

#### ❌ 400 Bad Request

```json
{
  "error": "email and password required"
}
```

#### ❌ 401 Unauthorized

```json
{
  "error": "invalid credentials"
}
```

### Example cURL

```bash
curl -X POST http://localhost:3001/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"senha123"}'
```

### Example JavaScript (fetch)

```javascript
const response = await fetch('http://localhost:3001/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'senha123'
  })
});

const { access_token, refresh_token } = await response.json();
localStorage.setItem('access_token', access_token);
localStorage.setItem('refresh_token', refresh_token);
```

---

## 🔄 POST /refresh

Renova um access token expirado usando um refresh token válido.

### Request

```http
POST /refresh
Content-Type: application/json

{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Request Body

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `refresh_token` | string | ✅ Sim | Refresh token obtido no login |

### Response

#### ✅ 200 OK - Token renovado

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `access_token` | string | Novo JWT válido por 15 minutos |

#### ❌ 400 Bad Request

```json
{
  "error": "refresh_token required"
}
```

#### ❌ 401 Unauthorized

```json
{
  "error": "invalid or expired refresh token"
}
```

ou

```json
{
  "error": "refresh token revoked or expired"
}
```

### Example cURL

```bash
curl -X POST http://localhost:3001/refresh \
  -H "Content-Type: application/json" \
  -d '{"refresh_token":"eyJhbGc..."}'
```

### Example JavaScript

```javascript
async function refreshAccessToken(refreshToken) {
  const response = await fetch('http://localhost:3001/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refreshToken })
  });

  if (response.ok) {
    const { access_token } = await response.json();
    localStorage.setItem('access_token', access_token);
    return access_token;
  } else {
    // Refresh token expirou, usuário precisa fazer login novamente
    localStorage.removeItem('refresh_token');
  }
}
```

---

## ✅ POST /verify

Valida um access token e retorna os dados do usuário.

### Request

```http
POST /verify
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Headers

| Header | Obrigatório | Descrição |
|--------|-------------|-----------|
| `Authorization` | ✅ Sim | Bearer token no formato `Bearer <access_token>` |

### Response

#### ✅ 200 OK - Token válido

```json
{
  "valid": true,
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com"
  }
}
```

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `valid` | boolean | Sempre `true` se retorna 200 |
| `user.id` | string | UUID do usuário |
| `user.email` | string | Email do usuário |

#### ❌ 401 Unauthorized

```json
{
  "valid": false,
  "error": "invalid or expired token"
}
```

ou

```json
{
  "error": "token required"
}
```

### Example cURL

```bash
curl -X POST http://localhost:3001/verify \
  -H "Authorization: Bearer eyJhbGc..."
```

### Example JavaScript

```javascript
async function verifyToken(accessToken) {
  const response = await fetch('http://localhost:3001/verify', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  if (response.ok) {
    const { user } = await response.json();
    console.log('Token válido para usuário:', user.id, user.email);
    return user;
  } else {
    console.log('Token inválido ou expirado');
    return null;
  }
}
```

---

## 🚪 POST /logout

Faz logout do usuário revogando seu refresh token.

### Request

```http
POST /logout
Content-Type: application/json

{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Request Body

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `refresh_token` | string | ✅ Sim | Refresh token a ser revogado |

### Response

#### ✅ 204 No Content

Logout realizado com sucesso (sem corpo de resposta)

#### ❌ 400 Bad Request

```json
{
  "error": "refresh_token required"
}
```

### Notes

- O access token continua válido até sua expiração natural (15 minutos)
- Usar o refresh token após logout resultará em erro 401
- Logout é idempotente: fazer logout novamente com o mesmo token não causa erro

### Example cURL

```bash
curl -X POST http://localhost:3001/logout \
  -H "Content-Type: application/json" \
  -d '{"refresh_token":"eyJhbGc..."}'
```

### Example JavaScript

```javascript
async function logout(refreshToken) {
  const response = await fetch('http://localhost:3001/logout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refreshToken })
  });

  if (response.ok) {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    console.log('Logout realizado');
  }
}
```

---

## 🔒 POST /register *(Internal Endpoint)*

Registra as credenciais de um novo usuário. **Este endpoint é apenas para uso interno, chamado automaticamente pelo User Service**.

### Request

```http
POST /register
Content-Type: application/json

{
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "newuser@example.com",
  "password": "novaSenha123"
}
```

### Request Body

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `user_id` | string | ✅ Sim | UUID do usuário (criado pelo User Service) |
| `email` | string | ✅ Sim | Email do usuário |
| `password` | string | ✅ Sim | Senha em texto plano (será hasheada) |

### Response

#### ✅ 201 Created

```json
{
  "message": "credentials created"
}
```

#### ❌ 400 Bad Request

```json
{
  "error": "user_id, email, and password required"
}
```

#### ❌ 409 Conflict

```json
{
  "error": "email already registered"
}
```

### Example cURL

```bash
# Apenas use este endpoint se você estiver desenvolvendo o User Service
curl -X POST http://localhost:3001/register \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "newuser@example.com",
    "password": "novaSenha123"
  }'
```

---

## 🛡️ Estrutura do JWT

Tanto access tokens quanto refresh tokens são JWT com a seguinte estrutura:

### Payload

```json
{
  "sub": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "iat": 1704067200,
  "exp": 1704068100
}
```

| Campo | Descrição |
|-------|-----------|
| `sub` | Subject - UUID do usuário |
| `email` | Email do usuário |
| `iat` | Issued at - Timestamp de emissão (em segundos) |
| `exp` | Expiration - Timestamp de expiração (em segundos) |

### Headers

```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

---

## 📊 Diagrama de Fluxo

```
┌─────────────┐
│   Cliente   │
└──────┬──────┘
       │ 1. POST /login (email, senha)
       ├──────────────────────────────────────┐
       │                                      │
       │                              ┌───────▼────────┐
       │                              │  Auth Service  │
       │                              │ Valida credenc │
       │                              └───────┬────────┘
       │                                      │
       │                    2. Retorna tokens │
       ◀──────────────────────────────────────┘
       │
       │ 3. Armazena tokens (localStorage)
       │
       │ 4. Próximas requisições com Authorization header
       └──────────────────────────────┬──────────────────────────┐
                                      │                          │
                                ┌─────▼──────┐          ┌────────▼─────┐
                                │ Access OK  │          │ Access Exp.  │
                                └────────────┘          └────────┬─────┘
                                                                 │
                                                     5. POST /refresh
                                                                 │
                                                         ┌───────▼────────┐
                                                         │  Auth Service  │
                                                         │ Valida refresh │
                                                         └───────┬────────┘
                                                                 │
                                                  6. Novo access token
                                                                 │
                                                    ┌────────────▼────────┐
                                                    │ Armazena novo token │
                                                    └─────────────────────┘
```

---

## 🔐 Headers de Resposta

Todas as respostas incluem headers de segurança padrão:

```
Content-Type: application/json
X-Content-Type-Options: nosniff
```

---

## ⏱️ Timeouts e Validade

| Token | Validade | Renovação |
|-------|----------|-----------|
| Access Token | 15 minutos | Usar `/refresh` antes de expirar |
| Refresh Token | 7 dias | Requer novo login após expiração |
| Refresh Token (revogado) | Imediato | Usar `/login` novamente |

---

## 🚨 Códigos de Status HTTP

| Código | Significado |
|--------|------------|
| `200 OK` | Requisição bem-sucedida |
| `201 Created` | Recurso criado com sucesso |
| `204 No Content` | Requisição bem-sucedida, sem corpo de resposta |
| `400 Bad Request` | Parâmetros inválidos ou faltantes |
| `401 Unauthorized` | Credenciais inválidas ou token expirado |
| `409 Conflict` | Recurso já existe (ex: email duplicado) |
| `500 Internal Server Error` | Erro no servidor |
