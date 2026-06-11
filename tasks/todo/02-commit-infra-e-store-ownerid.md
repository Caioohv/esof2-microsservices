# 02 — Commit das mudanças unstaged (infra + store ownerId)

**Serviço:** infra / store-service  
**Responsável:**  
**Data limite:**  

## Descrição

Existem mudanças locais não commitadas que precisam entrar na master:

**docker-compose.yml:**
- Adição do container `user-service` (porta 3002, banco `user_db`)
- Mount de `./services/postgres-init:/docker-entrypoint-initdb.d` no PostgreSQL

**store-service:**
- Campo `ownerId` no model `Store` do Prisma + índice `@@index([ownerId])`
- `createStore` agora requer `ownerId` (validação adicionada)
- `listStores` aceita filtro por `ownerId`
- Controller e testes atualizados

**services/postgres-init/01-create-databases.sql:**
- Script para criar `user_db` automaticamente no startup do PostgreSQL

## Como executar

> Fazer isso **após** o merge do PR #6 para evitar conflitos no schema.prisma

```bash
# Verificar o que está pendente
git status
git diff

# Criar migration do Prisma para o ownerId
cd services/store-service
npx prisma migrate dev --name add_owner_id_to_store

# Commitar
cd ../..
git add docker-compose.yml services/store-service/prisma/ services/store-service/src/ services/postgres-init/
git commit -m "feat: add ownerId to Store, mount postgres-init, add user-service to compose"
```

## Acceptance criteria

- [ ] Nenhum arquivo modificado aparece em `git status` (tudo commitado)
- [ ] Migration do Prisma gerada para `ownerId`
- [ ] `docker-compose up` sobe sem erros (user-service + store-service conectam ao postgres)
