# [PR #2] Payment Service — Microsserviço de Pagamento (Christian)

**Serviço:** payment-service  
**Responsável:** Christian (ChristyanDutra)  
**PR:** #2 — branch `payment`  
**Status:** 🚧 Em progresso — estrutura incorreta, precisa ser ajustada antes do merge

## O que existe no PR

- Integração com Stripe para pagamentos
- Rotas para planos (`/plan`) e pagamentos (`/payment`)
- Dockerfile e `.env.example`
- `init.sql` com criação de tabela

## Problemas que impedem o merge

### 1. Estrutura de pastas errada
O PR coloca os arquivos em `payment-service/payment-service/` (pasta duplicada), enquanto o padrão do projeto é `services/payment-service/`.

### 2. Acesso ao banco sem Prisma
O PR usa `src/db.js` com queries SQL direto (sem ORM). O projeto usa **Prisma** como ORM padrão (decisão travada).

### 3. Sem camadas
Todo o código está em `src/index.js` + `src/routes/`. Falta a separação `controller → business → repository`.

### 4. Autenticação própria
`src/auth.js` parece reimplementar validação de JWT. O padrão do projeto é chamar `POST /auth/verify` no auth-service, sem replicar a lógica.

### 5. Sem testes
Nenhum arquivo de teste.

### 6. Não está no docker-compose principal
O PR tem um `docker-compose.yml` próprio separado, não integra ao `docker-compose.yml` da raiz.

## Próximos passos

1. Mover arquivos para `services/payment-service/`
2. Criar schema Prisma (`PaymentPlan`, `Subscription`)
3. Refatorar em camadas (`routes → controller → business → repository`)
4. Substituir validação JWT local por chamada ao `auth-service/verify`
5. Adicionar serviço ao `docker-compose.yml` da raiz
6. Adicionar testes unitários
7. Atualizar PR com as correções

Ver task `todo/payment-service-refactor.md` para guia de execução detalhado.
