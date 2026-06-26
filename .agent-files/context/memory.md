# Project Memory - High-Ticket Marketplace

## Historical Decisions
- **Microservices Architecture**: Chosen to separate concerns (Auth, Payment, Store, Users) and allow potential scaling/tech diversity.
- **Pivot para Marketplace**: O projeto era uma "vitrine" de lojas individuais. A visão mudou para um marketplace curado — o cliente navega por produtos de múltiplas lojas, com discovery editorial e recomendações por perfil. A venda ainda não ocorre online; o marketplace gera o lead e facilita o agendamento de visita presencial.
- **Curadoria obrigatória**: Lojas entram por aprovação administrativa, não por cadastro livre. Verticais fechadas: imóveis, carros, embarcações, joias, arte.
- **Questionário de perfil**: Opcional. O cliente informa estilo de vida (família, preferências, renda) para receber recomendações mais adequadas. Armazenado no user-service como `UserProfile`.
- **Loja exclusiva descartada do MVP**: Discutida como subproduto (loja isolada do marketplace com URL própria), mas deixada como melhoria futura. Quando implementada, será um tier de assinatura (`PaymentPlan` com flag), sem mudança arquitetural.
- **Nuxt Preference**: Recommended for the frontend/BFF layer for SEO and server-side capabilities.
- **Microservice Communication**: BFF will serve as a single entry point/orchestrator for the UI.

## Known Gotchas / Constraints
- **Non-Online Sales**: O marketplace gera leads; a venda e negociação ocorrem presencialmente. O agendamento de visita é o core value proposition — não pode ser removido.
- **Payment Scope**: Monetização via assinatura do Lojista (não do item vendido). O cliente não paga na plataforma.
- **Permissions**: Separação clara entre Lojista (dono de loja) e Cliente (comprador) é crítica.
- **Marketplace ≠ Shopee**: O produto deve manter posicionamento premium. Discovery editorial curado é o padrão; busca livre é secundária.

## Resolved Architecture Decisions
- **Framework**: NestJS chosen for all backend services (consistency, DI, module system).
- **ORM**: Prisma (better DX, type-safe migrations vs TypeORM).
- **DB Strategy**: Shared PostgreSQL container, isolated databases per service (not schemas).
- **Inter-service auth**: Services call auth-service `/verify` endpoint — no shared JWT secret in env vars per service.
- **Role check**: Business-layer role enforcement via user-service HTTP call, not BFF.
- **Nginx**: Included in infra as single entry point routing: `/auth` → auth-service, `/users` → user-service, `/store` → store-service, `/payment` → payment-service, `/` → bff.
- **Recomendações**: Implementadas no store-service via chamada ao user-service para obter `UserProfile`. Sem serviço de IA separado no MVP — filtros e ordenação por heurísticas baseadas no perfil.

## Technical Debt / Limitations
- No message broker (RabbitMQ/Kafka) in MVP — direct HTTP inter-service calls accepted.
- No separate dashboard for Lojistas vs Clientes in MVP — single Nuxt app with role-based routing.
- Auth service usa MySQL (legacy); migrar para PostgreSQL em próximo refactor.
