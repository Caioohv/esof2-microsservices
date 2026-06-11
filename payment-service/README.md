# Payment Service

Microsserviço de Pagamentos — porta **3003**.

Responsável pelos planos de assinatura e fluxo de checkout para **Lojistas**.  
O pagamento **não** é de clientes comprando produtos; é o Lojista pagando para listar sua loja na plataforma.

---

## Stack

| Item | Tecnologia |
|---|---|
| Runtime | Node.js 20 |
| Framework | Express |
| Banco | MySQL (`payment_db`) |
| Pagamento | Stripe (real) ou mock acadêmico |
| Auth | Integração com `auth-service` via `POST /verify` |

---

## Endpoints

### `GET /plan`
Lista todos os planos disponíveis. **Público**.

**Resposta:**
```json
{
  "plans": [
    {
      "id": "plan-basic-001",
      "name": "Básico",
      "price": 49.90,
      "features": ["Até 5 produtos", "Suporte por email"],
      "duration_days": 30
    }
  ]
}
```

---

### `GET /payment/options`
Lista métodos de pagamento e planos com valores. **Público**.

**Resposta:**
```json
{
  "payment_methods": [
    { "id": "credit_card", "label": "Cartão de Crédito", "installments": true, "max_installments": 12 },
    { "id": "boleto", "label": "Boleto Bancário", "installments": false },
    { "id": "pix", "label": "PIX", "installments": false }
  ],
  "plans": [ ... ]
}
```

---

### `POST /payment/checkout`
Cria uma sessão de checkout. **Requer JWT** (`Authorization: Bearer <token>`).

**Body:**
```json
{ "plan_id": "plan-pro-001" }
```

**Resposta (modo Stripe):**
```json
{
  "checkout_url": "https://checkout.stripe.com/...",
  "session_id": "cs_live_...",
  "mode": "stripe"
}
```

**Resposta (modo mock — sem STRIPE_SECRET_KEY):**
```json
{
  "checkout_url": "http://localhost:3003/payment/success?session_id=mock_session_...&mock=true",
  "session_id": "mock_session_...",
  "mode": "mock",
  "plan": { "name": "Profissional", "price": 99.90 }
}
```

---

### `POST /payment/webhook`
Recebe eventos do Stripe. Configurar no painel do Stripe:  
`https://seu-domínio/payment/webhook`

**Eventos tratados:**
- `checkout.session.completed` → ativa assinatura
- `customer.subscription.deleted` → cancela assinatura
- `mock.payment.success` → ativa assinatura (testes)

**Modo mock** (sem `STRIPE_WEBHOOK_SECRET`):
```bash
curl -X POST http://localhost:3003/payment/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "type": "checkout.session.completed",
    "data": {
      "lojista_id": "<user_id>",
      "plan_id": "plan-pro-001",
      "session_id": "mock_test"
    }
  }'
```

---

### `GET /payment/success`
Página HTML de confirmação exibida após checkout bem-sucedido.

---

### `GET /payment/cancel`
Página HTML exibida quando o usuário cancela o checkout.

---

### `GET /plan/status`
Retorna o status da assinatura do Lojista autenticado. **Requer JWT**.

**Resposta (com assinatura ativa):**
```json
{
  "has_subscription": true,
  "status": "active",
  "subscription": {
    "id": "...",
    "status": "active",
    "expires_at": "2025-07-01T00:00:00.000Z",
    "plan": {
      "id": "plan-pro-001",
      "name": "Profissional",
      "price": 99.90
    }
  }
}
```

**Resposta (sem assinatura):**
```json
{
  "has_subscription": false,
  "status": "none",
  "subscription": null
}
```

---

## Variáveis de Ambiente

| Variável | Padrão | Descrição |
|---|---|---|
| `PORT` | `3003` | Porta do serviço |
| `DB_HOST` | `mysql` | Host do MySQL |
| `DB_NAME` | `payment_db` | Banco de dados |
| `AUTH_SERVICE_URL` | `http://auth-service:3001` | URL do auth-service |
| `STRIPE_SECRET_KEY` | *(vazio)* | Chave secreta Stripe (modo real) |
| `STRIPE_WEBHOOK_SECRET` | *(vazio)* | Secret do webhook Stripe |
| `BASE_URL` | `http://localhost:3003` | URL base para redirects |

> Se `STRIPE_SECRET_KEY` estiver vazio, o serviço opera em **modo mock** — ideal para o ambiente acadêmico.

---

## Setup Local

```bash
cd services/payment-service
cp .env.example .env
npm install
node src/index.js
```

---

## Banco de Dados

O arquivo `init.sql` cria o banco `payment_db` com as tabelas e semeia 3 planos padrão:

| Plano | Preço | Duração |
|---|---|---|
| Básico | R$ 49,90 | 30 dias |
| Profissional | R$ 99,90 | 30 dias |
| Premium | R$ 199,90 | 30 dias |

---

## Fluxo de Pagamento (Mock)

```
1. Lojista faz login → obtém JWT
2. GET /plan → escolhe um plano
3. POST /payment/checkout (JWT + plan_id) → recebe checkout_url
4. Lojista é redirecionado para checkout_url
5. GET /payment/success → assinatura ativada automaticamente
6. GET /plan/status → status: "active"
```

## Fluxo de Pagamento (Stripe Real)

```
1. Lojista faz login → obtém JWT
2. GET /plan → escolhe um plano
3. POST /payment/checkout (JWT + plan_id) → recebe Stripe checkout_url
4. Lojista paga no Stripe
5. Stripe chama POST /payment/webhook com checkout.session.completed
6. Assinatura ativada no banco
7. GET /plan/status → status: "active"
```
