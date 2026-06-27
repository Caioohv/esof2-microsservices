# 13 — Webapp: conectar listagem de produtos e busca à API real

**Serviço:** webapp  
**Responsável:**  
**Data limite:**  

## Descrição

A página inicial (`/`) já tem layout completo com hero, categorias, grid de ativos e seção de parceiros — tudo com dados mockados em `<script setup>`. Esta task substitui os dados estáticos pelos dados reais do store-service.

> Depende da task #08 (store-service com `GET /products` e `GET /categories`) estar concluída.

## O que implementar

### 1. Server routes BFF para produtos e lojas

```
server/api/products/index.get.ts      → GET http://store-service:3004/products
server/api/products/recommended.get.ts → GET http://store-service:3004/products/recommended
server/api/categories/index.get.ts    → GET http://store-service:3004/categories
server/api/stores/index.get.ts        → GET http://store-service:3004/stores
```

Os server routes repassam os query params recebidos:

```ts
// server/api/products/index.get.ts
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const config = useRuntimeConfig()
  return $fetch(`${config.storeServiceUrl}/products`, { query })
})
```

### 2. Atualizar `app/pages/index.vue`

Substituir os arrays estáticos (`assets`, `categories`, `partners`) por chamadas à API:

```ts
// Buscar categorias com contagem real
const { data: categoriesData } = await useFetch('/api/categories')
const categories = computed(() => categoriesData.value ?? [])

// Buscar produtos (com filtro reativo)
const activeFilter = ref('all')
const { data: productsData, refresh } = await useFetch('/api/products', {
  query: computed(() => ({
    category: activeFilter.value === 'all' ? undefined : activeFilter.value,
    limit: 12,
  })),
})
const products = computed(() => productsData.value?.items ?? [])

// Para usuário logado: recomendados
const { user, token } = useAuth()
const { data: recommended } = await useFetch('/api/products/recommended', {
  headers: computed(() => token.value ? { Authorization: `Bearer ${token.value}` } : {}),
  immediate: !!user.value,
})
```

### 3. Adaptar `OCard` para o formato real do produto

O componente `OCard` recebe `title`, `specs`, `price`, `category`. O produto da API tem `name`, `specs` (JSON), `price`, `category`, `mediaUrls`. Mapear no template:

```ts
function toCardProps(product) {
  return {
    title: product.name,
    specs: formatSpecs(product.specs, product.category),
    price: formatPrice(product.price),
    category: product.category,
    categoryLabel: CATEGORY_LABELS[product.category],
    image: product.mediaUrls?.[0],
  }
}
```

### 4. Busca com debounce

Adicionar campo de busca que dispara `GET /products?search=...` com 400ms de debounce:

```ts
const searchQuery = ref('')
const debouncedSearch = useDebounce(searchQuery, 400)

watch(debouncedSearch, () => refresh())
```

### 5. Seção "Lojas parceiras" com dados reais

Substituir o array estático `partners` por chamada a `/api/stores`:

```ts
const { data: storesData } = await useFetch('/api/stores', { query: { limit: 8 } })
```

## Acceptance criteria

- [ ] Categorias na homepage mostram contagem real de produtos
- [ ] Grid de ativos carrega produtos do store-service
- [ ] Filtro por categoria funciona sem reload da página
- [ ] Busca por texto funciona com debounce
- [ ] Usuário logado com perfil vê seção "Recomendados para você"
- [ ] Seção de lojas parceiras lista lojas aprovadas reais
- [ ] Estado de loading exibido durante fetch (skeleton ou spinner)
