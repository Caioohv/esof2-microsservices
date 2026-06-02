# User Service

Microsserviço de **identidade**. É a fonte de verdade dos usuários da plataforma
(perfil, e-mail, tipo) e o ponto de partida do fluxo de cadastro. As *credenciais*
(senha, tokens) ficam no [auth-service](../auth-service); este serviço apenas
orquestra a criação delas no registro.

## Visão Geral

- **Porta padrão**: 3002
- **Tecnologia**: Node.js + Express
- **Banco de dados**: PostgreSQL (Prisma 7)
- **Arquitetura**: `routes → controller → business → repository` (mesmo padrão do auth-service)

## Responsabilidades

- ✅ Cadastro de usuário (`POST /register`) — cria o usuário e, em seguida, registra
  as credenciais no auth-service. Se o auth falhar, faz rollback do usuário (saga
  com compensação manual — não há transação distribuída entre os bancos).
- ✅ Dados do usuário autenticado (`GET /me`) — valida o token via auth-service.
- ✅ Lookup interno por id (`GET /users/:id`).
- ✅ Verificação de permissão (`POST /permissions/verify`) — modelo MVP baseado no
  tipo (LOJISTA/CLIENTE).

> **Escopo MVP.** Permissões granulares por escopo, acesso multi-loja
> (`UserStoreRole`) e sistema de convites entram numa task futura, junto ao
> store-service.

## Quick Start

```bash
npm install
cp .env.example .env          # ajuste DATABASE_URL / AUTH_SERVICE_URL
npm run db:generate           # gera o Prisma Client
npm run db:migrate            # aplica a migration inicial (precisa do Postgres no ar)
npm start                     # ou: npm run dev
npm test                      # testes unitários (node:test nativo, sem DB)
```

Via Docker Compose (na raiz do repo): `docker compose up postgres user-service`.
A criação do schema é feita via `npm run db:migrate` (mesmo fluxo do auth-service).

> **Nota Prisma 7.** O serviço segue o padrão do auth-service (`new PrismaClient()`).
> No Prisma 7 isso exige um driver adapter em runtime — pendência conhecida que
> afeta auth e user igualmente, a resolver de forma uniforme no repo.

## Variáveis de Ambiente

```
DATABASE_URL=postgresql://postgres:secret@localhost:5432/users_db
AUTH_SERVICE_URL=http://localhost:3001
PORT=3002
```

## Endpoints

| Método | Endpoint | Descrição | Autenticação |
|--------|----------|-----------|--------------|
| POST | `/register` | Cria usuário + credenciais (orquestra o auth) | ❌ |
| GET | `/me` | Dados do usuário autenticado | Via Bearer Token |
| GET | `/users/:id` | Lookup por id | ❌ (uso interno) |
| POST | `/permissions/verify` | Verifica escopo por tipo | ❌ (uso interno) |

Detalhes de payloads e respostas em [docs/services/user/API.md](../../docs/services/user/API.md).

## Arquitetura

```
user-service/
├── src/
│   ├── index.js                  # servidor Express
│   ├── routes/user.js            # rotas
│   ├── controllers/user.ctrl.js  # validação de input + erros HTTP
│   ├── business/user.bs.js       # regras + orquestração (saga de registro)
│   ├── business/user.bs.test.js  # testes unitários (mocks nativos)
│   ├── repositories/user.rep.js  # acesso ao banco (Prisma)
│   ├── middlewares/
│   │   ├── auth.js               # valida token via auth-service/verify
│   │   └── logger.js
│   ├── lib/
│   │   ├── prisma.js             # Prisma Client
│   │   └── authClient.js         # cliente HTTP do auth-service
│   └── errors.js                 # AppError (status HTTP embutido)
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── Dockerfile
└── package.json
```
