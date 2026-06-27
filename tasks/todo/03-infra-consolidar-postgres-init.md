# 03 — ~~Consolidar postgres-init~~ (concluído junto com a migração MySQL→PostgreSQL)

**Status:** ✅ Resolvido — banco unificado `olimpo`

## O que foi feito

A abordagem de múltiplos databases foi descartada em favor de um banco compartilhado único.  
Todos os serviços conectam a `postgresql://postgres:...@postgres:5432/olimpo`.

- Removido container MySQL
- Removida pasta `services/postgres-init/`  
- `POSTGRES_DB=olimpo` no docker-compose
- auth-service migrado de MySQL para PostgreSQL

Esta task não tem mais ações pendentes. Mover para `done/` quando fizer o commit das mudanças de infra.
