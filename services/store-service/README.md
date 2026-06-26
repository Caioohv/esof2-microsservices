# Store Service

Microsserviço de **core business**: gerencia **lojas** e seus **produtos**. É a
fonte de verdade do catálogo da plataforma. A autorização (quem pode criar/editar
uma loja) é orquestrada pelo BFF/gateway, que valida o token no
[auth-service](../auth-service) e a permissão no [user-service](../user-service)
antes de chamar este serviço.

## Visão Geral

- **Porta padrão**: 3004
- **Tecnologia**: Node.js + Express
- **Banco de dados**: PostgreSQL (Prisma 7)
- **Arquitetura**: `routes → controller → business → repository` (mesmo padrão do auth/user-service)

## Responsabilidades

- ✅ CRUD de lojas (`/store`)
- ✅ CRUD de produtos aninhados na loja (`/store/:id/product`)
- ✅ Validação de input e regras (campos obrigatórios, loja/produto inexistente → 404)

> **Autorização.** Os ids vêm na rota (`/store/:id/...`). Quem garante que a loja
> pertence ao usuário e que ele tem permissão é o BFF, que orquestra auth + user
> antes de encaminhar a requisição — este serviço não confia diretamente no cliente.

## Quick Start

```bash
npm install
cp .env.example .env          # ajuste DATABASE_URL
npm run db:generate           # gera o Prisma Client
npm run db:migrate            # aplica a migration inicial (precisa do Postgres no ar)
npm start                     # ou: npm run dev
npm test                      # testes unitários (node:test nativo, sem DB)
```

Via Docker Compose (na raiz do repo): `docker compose up postgres store-service`.

> **Nota Prisma 7.** O serviço segue o padrão do auth/user-service (`new PrismaClient()`).
> No Prisma 7 isso exige um driver adapter em runtime — pendência conhecida que
> afeta os serviços igualmente, a resolver de forma uniforme no repo.

## Variáveis de Ambiente

```
DATABASE_URL=postgresql://postgres:secret@localhost:5432/store_db
PORT=3004
```

## Endpoints

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/store` | Cria loja |
| GET | `/store` | Lista lojas |
| GET | `/store/:id` | Detalhes da loja |
| PUT | `/store/:id` | Atualiza loja |
| DELETE | `/store/:id` | Remove loja (204) |
| POST | `/store/:id/product` | Cria produto na loja |
| GET | `/store/:id/products` | Lista produtos da loja |
| GET | `/store/:id/product/:productId` | Detalhes do produto |
| PUT | `/store/:id/product/:productId` | Atualiza produto |
| DELETE | `/store/:id/product/:productId` | Remove produto (204) |

## Arquitetura

```
store-service/
├── src/
│   ├── index.js                    # servidor Express
│   ├── routes/
│   │   ├── store.js                # rotas de loja
│   │   └── product.js              # rotas de produto (aninhadas em /store/:id)
│   ├── controllers/
│   │   ├── store.ctrl.js           # validação de input + erros HTTP
│   │   └── product.ctrl.js
│   ├── business/
│   │   ├── store.bs.js             # regras de negócio
│   │   ├── product.bs.js
│   │   └── *.bs.test.js            # testes unitários (mocks nativos)
│   ├── repositories/
│   │   ├── store.rep.js            # acesso ao banco (Prisma)
│   │   └── product.rep.js
│   ├── middlewares/
│   │   └── logger.js
│   ├── lib/
│   │   └── prisma.js               # Prisma Client (singleton)
│   └── errors.js                   # AppError (status HTTP embutido)
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── Dockerfile
└── package.json
```
