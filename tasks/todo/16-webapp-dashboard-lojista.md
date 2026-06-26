# 16 — Webapp: dashboard do lojista (gestão de loja, produtos e visitas)

**Serviço:** webapp  
**Responsável:**  
**Data limite:**  

## Descrição

Implementar o painel do lojista onde ele gerencia sua loja, publica produtos e acompanha as visitas agendadas pelos compradores.

> Depende das tasks #07 (store aprovação + auth), #10 (visitas) e #12 (auth flow) estarem concluídas.  
> Protegido: só acessível por usuários com `SellerProfile.status === 'approved'`.

## O que implementar

### 1. Layout do dashboard

Rota `/dashboard` com sidebar de navegação:
- Visão geral
- Minha loja
- Produtos
- Visitas

### 2. Página `/dashboard` — visão geral

Métricas simples:
- Total de produtos publicados
- Visitas pendentes
- Visitas confirmadas este mês

### 3. Página `/dashboard/store` — editar loja

Form para editar dados da loja: nome, descrição, logo, categoria principal.

- `GET /api/stores?owner_id=:id` → busca a loja do lojista
- `PUT /api/stores/:id` → salva alterações

### 4. Página `/dashboard/products` — gerenciar produtos

Lista de produtos com ações:

```
┌─────────────────────────────────────────────────────────┐
│  Produtos (12)                        [+ Novo produto]  │
├────────────────────────────┬──────────┬────────────────┤
│  BMW M340i xDrive          │ R$390k   │ [Edit] [Del]   │
│  Cobertura Duplex Itaim    │ R$4.8M   │ [Edit] [Del]   │
└────────────────────────────┴──────────┴────────────────┘
```

Modal de criação/edição com campos:
- Nome, descrição, preço
- Categoria (select com as 6 opções)
- Imagens (upload de URL por ora)
- Specs (campos dinâmicos por categoria: quartos para imóvel, portas para carro)

### 5. Página `/dashboard/visits` — gerenciar visitas

```
┌─────────────────────────────────────────────────────────┐
│  Visitas agendadas                    [Pendentes ▾]     │
├────────────┬──────────────────┬───────┬────────────────┤
│  15/07 14h │  BMW M340i       │ João  │ [✓] [✗]        │
│  16/07 10h │  Cobertura Duplex│ Maria │ [✓] [✗]        │
└────────────┴──────────────────┴───────┴────────────────┘
```

- `[✓]` confirma a visita (`PATCH /visits/:id/status` com `confirmed`)
- `[✗]` cancela a visita (`PATCH /visits/:id/status` com `cancelled`)
- Filtro por status (pending / confirmed / cancelled)

### 6. Server routes BFF

```
server/api/dashboard/summary.get.ts
server/api/dashboard/visits.get.ts   → GET  http://store-service:3004/visits?store=:id
server/api/dashboard/visits/[id]/status.patch.ts → PATCH http://store-service:3004/visits/:id/status
```

## Acceptance criteria

- [ ] Acesso ao `/dashboard` redireciona CLIENTE e não logado para a home
- [ ] Lojista vê métricas reais (produtos e visitas)
- [ ] Lojista cria e edita produtos com categoria e specs
- [ ] Lojista confirma e cancela visitas
- [ ] Filtro de visitas por status funciona
