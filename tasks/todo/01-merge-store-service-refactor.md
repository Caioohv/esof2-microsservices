# 01 — Merge do PR #6 (store-service refatorado)

**Serviço:** store-service  
**Responsável:**  
**Data limite:**  

## Descrição

Fazer o merge do PR #6 (`refactor/store-service-camadas`) para substituir a implementação original do store-service (PR #1) pela versão com Prisma, camadas limpas e testes passando.

Após este merge, o PR #7 (Felipe) pode ser fechado, pois o padrão do projeto usa Prisma.

## Como executar

1. Revisar o PR #6 no GitHub
2. Verificar se os 16 testes passam: `gh pr checkout 6 && cd services/store-service && npm install && npm test`
3. Fazer o merge no GitHub
4. Localmente: `git pull origin master`
5. Fechar o PR #7 com uma nota explicando que o #6 cobre as mesmas mudanças com Prisma

## Acceptance criteria

- [ ] PR #6 merged na master
- [ ] `npm test` no store-service passa localmente após `git pull`
- [ ] PR #7 fechado
