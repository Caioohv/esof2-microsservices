# Store Service — Implementação Inicial

**Serviço:** store-service  
**Responsável:** Felipe Alexandre  
**PR:** #1 (merged)  
**Status:** ✅ Concluído (base)

## O que foi feito

CRUD completo de lojas e produtos:

- `GET/POST /store` — listagem e criação de lojas
- `GET/PUT/DELETE /store/:id` — operações por loja
- `POST /store/:id/product` — adicionar produto à loja
- `GET/PUT/DELETE /store/:id/product/:productId` — operações por produto
- Dockerfile, `.env.example`, estrutura em camadas

## Observação

Esta implementação original usa `pg` com SQL direto nos controllers. O PR #6 (em `to-review/`) refatora para Prisma + camadas limpas conforme o padrão do projeto. Após o merge do #6, esta task representa apenas a base histórica.
