# [PR #8] User Service — Implementação Inicial (Mari)

**Serviço:** user-service  
**Responsável:** Mari (mspdutra)  
**PR:** #8 — branch `userserviceImplementMari`  
**Status:** 🚧 Em progresso — incompleto, não pronto para merge

## O que já existe no PR

- Estrutura de pastas em camadas (routes, controllers, business, repositories)
- Configuração do Express
- Endpoint de health check
- `.gitignore`

## O que ainda falta (declarado pela autora)

- Configuração do Prisma e schema de banco de dados
- Criação da entidade User
- Demais endpoints (`POST /register`, `GET /me`, `GET /users/:id`, `POST /permissions/verify`)
- Integração com auth-service (via `POST /auth/verify`)

## Situação de conflito

Existe uma implementação mais completa do user-service em `services/user-service/` na máquina local (ainda não commitada no repositório — aparece como untracked). Essa versão inclui:
- Schema Prisma com `User` e `SellerProfile`
- Business, controllers e repositories para usuários e sellers
- Camadas limpas no padrão do projeto

**Decisão pendente:** O grupo precisa decidir entre:
1. Mari completa sua branch até o nível da implementação local e abre novo commit no PR #8
2. A implementação local (mais completa) é commitada numa branch separada e o PR #8 é fechado

## Como continuar

```bash
gh pr checkout userserviceImplementMari
# Adicionar Prisma, schema, endpoints e testes
# Ver spec em .agent-files/context/spec.md e roadmap.md (Phase 2)
```

## Referência de endpoints esperados (spec.md)

- `POST /users/register`
- `GET /users/me`
- `GET /users/:id`
- `POST /permissions/verify`
- `POST /users/:id/profile` (marketplace)
- `GET /users/:id/profile` (marketplace)
