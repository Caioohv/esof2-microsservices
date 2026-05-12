# Auth Service - Fluxo de Autenticação

Visão detalhada de como funciona o fluxo de autenticação e autorização.

## Fluxo Geral

```
┌─────────────────────────────────────────────────────────────────────┐
│                        FLUXO DE AUTENTICAÇÃO                    │
└─────────────────────────────────────────────────────────────────────┘

┌──────────┐                          ┌────────────────┐
│ Cliente  │                         │ Auth Service   │
└────┬─────┘                          └────────────────┘
     │                                       │
     │  1. POST /login                       │
     │  (email, password) ────────────────→   │
     │                                       │
     │                          2. Valida credenciais
     │                          3. Gera tokens JWT
     │                                       │
     │ ← 200 OK                              │
     │ {                                     │
     │   access_token: "...",                │
     │   refresh_token: "..."                │
     │ }                                     │
     │                                       │
     │ Armazena tokens (localStorage)        │
     │                                       │
     │  4. Próximas requisições              │
     │  Authorization: Bearer <token>        │
     │  ────────────────────────────────→      │
     │                                       │
     │                          5. Valida token
     │                                       │
     │ ← 200 OK (ou 401 se expirado)         │
     │                                       │
     │  Se token expirado:                   │
     │                                       │
     │  6. POST /refresh                     │
     │  (refresh_token) ──────────────────→   │
     │                                       │
     │                          7. Valida refresh token
     │                          8. Gera novo access token
     │                                       │
     │ ← 200 OK                              │
     │ { access_token: "..." }               │
     │                                       │
     │  9. POST /logout                      │
     │  (refresh_token) ──────────────────→   │
     │                                       │
     │                        10. Revoga refresh token
     │                        no banco de dados
     │                                       │
     │ ← 204 No Content                      │
```

---

## Login (Obtenção de Tokens)

### Fluxo Detalhado

```javascript
// 1. Cliente envia credenciais
{
  email: "user@example.com",
  password: "senha123"
}

// 2. Auth Service:
//   a) Procura email no banco
const user = db.query("SELECT * FROM credentials WHERE email = ?")
if (!user) return 401;

//   b) Compara senha hasheada
const hash = PBKDF2(password, salt, 100000, 64, 'sha512')
if (hash !== user.password_hash) return 401;

//   c) Gera tokens
access_token = JWT.sign(
  { sub: user.user_id, email: user.email },
  JWT_SECRET,
  { expiresIn: '15m' }
)

refresh_token = JWT.sign(
  { sub: user.user_id, email: user.email },
  JWT_REFRESH_SECRET,
  { expiresIn: '7d' }
)

//   d) Armazena hash do refresh token
token_hash = SHA256(refresh_token)
db.query("INSERT INTO refresh_tokens (...) VALUES (...)")

// 3. Retorna tokens para cliente
{
  access_token: access_token,
  refresh_token: refresh_token
}
```

### Diagrama de Sequência

```
Cliente                   Auth Service            MySQL
  │                            │                   │
  ├─ POST /login ─────────────→│                   │
  │ (email, password)          │                   │
  │                            ├─ SELECT * FROM credentials ─→│
  │                            │ WHERE email = ? │
  │                            │←─ credentials ─┤
  │                            │                   │
  │                    [Valida senha]              │
  │                    [Gera tokens]               │
  │                            │                   │
  │                            ├─ INSERT refresh_tokens ──→│
  │                            │                   │
  │                            │←─ OK ─────────────┤
  │                            │                   │
  │←─ 200 OK ─────────────────│
  │ {access, refresh tokens}   │
```

### Casos de Erro

```
Email não encontrado
  └→ 401 Unauthorized
    └→ "invalid credentials" (genérico, não expõe se email existe)

Senha incorreta
  └→ 401 Unauthorized
    └→ "invalid credentials" (mesmo genérico)

Email/senha faltando
  └→ 400 Bad Request
    └→ "email and password required"
```

---

## Verificação de Acesso (Token Validation)

### Fluxo Detalhado

