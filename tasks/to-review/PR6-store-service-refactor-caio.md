# [PR #6] Refactor store-service — Camadas + Prisma + Ajustes

**Serviço:** store-service  
**Responsável:** Caio Vieira  
**PR:** #6 — branch `refactor/store-service-camadas`  
**Status:** 🔍 Aguardando revisão e merge

## Descrição

Refatoração completa do store-service (originado do review do PR #1). É a versão que segue o padrão do projeto:

- Camadas limpas: `routes → controller → business → repository`
- Migração para **Prisma 7** + schema declarativo (removido `init.sql` e queries SQL hard-coded)
- `uuid` em vez de `SERIAL` para ids (alinhamento com user-service)
- Dockerfile preenchido e correto (estava vazio no PR original)
- `.env.example` e `.gitignore` adicionados
- store-service adicionado ao `docker-compose.yml`
- Retorno HTTP 204 em DELETE (antes retornava 200 com corpo vazio)
- Retorno 404 uniforme para recurso inexistente (antes retornava 200 vazio)
- Porta corrigida para 3004 (estava usando 3003, porta do payment-service)
- 16/16 testes passando (`node:test`, mocks nativos)

## Como revisar

```bash
gh pr checkout 6
cd services/store-service
npm install
npm test
```

## Conflito com PR #7

O PR #7 (Felipe) também refatora o store-service mas **mantém `pg` em vez de Prisma**. Como o projeto adota Prisma como ORM padrão (decisão travada no spec), **o PR #6 deve ter prioridade**. Após merge do #6, o PR #7 pode ser fechado ou rebaseado para contribuições adicionais.

## ⚠️ Notas pós-merge

- O `postgres` adicionado neste PR pode conflitar com o do PR do user-service. Resolver para um único container PostgreSQL com múltiplos DBs (ver task `todo/infra-consolidar-postgres.md`).
- Após este PR entrar, as mudanças unstaged de `owner_id` na master precisam ser commitadas.
