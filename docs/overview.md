# Overview do Projeto

**Plataforma de vitrine para lojas high-ticket** (carros, imóveis) com agendamento de visitas presenciais. Projeto acadêmico ESOF II — arquitetura distribuída de microsserviços.

---

## Arquitetura & Modelagem

- **Padrão:** Microsserviços com comunicação REST/HTTP via rede Docker interna
- **Serviços:** Auth (3001), Users (3002), Payment (3003), Store (3004), BFF/Frontend (3000)
- **API Gateway:** Nginx como reverse proxy
- **DB por serviço:** `auth_db`, `users_db`, `store_db`, `payment_db` — todos no mesmo container PostgreSQL em dev
- **Storage:** MinIO (compatível com S3) para imagens/mídia
- **ORM:** Prisma (NestJS services) e acesso direto (Auth service em Express)

---

## Stack Tecnológica

- **Backend:** Node.js — Auth em Express puro, demais em NestJS
- **Frontend/BFF:** Nuxt 3 (Vue) + Tailwind + SSR
- **Banco:** PostgreSQL principal, MySQL no auth_db
- **Infraestrutura:** Docker + Docker Compose

---

## Testes

- Cobertura de testes unitários no **auth-service**: `src/business/auth.bs.test.js`
- Usa `node:test` nativo + mocks de repositório/JWT/crypto via `Module._load`
- Cobre: login, logout, refresh, verify, register — com casos de erro (401, 409)
- Comando: `npm test` → `node --test src/**/*.test.js`

---

## Docker

- `docker-compose.yml` na raiz orquestra todos os serviços
- Cada serviço tem seu container; PostgreSQL e MinIO compartilhados
- Nginx como entry point externo
- Dev: `docker-compose up` sobe tudo

---

## IA / Agentes

- Pasta `.agent-files/` com estrutura para agentes de IA:
  - `context/` — spec, goals, roadmap, memory
  - `prompts/` — plan, develop, review, contextualizer
  - `tasks/` — tarefas pendentes e concluídas

---

## Metodologia

- **Conventional Commits** (`feat:`, `fix:`, `docs:`, `refactor:`)
- **Branching:** `tipo/titulo-da-tarefa` a partir da master
- **Fluxo:** PR aberto → revisão do responsável antes de merge
- Roadmap em 6 fases: Infra → IAM → Store → Agendamento → Pagamentos → Frontend