```javascript
// 1. Cliente envia requisição com token
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

// 2. Auth Service:
//   a) Extrai token do header
const token = authHeader.split(' ')[1]
if (!token) return 401;

//   b) Verifica assinatura e expiração
try {
  const payload = JWT.verify(token, JWT_SECRET)
} catch {
  return 401; // Inválido ou expirado
}

//   c) Retorna dados do usuário
{
  valid: true,
  user: {
    id: payload.sub,
    email: payload.email
  }
}
```

### Diagrama Temporal

```
Token emitido: 14:00:00
Validade: 15 minutos
Expira: 14:15:00

14:00:00 ──────────────────────── 14:15:00 ──────────
         │ VÁLIDO                 │ EXPIRADO
         │ Aceita requisição      │ Retorna 401
         │                        │ Sugestão: renovar
         │                        │
    Usar normalmente        Fazer /refresh
```

### Casos de Erro

```
Token não enviado
  └→ 401 Unauthorized
    └→ "token required"

Token inválido (corrompido)
  └→ 401 Unauthorized
    └→ "invalid or expired token"

Token expirado
  └→ 401 Unauthorized
    └→ "invalid or expired token"

Token com JWT_SECRET errado
  └→ 401 Unauthorized
    └→ Assinatura não confere
```

---

## Renovação de Token (Refresh)

### Fluxo Detalhado

```javascript
// 1. Cliente envia refresh token
{
  refresh_token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
}

// 2. Auth Service:
//   a) Valida refresh token (assinatura + expiração)
let payload;
try {
  payload = JWT.verify(refresh_token, JWT_REFRESH_SECRET)
} catch {
  return 401; // Expirado ou inválido
}

//   b) Verifica se foi revogado (logout)
const exists = db.query(
  "SELECT id FROM refresh_tokens WHERE token_hash = ? AND expires_at > NOW()"
)
if (!exists) return 401;

//   c) Gera novo access token (mesmo usuário)
access_token = JWT.sign(
  { sub: payload.sub, email: payload.email },
  JWT_SECRET,
  { expiresIn: '15m' }
)

// 3. Retorna novo access token
{
  access_token: access_token
}
```

### Diagrama de Estado

```
               ┌─────────────────────────┐
               │  Refresh Token Válido  │
               └────────────┬────────────┘
                            │
                    Não foi feito logout?
                            │
                ┌───────────┴───────────┐
                │                      │
              SIM                      NÃO
                │                      │
        Gera novo          Retorna 401 │
        access token       (revogado)  │
                │                      │
                └───────────┬───────────┘
                           │
                    Validade não expirou?
                           │
                ┌───────────┴───────────┐
                │                      │
              SIM                     NÃO
                │                      │
          Retorna novo         Retorna 401
          token                (expirado)
                            Fazer novo login
```

### Timeline de Refresh

```
t=0              Login bem-sucedido
                 │
                 ├─ Access Token válido por 15 min
                 │  └─ Expira em 14:15
                 │
                 └─ Refresh Token válido por 7 dias
                    └─ Expira em 7 dias depois
                    │
                    ├─ Pode ser revogado (logout)
                    │
                    └─ Pode ser usado para renovar
                       quantas vezes quiser (até expirar)

t=15min          Access Token expira
                 │
                 ├─ Requisições retornam 401
                 │
                 └─ Cliente chama POST /refresh
                    │
                    └─ Recebe novo Access Token
                       │
                       └─ Access Token válido por + 15 min

t=7d             Refresh Token expira
                 │
                 └─ POST /refresh retorna 401
                    │
                    └─ Usuário deve fazer novo login
```

### Casos de Erro

```
Refresh token inválido/corrompido
  └→ 401 Unauthorized
    └→ "invalid or expired refresh token"

Refresh token expirado
  └→ 401 Unauthorized
    └→ "invalid or expired refresh token"

Refresh token revogado (logout feito)
  └→ 401 Unauthorized
    └→ "refresh token revoked or expired"

Refresh token não enviado
  └→ 400 Bad Request
    └→ "refresh_token required"
```

---

