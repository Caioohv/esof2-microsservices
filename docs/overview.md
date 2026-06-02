# Overview do Projeto

**Marketplace curado de itens high-ticket** (imóveis, carros, embarcações, joias, arte) com agendamento de visitas presenciais. Projeto acadêmico ESOF II — arquitetura distribuída de microsserviços.

A venda não acontece online. O marketplace gera o lead e facilita o contato entre cliente e lojista; o fechamento ocorre presencialmente.

---

## Conceito de Marketplace

- **Curado, não aberto:** lojas entram por aprovação. Não é qualquer vendedor.
- **Verticais fechadas:** imóveis, carros, embarcações, joias, arte — categorias que fazem sentido juntas.
- **Discovery editorial:** a página inicial apresenta destaques, recém-chegados e recomendações — não uma grade infinita de produtos.
- **Perfil opcional:** o cliente pode responder um questionário de perfil (estilo de vida, família, preferências) para receber recomendações mais adequadas. Totalmente opcional.
- **Loja com identidade:** cada loja tem sua página própria com história, especialidade e portfólio. O produto aparece no marketplace mas pertence à loja.
- **Visita presencial:** o diferencial da plataforma. O cliente descobre no marketplace e agenda a visita pelo sistema.

---

## Arquitetura & Modelagem

- **Padrão:** Microsserviços com comunicação REST/HTTP via rede Docker interna
- **Serviços:** Auth (3001), Users (3002), Payment (3003), Store (3004), BFF/Frontend (3000)
- **API Gateway:** Nginx como reverse proxy
- **DB por serviço:** `auth_db`, `users_db`, `store_db`, `payment_db`
- **Storage:** MinIO (compatível com S3) para imagens e mídia
- **ORM:** Prisma (NestJS services) e acesso direto (Auth service em Express)

---

## Stack Tecnológica

- **Backend:** Node.js — Auth em Express puro, demais em NestJS
- **Frontend/BFF:** Nuxt 4 (Vue 3) + Tailwind + SSR
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
- Roadmap em 6 fases: Infra → IAM → Store/Marketplace → Agendamento → Pagamentos → Frontend

---

## Melhorias Futuras

- **Loja Exclusiva:** plano premium onde o lojista tem uma loja isolada do marketplace, com URL própria e experiência de site individual — sem aparecer na busca geral. Não é um produto separado; é um tier de assinatura dentro da mesma plataforma.
