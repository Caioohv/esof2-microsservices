# 14 — Webapp: página da loja e página do produto com agendamento

**Serviço:** webapp  
**Responsável:**  
**Data limite:**  

## Descrição

Criar as páginas de loja e produto — as duas telas centrais do fluxo de conversão do marketplace. A página da loja exibe a identidade da loja e seus produtos agrupados por categoria. A página do produto exibe detalhes e o botão de agendar visita.

> Depende das tasks #10 (visit scheduling no store-service), #12 (auth) e #13 (listagem) estarem concluídas.

## O que implementar

### 1. Server routes

```
server/api/stores/[id]/index.get.ts  → GET http://store-service:3004/stores/:id/page
server/api/products/[id].get.ts      → GET http://store-service:3004/products/:id
server/api/visits/index.post.ts      → POST http://store-service:3004/visits (autenticado)
```

### 2. Página `/stores/[id]` — homepage da loja

Criar `app/pages/stores/[id].vue`:

```
┌─────────────────────────────────────────────────┐
│  [logo]  Nome da Loja                           │
│           Tipo · Localização                    │
│           "Sobre a loja..."                     │
├─────────────────────────────────────────────────┤
│  Automóveis (12)                                │
│  [OCard] [OCard] [OCard]                        │
├─────────────────────────────────────────────────┤
│  Imóveis (5)                                    │
│  [OCard] [OCard]                                │
└─────────────────────────────────────────────────┘
```

- Usar a resposta do `GET /stores/:id/page` que já retorna `productsByCategory`
- Iterar as categorias e renderizar um `OCard` por produto

### 3. Página `/products/[id]` — detalhe do produto

Criar `app/pages/products/[id].vue`:

```
┌──────────────────────────────────────────────────┐
│  [galeria de imagens — mediaUrls]               │
├──────────────────────────────────────────────────┤
│  Nome do produto          R$ 390.000            │
│  Categoria · Specs                              │
│  Descrição completa                             │
├──────────────────────────────────────────────────┤
│  [card da loja → link para /stores/:id]         │
├──────────────────────────────────────────────────┤
│  [Botão: Agendar Visita]  ← só para CLIENTE     │
└──────────────────────────────────────────────────┘
```

### 4. Modal de agendamento

Criar `app/components/VisitScheduler.vue`:

```
┌─────────────────────────────┐
│  Agendar visita             │
│                             │
│  Data: [date picker]        │
│  Horário: [time select]     │
│                             │
│  [Cancelar]  [Confirmar]    │
└─────────────────────────────┘
```

Ao confirmar, chama `POST /api/visits`:
```ts
await $fetch('/api/visits', {
  method: 'POST',
  body: {
    productId: product.id,
    scheduledAt: `${date}T${time}:00`,
  },
  headers: { Authorization: `Bearer ${token.value}` },
})
```

### 5. Regras de exibição do botão de agendamento

- **Não logado:** exibe "Entre para agendar" → link para `/login`
- **LOJISTA dono da loja:** não exibe o botão (não faz sentido agendar visita ao próprio produto)
- **CLIENTE ou LOJISTA de outra loja:** exibe "Agendar Visita"

```ts
const { user } = useAuth()
const canSchedule = computed(() =>
  user.value && store.value?.ownerId !== user.value.id
)
```

## Acceptance criteria

- [ ] `/stores/:id` carrega dados reais da loja com produtos agrupados por categoria
- [ ] Clicar num produto navega para `/products/:id`
- [ ] `/products/:id` exibe galeria de imagens, specs e dados da loja
- [ ] Botão de agendamento só aparece para usuários que podem agendar
- [ ] Modal de agendamento envia POST ao store-service e exibe confirmação
- [ ] Agendamento bem-sucedido exibe mensagem de sucesso (não redireciona)
