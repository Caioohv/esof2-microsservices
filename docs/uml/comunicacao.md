# Comunicação entre Serviços

## Modelo de Comunicação

Todos os serviços se comunicam via **REST/HTTP síncrono** sobre a rede interna do Docker (`showcase-network`). Nenhum serviço expõe porta para o host — o único ponto de entrada externo é o Nginx.

```
Internet
   │
 Nginx :443/:80
   │
   ├─► BFF/Nuxt :3000   ──► auth-service  :3001
   │                    ──► user-service  :3002
   │                    ──► payment-svc   :3003
   │                    ──► store-service :3004
   │
   └─► auth-service :3001  (direto para /verify, apenas interno)
```

---

## Regras de Comunicação

### 1. Verificação de Token (todos → auth-service)

Qualquer serviço que precise validar identidade chama:

```
POST http://auth-service:3001/verify
Authorization: Bearer <access_token>

Response 200: { valid: true, user: { id, email } }
Response 401: { valid: false, error: "..." }
```

Serviços que consomem esse endpoint: `user-service`, `payment-service`, `store-service`, `BFF`.

### 2. Criação de Credenciais (user-service → auth-service)

O `user-service` é o único ponto de registro público. Ao criar um usuário, chama internamente:

```
POST http://auth-service:3001/register
Body: { user_id, email, password }

Response 201: { message: "credentials created" }
Response 409: { error: "email already registered" }
```

### 3. Verificação de Permissão (store-service → user-service)

Antes de operações sensíveis (criar loja, confirmar visita), o `store-service` verifica o papel do usuário:

```
GET http://user-service:3002/permissions/verify?userId=<id>&role=LOJISTA

Response 200: { allowed: true }
Response 403: { allowed: false }
```

### 4. Consulta de Perfil (store-service → user-service)

Para enriquecer dados de visitas com informações do cliente:

```
GET http://user-service:3002/user/<id>

Response 200: { id, email, role }
```

### 5. Verificação de Assinatura (store-service → payment-service)

Antes de permitir que um Lojista crie uma loja, verifica se tem assinatura ativa:

```
GET http://payment-service:3003/plan/status
Authorization: Bearer <lojista_token>

Response 200: { status: "ACTIVE", expiresAt: "..." }
```

---

## Tabela de Dependências

| Serviço chamador | Serviço chamado | Motivo |
|---|---|---|
| BFF | auth-service | Verificar token em rotas protegidas |
| BFF | user-service | Registro de novos usuários |
| BFF | store-service | Lojas, produtos, visitas |
| BFF | payment-service | Planos e checkout |
| user-service | auth-service | Criar credenciais no registro |
| store-service | auth-service | Verificar token em todas as rotas |
| store-service | user-service | Verificar role do usuário |
| store-service | payment-service | Verificar assinatura antes de criar loja |
| payment-service | auth-service | Verificar token no checkout e status |
| payment-service | Stripe (externo) | Criar sessão de checkout e validar webhook |

---

## Comunicação Interna vs. Externa

| Tipo | Rota | Acessível por |
|---|---|---|
| **Externa** | `POST /login`, `POST /refresh` | Qualquer cliente via Nginx |
| **Interna** | `POST /verify`, `POST /register` | Apenas serviços dentro do Docker network |
| **Webhook** | `POST /payment/webhook` | Stripe (IP whitelist recomendado) |

> **Isolamento**: O Nginx não expõe diretamente rotas internas dos serviços. As rotas marcadas como "internas" só são acessíveis dentro da rede Docker `showcase-network`.