## Logout (Revogação de Token)

### Fluxo Detalhado

```javascript
// 1. Cliente envia refresh token para logout
{
  refresh_token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
}

// 2. Auth Service:
//   a) Calcula hash do token
token_hash = SHA256(refresh_token)

//   b) Deleta do banco (revoga)
db.query("DELETE FROM refresh_tokens WHERE token_hash = ?", [token_hash])

// 3. Retorna sucesso (204 No Content)
// Sem corpo de resposta
```

### Diagrama de Revogação

```
                    Token Refresh Válido
                            │
                       POST /logout
                            │
                ┌───────────┴───────────┐
                │                       │
          Encontrado              Não encontrado
         (revoga OK)              (idempotente)
                │                       │
                └───────────┬───────────┘
                            │
                   Status 204 (OK)
                            │
              Próximo uso de token
                            │
                ┌───────────┴───────────┐
                │                       │
            POST /refresh        (Não aplicável)
                │
                └─ 401 Unauthorized
                   "refresh token revoked"
```

### Importante

- **Access Token continua válido**: Até sua expiração natural (15 min)
  - Requisições com access token ainda funcionam por até 15 minutos
  - Refresh token é revogado imediatamente

- **Logout é idempotente**: Fazer logout 2x com mesmo token = OK ambas vezes
  - Primeira vez: revoga o token
  - Segunda vez: não encontra (já foi deletado) mas retorna 204 mesmo assim

- **Revogação é imediata**: Não há cache, é direto no banco

### Timeline de Logout

```
14:00 Login bem-sucedido
      │
      ├─ Access Token: expira 14:15
      │
      └─ Refresh Token: expira em 7d, armazenado no DB

14:05 POST /logout (com refresh token)
      │
      ├─ Deleta do DB
      │
      └─ Refresh Token: REVOGADO (mas validade 7d continua)

14:06 Tentar fazer requisição com access token
      │
      └─ Funciona (ainda válido por ~9 min)

14:07 Tentar POST /refresh (com refresh revogado)
      │
      └─ 401 Unauthorized
         "refresh token revoked or expired"

14:10 Tentar fazer requisição com access token
      │
      └─ Funciona (ainda válido por ~5 min)

14:15 Access Token expira naturalmente
      │
      └─ Novas requisições retornam 401
         POST /refresh também falha
         └─ Usuário deve fazer novo login
```

---

## Fluxo Completo: Do Login ao Logout

```
┌────────────────────────────────────────────────────────────────┐
│                  FLUXO COMPLETO DE SESSÃO                  │
└────────────────────────────────────────────────────────────────┘

1. AUTENTICAÇÃO
   └─ POST /login (email, senha)
      └─ 200 OK: access_token + refresh_token
         └─ Armazena tokens no localStorage

2. USO NORMAL (primeiros 15 minutos)
   └─ Requisições com Authorization: Bearer <access_token>
      └─ 200 OK: Requisições funcionam normalmente

3. ACCESS TOKEN EXPIRA
   └─ Próxima requisição com access_token expirado
      └─ 401 Unauthorized

4. RENOVAÇÃO
   └─ POST /refresh (com refresh_token)
      └─ 200 OK: novo access_token
         └─ Requisições voltam a funcionar

5. LOOP (passam mais 15 minutos)
   └─ (repete passos 2-4 até refresh_token expirar ou logout)

6. LOGOUT
   └─ POST /logout (com refresh_token)
      └─ 204 No Content: refresh_token revogado
         └─ Limpa localStorage

7. APÓS LOGOUT
   └─ Access token continua válido por ~15 min
      └─ Requisições ainda funcionam

   └─ Refresh token revogado
      └─ POST /refresh retorna 401

   └─ Quando access_token expira
      └─ POST /refresh também falha
         └─ Usuário deve fazer novo login

8. NOVO LOGIN
   └─ Repete processo a partir do passo 1
```

---

## Segurança no Fluxo

### Por que dois tokens?

