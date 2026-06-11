# 07 — Store Service: aprovação de loja, autenticação e categorias no schema

**Serviço:** store-service  
**Responsável:**  
**Data limite:**  

## Descrição

Antes de abrir o marketplace, o store-service precisa de três coisas: (1) campo `status` na Store para o fluxo de aprovação, (2) campo `category` no Product para permitir busca cross-store por categoria, e (3) middleware de autenticação que valida token e role via auth-service e user-service. Também é o momento de criar as categorias fechadas e um seed inicial.

## O que implementar

### 1. Atualizar o schema Prisma

```prisma
// Adicionar ao model Store:
status    String   @default("pending")  // pending | approved | rejected
logoUrl   String?  @map("logo_url")

// Atualizar model Product:
model Product {
  id          String   @id @default(uuid())
  storeId     String   @map("store_id")
  store       Store    @relation(fields: [storeId], references: [id], onDelete: Cascade)
  name        String
  description String?
  price       Decimal  @db.Decimal(10, 2)
  category    String   // automovel | imovel | nautico | aviacao | arte | joia
  mediaUrls   String[] @map("media_urls")   // URLs das imagens
  specs       Json?    // specs específicas por categoria (quartos, portas, etc.)
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  @@index([storeId])
  @@index([category])
  @@map("products")
}
```

```bash
cd services/store-service
npx prisma migrate dev --name add_store_status_and_product_category
```

### 2. Middleware de autenticação

Criar `src/middlewares/auth.js`:

```js
const fetch = require('node-fetch'); // ou http nativo — sem nova dependência

async function authenticate(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'authorization required' });

  const r = await fetch(`${process.env.AUTH_SERVICE_URL}/auth/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  });
  if (!r.ok) return res.status(401).json({ error: 'invalid or expired token' });

  req.user = (await r.json()).user;
  next();
}

async function requireRole(role) {
  return async (req, res, next) => {
    const r = await fetch(`${process.env.USER_SERVICE_URL}/permissions/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: req.user.id, type: role }),
    });
    if (!r.ok) return res.status(403).json({ error: 'forbidden' });
    next();
  };
}

module.exports = { authenticate, requireRole };
```

### 3. Aplicar auth nas rotas protegidas

```js
// routes/store.js
const { authenticate, requireRole } = require('../middlewares/auth');

router.get('/', controller.list);              // público — só lojas approved
router.get('/:id', controller.getById);        // público
router.post('/', authenticate, requireRole('LOJISTA'), controller.create); // protegido
router.put('/:id', authenticate, controller.update);     // protegido
router.delete('/:id', authenticate, controller.remove);  // protegido
router.patch('/:id/status', authenticate, controller.updateStatus); // admin

// routes/product.js — idem
router.get('/store/:storeId/products', controller.list);  // público
router.post('/store/:storeId/products', authenticate, requireRole('LOJISTA'), controller.create);
```

### 4. Atualizar `listStores` para filtrar por status

```js
// store.rep.js
async function findStores({ ownerId, status } = {}) {
  return prisma.store.findMany({
    where: {
      ...(ownerId ? { ownerId } : {}),
      ...(status ? { status } : { status: 'approved' }), // default: só approved
    },
    orderBy: { createdAt: 'desc' },
  });
}
```

### 5. Adicionar env vars ao docker-compose

```yaml
store-service:
  environment:
    DATABASE_URL: ...
    PORT: 3004
    AUTH_SERVICE_URL: http://auth-service:3001
    USER_SERVICE_URL: http://user-service:3002
```

### 6. Seed de categorias (na forma de constante)

Criar `src/constants/categories.js`:

```js
const CATEGORIES = ['automovel', 'imovel', 'nautico', 'aviacao', 'arte', 'joia'];
module.exports = { CATEGORIES };
```

Validar no business ao criar produto que `category` é uma das constantes acima.

## Acceptance criteria

- [ ] Migration gerada com `status` em Store, `category` + `mediaUrls` + `specs` em Product
- [ ] `POST /stores` retorna 401 sem token e 403 com token de CLIENTE
- [ ] `GET /stores` retorna apenas lojas com `status: approved`
- [ ] `PATCH /stores/:id/status` aceita `pending | approved | rejected`
- [ ] `POST /stores/:storeId/products` valida que `category` é uma das 6 categorias
- [ ] Testes atualizados para os novos campos e middleware
