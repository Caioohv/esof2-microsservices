# 05 — Payment Service: estrutura correta + bypass de assinatura para MVP

**Serviço:** payment-service  
**Responsável:** Christian  
**Data limite:**  

## Descrição

O PR #2 (Christian) tem integração com Stripe mas está com estrutura incorreta e não integra com o padrão do projeto. 

**Decisão de MVP:** a assinatura mensal para criação de loja está **bypassada**. O payment-service precisa existir com a estrutura correta, expor os endpoints esperados, mas retornar sempre `active` sem cobrar de fato. A integração real com Stripe entra como melhoria futura.

## O que precisa ser feito

### 1. Mover para `services/payment-service/`

O código do PR #2 está em `payment-service/payment-service/`. Mover para `services/payment-service/` seguindo o padrão do monorepo.

### 2. Estrutura em camadas

```
services/payment-service/
  src/
    routes/payment.js
    controllers/payment.ctrl.js
    business/payment.bs.js
    repositories/payment.rep.js
    lib/prisma.js
    middlewares/logger.js
    errors.js
    index.js
  prisma/
    schema.prisma
  Dockerfile
  .env.example
  package.json
```

### 3. Schema Prisma (bypass: sem cobranças reais)

```prisma
model PaymentPlan {
  id           String         @id @default(uuid())
  name         String
  price        Decimal        @db.Decimal(10, 2)
  features     String[]
  durationDays Int            @map("duration_days")
  createdAt    DateTime       @default(now()) @map("created_at")
  subscriptions Subscription[]
  @@map("payment_plans")
}

model Subscription {
  id        String      @id @default(uuid())
  lojistaId String      @map("lojista_id")
  planId    String      @map("plan_id")
  plan      PaymentPlan @relation(fields: [planId], references: [id])
  status    String      @default("active")  // active | cancelled | expired
  expiresAt DateTime    @map("expires_at")
  createdAt DateTime    @default(now()) @map("created_at")
  @@index([lojistaId])
  @@map("subscriptions")
}
```

### 4. Endpoints (com bypass)

```
GET  /payment/plans          — lista os planos disponíveis
POST /payment/subscribe      — cria assinatura (bypass: sempre cria com status active)
GET  /payment/subscription/:lojistaId — verifica se lojista tem assinatura ativa
```

A lógica do bypass em `payment.bs.js`:

```js
async function subscribe(lojistaId, planId) {
  // MVP: sem cobrança real, apenas registra como active
  const plan = await repo.findPlanById(planId);
  if (!plan) throw new AppError(404, 'plan not found');

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + plan.durationDays);

  return repo.insertSubscription({ lojistaId, planId, status: 'active', expiresAt });
}

async function hasActiveSubscription(lojistaId) {
  const sub = await repo.findActiveSubscription(lojistaId);
  // MVP: bypass — se não tem assinatura, retorna como se tivesse
  return { active: true, subscription: sub || null, bypassed: !sub };
}
```

### 5. Autenticação via auth-service

Remover qualquer validação JWT local. Usar o padrão do projeto:

```js
const res = await fetch(`${process.env.AUTH_SERVICE_URL}/auth/verify`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ token }),
});
```

### 6. Seed de planos

Criar `prisma/seed.js` com os planos iniciais:

```js
await prisma.paymentPlan.createMany({
  data: [
    { name: 'Básico', price: 299, features: ['5 produtos', 'Página da loja'], durationDays: 30 },
    { name: 'Pro', price: 599, features: ['50 produtos', 'Destaque na busca', 'Analytics'], durationDays: 30 },
  ]
});
```

### 7. Adicionar ao docker-compose

```yaml
payment-service:
  build: ./services/payment-service
  ports:
    - "3003:3003"
  environment:
    DATABASE_URL: postgresql://postgres:${DB_ROOT_PASSWORD:-secret}@postgres:5432/payment_db
    AUTH_SERVICE_URL: http://auth-service:3001
    PORT: 3003
  depends_on:
    postgres:
      condition: service_healthy
```

## Como executar

```bash
# Checkout do PR do Christian como referência
gh pr checkout payment

# Reorganizar os arquivos para services/payment-service/
# Reescrever seguindo o padrão do projeto
cd services/payment-service
npm install
npx prisma migrate dev --name init
node prisma/seed.js
npm test
```

## Acceptance criteria

- [ ] Código em `services/payment-service/` com estrutura em camadas
- [ ] Schema Prisma com `PaymentPlan` e `Subscription`, migration gerada
- [ ] `GET /payment/plans` lista os planos do seed
- [ ] `POST /payment/subscribe` cria assinatura com `status: active` (bypass)
- [ ] `GET /payment/subscription/:lojistaId` retorna `active: true` mesmo sem assinatura real (bypass)
- [ ] Sem JWT validado localmente — usa auth-service/verify
- [ ] Adicionado ao `docker-compose.yml`
- [ ] Testes unitários para os fluxos de business
