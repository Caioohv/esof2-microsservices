# Infraestrutura — Docker Compose Base

**Serviço:** infra  
**Responsável:** Caio Vieira  
**Status:** ✅ Concluído (parcialmente — ver unstaged)

## O que foi feito

- `docker-compose.yml` com MySQL (auth-service), PostgreSQL (serviços Node), auth-service e store-service containerizados
- Health checks com `condition: service_healthy` em todos os serviços dependentes de banco
- `docker-compose.prod.yml` para ambiente de produção
- `.env.example` na raiz com todas as variáveis necessárias
- `services/postgres-init/01-create-databases.sql` criando `user_db` (pendente criar `store_db` e `payment_db`)
- Padrão Dockerfile validado: `node:20-alpine`, `npm ci --omit=dev`, sem código de teste na imagem

## O que está unstaged (pendente commit)

- Adição do `user-service` ao docker-compose
- Mount do `postgres-init` no container PostgreSQL (para criar os bancos automaticamente)
- Essas mudanças estão em `services/postgres-init/` e `docker-compose.yml` não commitados
