# 08 — Store Service: busca cross-store, recomendações e página da loja

**Serviço:** store-service  
**Responsável:**  
**Data limite:**  

## Descrição

Implementar os endpoints de marketplace: busca de produtos em todas as lojas com filtros, recomendações baseadas no perfil do usuário, e o endpoint de página da loja (todos os produtos de uma loja específica com agrupamento por categoria).

> Depende da task #07 (schema com `category` no Product e lojas com `status`) estar concluída.

## Endpoints a implementar

### `GET /products` — busca cross-store

Query params: `?category=automovel&minPrice=100000&maxPrice=500000&search=bmw&page=1&limit=12`

```js
// product.rep.js
async function searchProducts({ category, minPrice, maxPrice, search, page = 1, limit = 12 }) {
  const skip = (page - 1) * limit;
  const where = {
    store: { status: 'approved' },
    ...(category && { category }),
    ...(minPrice || maxPrice ? {
      price: {
        ...(minPrice && { gte: minPrice }),
        ...(maxPrice && { lte: maxPrice }),
      }
    } : {}),
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }),
  };

  const [total, items] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      include: { store: { select: { id: true, name: true, logoUrl: true } } },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
  ]);

  return { items, total, page, pages: Math.ceil(total / limit) };
}
```

### `GET /products/recommended` — recomendações por perfil

Requer autenticação. Chama user-service para buscar `UserProfile` e aplica filtros heurísticos:

```js
// product.bs.js
async function getRecommended(userId) {
  const res = await fetch(`${process.env.USER_SERVICE_URL}/users/${userId}/profile`);
  if (!res.ok) {
    // sem perfil: retorna produtos em destaque (mais recentes)
    return repo.searchProducts({ limit: 12 });
  }
  const profile = await res.json();
  const filters = buildFiltersFromProfile(profile);
  return repo.searchProducts(filters);
}

function buildFiltersFromProfile(profile) {
  // Exemplo de heurísticas:
  // lifestyleTag "familia" → filtrar imovel com minBedrooms >= 3
  // preferredDoors: 4 → filtrar automovel onde specs.doors === 4
  // incomeRange → faixa de preço
  const incomeRangeMap = {
    'ate-10k':  { maxPrice: 300000 },
    '10k-30k':  { minPrice: 150000, maxPrice: 1000000 },
    '30k-acima': { minPrice: 500000 },
  };
  return incomeRangeMap[profile.incomeRange] || {};
}
```

### `GET /stores/:id` — página da loja

Retorna dados da loja e seus produtos agrupados por categoria:

```js
// store.bs.js
async function getStorePage(id) {
  const store = await repo.findStoreById(id);
  if (!store || store.status !== 'approved') throw new AppError(404, 'store not found');

  const products = await productRepo.findProductsByStore(id);

  // agrupa produtos por categoria
  const byCategory = products.reduce((acc, p) => {
    if (!acc[p.category]) acc[p.category] = [];
    acc[p.category].push(p);
    return acc;
  }, {});

  return { ...store, productsByCategory: byCategory };
}
```

### `GET /categories` — lista as categorias com contagem

```js
// product.rep.js
async function countByCategory() {
  const counts = await prisma.product.groupBy({
    by: ['category'],
    _count: { id: true },
    where: { store: { status: 'approved' } },
  });
  return counts.map(c => ({ category: c.category, count: c._count.id }));
}
```

## Rotas a adicionar em `routes/product.js`

```js
router.get('/', productCtrl.search);                        // GET /products
router.get('/recommended', authenticate, productCtrl.recommended); // GET /products/recommended
router.get('/categories', productCtrl.categories);          // GET /categories
```

E em `routes/store.js`:
```js
router.get('/:id/page', storeCtrl.getPage); // GET /stores/:id/page (página da loja)
```

## Acceptance criteria

- [ ] `GET /products` retorna produtos de lojas aprovadas paginados
- [ ] Filtros `category`, `minPrice`, `maxPrice`, `search` funcionam individualmente e combinados
- [ ] `GET /products/recommended` retorna produtos relevantes para usuário com perfil; retorna destaques para usuário sem perfil
- [ ] `GET /categories` retorna as categorias com contagem de produtos
- [ ] `GET /stores/:id/page` retorna loja + produtos agrupados por categoria
- [ ] Testes de busca com mocks dos filtros
