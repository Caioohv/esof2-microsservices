# 09 — Store Service: rastreamento de visualizações e sistema de apoio à decisão

**Serviço:** store-service  
**Responsável:**  
**Data limite:**  

## Descrição

Implementar rastreamento de visualizações de produto e endpoints de analytics que transformam esse dado em apoio à decisão para dois públicos:

- **Lojista:** entender quais produtos geram interesse mas não convertem em visitas, quais têm baixa visibilidade, e qual o funil geral da sua loja (views → agendamentos).
- **Comprador:** receber recomendações baseadas também em comportamento coletivo ("mais vistos da semana"), não só no perfil de preferências.

> Decisão: integrado no store-service (não um microsserviço separado). O `ProductView` é dado de domínio do produto. Extração para serviço próprio é uma melhoria futura se o volume justificar.

> Depende da task #07 (schema atualizado) e #10 (Visit model) para ter os dados de agendamento disponíveis no funil.

## Schema Prisma

Adicionar ao `schema.prisma` do store-service:

```prisma
model ProductView {
  id        String   @id @default(uuid())
  productId String   @map("product_id")
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  storeId   String   @map("store_id")
  userId    String?  @map("user_id")   // null para visitantes anônimos
  sessionId String   @map("session_id") // identifica sessão anônima
  viewedAt  DateTime @default(now()) @map("viewed_at")

  @@index([productId])
  @@index([storeId])
  @@index([viewedAt])
  @@map("product_views")
}
```

Adicionar relação no model `Product`:
```prisma
model Product {
  ...
  views ProductView[]
}
```

```bash
cd services/store-service
npx prisma migrate dev --name add_product_views
```

## Endpoints a implementar

### `POST /products/:id/view` — registrar visualização

Chamado pelo BFF sempre que o usuário abre a página de um produto. Deve ser leve e assíncrono (não bloqueia a resposta da página).

```js
// product.bs.js
async function registerView(productId, { userId, sessionId }) {
  const product = await repo.findProductById(null, productId);
  if (!product) return; // silencia: não bloquear por erro de tracking
  await viewRepo.insertView({ productId, storeId: product.storeId, userId, sessionId });
}
```

> O controller retorna `204` imediatamente; o insert pode ser fire-and-forget para não atrasar o carregamento da página.

### `GET /products/trending` — produtos mais vistos

Sem autenticação. Retorna os N produtos mais visualizados nas últimas X horas. Usado na homepage.

```js
// view.rep.js
async function findTrending({ hours = 48, limit = 12 } = {}) {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000);
  return prisma.productView.groupBy({
    by: ['productId'],
    where: { viewedAt: { gte: since } },
    _count: { productId: true },
    orderBy: { _count: { productId: 'desc' } },
    take: limit,
  });
  // depois busca os produtos completos pelos ids retornados
}
```

### `GET /stores/:id/analytics` — analytics da loja (lojista)

Requer autenticação. Retorna dados agregados de desempenho da loja:

```js
// analytics.bs.js
async function getStoreAnalytics(storeId, { days = 30 } = {}) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const [viewsByProduct, visitsByProduct] = await Promise.all([
    // total de views por produto nos últimos N dias
    viewRepo.countViewsByProduct(storeId, since),
    // total de agendamentos por produto nos últimos N dias
    visitRepo.countVisitsByProduct(storeId, since),
  ]);

  return viewsByProduct.map(v => {
    const visits = visitsByProduct.find(a => a.productId === v.productId)?._count ?? 0;
    const conversionRate = v._count > 0 ? (visits / v._count) * 100 : 0;
    return {
      productId: v.productId,
      views: v._count,
      appointments: visits,
      conversionRate: parseFloat(conversionRate.toFixed(1)),
      // baixa conversão com muitas views = produto de interesse mas com barreira (preço? fotos?)
      insight: classifyInsight(v._count, visits),
    };
  });
}

function classifyInsight(views, visits) {
  if (views === 0) return 'sem_visibilidade';      // ninguém viu ainda
  if (views > 20 && visits === 0) return 'interesse_sem_conversao'; // muitos views, zero visitas
  if (views > 0 && visits / views >= 0.1) return 'alta_conversao'; // 10%+ convertem
  return 'normal';
}
```

**Resposta exemplo:**
```json
{
  "period": "30d",
  "totals": {
    "views": 342,
    "appointments": 18,
    "conversionRate": 5.3
  },
  "products": [
    {
      "productId": "abc",
      "name": "BMW M340i",
      "views": 89,
      "appointments": 3,
      "conversionRate": 3.4,
      "insight": "interesse_sem_conversao"
    }
  ]
}
```

### Atualizar `GET /products/recommended`

Combinar o perfil do usuário (task #08) com dados de popularidade:

```js
async function getRecommended(userId) {
  const [profile, trending] = await Promise.all([
    fetch(`${USER_SERVICE_URL}/users/${userId}/profile`).then(r => r.ok ? r.json() : null),
    viewRepo.findTrending({ hours: 72, limit: 20 }),
  ]);

  if (!profile) return trending; // sem perfil: retorna trending

  // com perfil: filtra trending pelo que bate com as preferências
  const filters = buildFiltersFromProfile(profile);
  return repo.searchProducts({ ...filters, ids: trending.map(t => t.productId) });
}
```

## Rotas a adicionar

```js
// routes/product.js
router.post('/:id/view', productCtrl.registerView);        // POST /products/:id/view
router.get('/trending', productCtrl.trending);             // GET /products/trending

// routes/store.js
router.get('/:id/analytics', authenticate, storeCtrl.analytics); // GET /stores/:id/analytics
```

## Integração no frontend (BFF — task #14)

Na página do produto (`/products/[id]`), disparar o tracking ao montar a página:

```ts
// app/pages/products/[id].vue
onMounted(() => {
  $fetch(`/api/products/${productId}/view`, {
    method: 'POST',
    body: { sessionId: useSessionId() }, // composable que gera/persiste id anônimo em cookie
  })
})
```

Na homepage, adicionar seção "Em alta" usando `GET /products/trending`:
```ts
const { data: trending } = await useFetch('/api/products/trending')
```

No dashboard do lojista (task #16), adicionar aba de Analytics:
```ts
const { data: analytics } = await useFetch(`/api/stores/${store.id}/analytics`)
```

## Acceptance criteria

- [ ] `POST /products/:id/view` registra view e retorna 204 (não bloqueia se falhar)
- [ ] Views anônimas (sem userId) são registradas com sessionId
- [ ] `GET /products/trending` retorna os mais vistos nas últimas 48h
- [ ] `GET /stores/:id/analytics` retorna views, agendamentos e `conversionRate` por produto
- [ ] Campo `insight` classifica corretamente: `sem_visibilidade`, `interesse_sem_conversao`, `alta_conversao`, `normal`
- [ ] `GET /products/recommended` usa trending como fallback quando usuário não tem perfil
- [ ] Testes unitários para `classifyInsight` e lógica de `getRecommended`
