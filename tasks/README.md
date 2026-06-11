# Tasks do Projeto — Olimpo

Ver `plano.md` na raiz para contexto completo do projeto, arquitetura e decisões técnicas.

---

## ✅ done/ — Concluído

| Task | Serviço | PR |
|------|---------|-----|
| [auth-service](done/auth-service.md) | auth-service | #3 merged |
| [webapp scaffold + design system](done/webapp-scaffold.md) | webapp | #4 merged |
| [store-service base CRUD](done/store-service-inicial.md) | store-service | #1 merged |
| [infra docker-compose base](done/infra-docker-compose-base.md) | infra | — |

---

## 🔍 to-review/ — PRs abertos prontos para decisão

| Task | Serviço | PR | Recomendação |
|------|---------|-----|-------------|
| [PR #6 store-service refactor (Caio)](to-review/PR6-store-service-refactor-caio.md) | store-service | #6 | **Mergear** |
| [PR #7 store-service refactor (Felipe)](to-review/PR7-store-service-refactor-felipe.md) | store-service | #7 | Fechar (coberto pelo #6) |

---

## 🚧 in-progress/ — Em andamento (incompletos)

| Task | Serviço | PR | Responsável |
|------|---------|-----|-------------|
| [PR #8 user-service inicial (Mari)](in-progress/PR8-user-service-mari.md) | user-service | #8 | Mari |
| [PR #2 payment-service (Christian)](in-progress/PR2-payment-service-christian.md) | payment-service | #2 | Christian |

---

## 📋 todo/ — A fazer (executar na ordem)

### Fase 1 — Estabilização da base

| # | Task | Serviço | Dependência |
|---|------|---------|-------------|
| 01 | [Merge PR #6 store-service](todo/01-merge-store-service-refactor.md) | store-service | — |
| 02 | [Commit infra + store ownerId](todo/02-commit-infra-e-store-ownerid.md) | infra / store | após #01 |
| 03 | [Consolidar postgres-init](todo/03-infra-consolidar-postgres-init.md) | infra | após #02 |
| 04 | [Completar user-service](todo/04-user-service-completar.md) | user-service | após #03 |
| 05 | [Payment service + bypass assinatura](todo/05-payment-service-bypass-e-estrutura.md) | payment-service | após #03 |
| 06 | [Fix Prisma driver adapter](todo/06-prisma-driver-adapter.md) | store / user / payment | após #04 e #05 |

### Fase 2 — Regras de negócio

| # | Task | Serviço | Dependência |
|---|------|---------|-------------|
| 07 | [Store: aprovação + auth middleware](todo/07-store-service-aprovacao-e-auth.md) | store-service | após #04 e #06 |
| 08 | [Store: busca cross-store + recomendações + página da loja](todo/08-store-service-busca-cross-store.md) | store-service | após #07 |
| 09 | [Store: rastreamento de views + analytics (SAD)](todo/09-store-service-tracking-e-analytics.md) | store-service | após #08 e #10 |
| 10 | [Store: agendamento de visitas](todo/10-store-service-agendamento-visitas.md) | store-service | após #07 |
| 11 | [Infra: Nginx reverse proxy](todo/11-infra-nginx.md) | infra | após #05 |

### Fase 3 — Frontend wired

| # | Task | Serviço | Dependência |
|---|------|---------|-------------|
| 12 | [Webapp: auth wired (login + registro)](todo/12-webapp-wiring-auth.md) | webapp | após #04 e #11 |
| 13 | [Webapp: listagem conectada ao store-service](todo/13-webapp-conectar-listagem-produtos.md) | webapp | após #08 e #12 |
| 14 | [Webapp: página da loja + produto + agendamento](todo/14-webapp-pagina-loja-e-produto.md) | webapp | após #10 e #13 |
| 15 | [Webapp: questionário de perfil de preferências](todo/15-webapp-questionario-perfil.md) | webapp | após #04 e #12 |
| 16 | [Webapp: dashboard do lojista](todo/16-webapp-dashboard-lojista.md) | webapp | após #07 e #12 |
