# 10 — Store Service: agendamento de visitas (Phase 4)

**Serviço:** store-service  
**Responsável:**  
**Data limite:**  

## Descrição

Implementar o fluxo de agendamento de visita presencial — a proposta de valor central do marketplace.

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | /visits | Cliente agenda visita a um produto |
| GET | /visits | Lojista lista visitas agendadas para sua loja |
| PATCH | /visits/:id/status | Lojista confirma ou cancela visita |

## Modelo de dados (spec.md)

```prisma
model Visit {
  id          String   @id @default(uuid())
  clientId    String   @map("client_id")
  productId   String   @map("product_id")
  product     Product  @relation(fields: [productId], references: [id])
  scheduledAt DateTime @map("scheduled_at")
  status      String   @default("pending")  // pending | confirmed | cancelled
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  @@index([clientId])
  @@index([productId])
  @@map("visits")
}
```

## Como executar

> Depende das tasks #07 (aprovação/role) e #04 (user-service) estarem concluídas.

```bash
cd services/store-service
npx prisma migrate dev --name add_visits

# Criar:
# src/business/visit.bs.js  — regras: não agendar em loja não aprovada, não duplicar visita
# src/controllers/visit.ctrl.js
# src/repositories/visit.rep.js
# src/routes/visit.js

npm test
```

## Acceptance criteria

- [ ] Cliente autenticado consegue agendar visita a produto de loja aprovada
- [ ] Lojista consegue listar visitas à sua loja
- [ ] Lojista consegue confirmar ou cancelar visita (`PATCH /visits/:id/status`)
- [ ] Status só aceita transições válidas: `pending → confirmed`, `pending → cancelled`, `confirmed → cancelled`
- [ ] Visita a loja não aprovada retorna 400
- [ ] Testes unitários cobrindo os fluxos principais