| Access Token | Refresh Token |
|---|---|
| Curta duração (15 min) | Longa duração (7 dias) |
| Enviado em toda requisição | Enviado apenas para renovar |
| Se vazar, exposição limitada | Se vazar, impacto maior |
| Revogação lenta (espera expirar) | Revogação rápida (logout imediato) |

### Minimizar Exposição

```
Access Token de curta duração
  └─ Se for comprometido, válido por no máximo 15 minutos
  └─ Reduz janela de exposição

Refresh Token revogável
  └─ Pode ser revogado imediatamente (logout)
  └─ Armazenado como hash (não o token em si)

Hashing de Refresh Token
  └─ DB armazena SHA256(token), não o token
  └─ Se DB for comprometido, tokens não vazam
```

### Proteção de Senha

```
PBKDF2 com Salt Único
  └─ 100.000 iterações
  └─ SHA512
  └─ Salt aleatório por usuário (16 bytes)
  └─ Mesmo que alguém obtenha hash do DB, não consegue calcular senha
```

---

## Escalabilidade

### Considerações para múltiplos Auth Services

```
Opção 1: Stateless (Recomendado)
  └─ Cada servidor valida JWT com mesma secret
  └─ Refresh tokens armazenados em banco compartilhado
  └─ Escalável: adicione servidores sem problema

Opção 2: Stateful com Cache
  └─ Cache (Redis) para refresh tokens
  └─ Mais rápido que banco para validação
  └─ Sincronizar entre servidores

Opção 3: Token Blacklist
  └─ Manter blacklist de tokens revogados
  └─ Problema: crescimento contínuo da blacklist
  └─ Não recomendado
```

---

## Diagrama de Estados de Token

```
                    CRIADO
                      │
                      │ JWT.sign()
                      ▼
            ┌─────────────────┐
            │  VÁLIDO        │◄──────┐
            │ (não expirado) │       │
            └─────────┬───────┘       │
                      │              │ POST /refresh
                      │              │
                ┌─────┴──────┐        │
                │           │        │
         Tempo passa   Usuario faz
                │       logout
                │            │
                ▼            ▼
          ┌──────────┐   ┌──────────────┐
          │EXPIRADO  │  │REVOGADO ❌   │
          │❌ (15min)│  │(imediato)    │
          └──────────┘   └──────────────┘
                │             │
                └─────┬────────┘
                      │
            Retorna 401 em
          POST /verify ou /refresh
                      │
                      ▼
            Usuário faz novo login
```

---

## Checklist de Implementação

Ao integrar o Auth Service, verificar:

- [ ] Login funciona e retorna tokens
- [ ] Access Token é válido por 15 minutos
- [ ] Refresh Token é válido por 7 dias
- [ ] `/verify` retorna usuário correto
- [ ] `/refresh` gera novo access token
- [ ] Token expirado retorna 401
- [ ] Logout revoga refresh token
- [ ] Logout não afeta access token (ainda válido por 15 min)
- [ ] Requisições com refresh_token nas credenciais retornam erro
- [ ] Email duplicado retorna 409 Conflict
- [ ] Senha incorreta não revela se email existe
- [ ] Rate limiting está configurado (recomendado)
- [ ] HTTPS está habilitado em produção
- [ ] Secrets não estão em git ou logs

---

## Debugging

### Inspecionar JWT

```javascript
// Decodificar token (sem verificar assinatura)
const jwt = require('jsonwebtoken');
const decoded = jwt.decode(token, { complete: true });

console.log('Header:', decoded.header);
// { alg: 'HS256', typ: 'JWT' }

console.log('Payload:', decoded.payload);
// { sub: 'uuid', email: 'email', iat: 123, exp: 456 }
```

### Verificar Token Expirado

```javascript
const decoded = jwt.decode(token);
const expiresIn = new Date(decoded.exp * 1000) - new Date();
console.log(`Token expira em: ${expiresIn / 1000} segundos`);
```

### Simular Expiração

```bash
# Esperar um pouco e tentar renovar
sleep 2
curl -X POST http://localhost:3001/refresh \
  -H "Content-Type: application/json" \
  -d '{"refresh_token":"..."}'
```
