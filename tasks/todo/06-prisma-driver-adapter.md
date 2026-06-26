# 06 — Fix: Prisma 7 Driver Adapter em todos os serviços PostgreSQL

**Serviço:** store-service, user-service, payment-service  
**Responsável:**  
**Data limite:**  

## Descrição

O Prisma 7 mudou a API: `new PrismaClient()` simples não funciona com PostgreSQL sem um driver adapter explícito. Sem isso, os serviços falham em runtime com erro de adapter.

Esta pendência afeta todos os serviços que usam PostgreSQL: store-service, user-service e payment-service.

O auth-service usa MySQL e tem seu próprio `prisma.config.js` já configurado.

## Como executar

Para cada serviço (`store-service`, `user-service`, `payment-service`):

```bash
cd services/<nome>-service
npm install @prisma/adapter-pg pg
```

Editar `src/lib/prisma.js`:

```js
const { PrismaClient } = require('../generated/prisma');
const { PrismaLibSQL } = require('@prisma/adapter-libsql'); // ou @prisma/adapter-pg

const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

module.exports = prisma;
```

Editar `prisma/schema.prisma` de cada serviço para habilitar o preview:

```prisma
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["driverAdapters"]
}
```

Rerodar `prisma generate` em cada serviço:

```bash
npx prisma generate
```

## Acceptance criteria

- [ ] store-service inicia sem erro de adapter
- [ ] user-service inicia sem erro de adapter
- [ ] payment-service inicia sem erro de adapter
- [ ] `docker compose up` sobe todos os serviços e eles conectam ao banco
