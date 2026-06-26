# [PR #7] Feature/store-service — Refatoração pelo Autor

**Serviço:** store-service  
**Responsável:** Felipe Alexandre  
**PR:** #7 — branch `feature/store-service`  
**Status:** 🔍 Aguardando decisão (conflita com PR #6)

## Descrição

Resposta do Felipe ao review do PR #1. Refatora o store-service com separação em camadas Controller/Service/Repository, removendo as queries SQL dos controllers.

Alterações:
- Separação em camadas Controller, Service e Repository
- Remoção das queries SQL dos Controllers
- Centralização do acesso ao banco nos Repositories
- DELETE retorna HTTP 204

**Diferença do PR #6:** Mantém `pg` (raw SQL) como driver de banco, sem Prisma.

## Como revisar

```bash
gh pr checkout 7
```

## Recomendação

Como o projeto usa **Prisma como ORM padrão** (decisão travada no `spec.md`), e o PR #6 já entrega essa refatoração com Prisma, o PR #7 **pode ser fechado** após o merge do #6. 

Se o grupo preferir manter a contribuição do Felipe, ele pode fazer checkout do PR #6, adicionar sua branch como remote e fazer rebase para colaborar em cima do #6.
