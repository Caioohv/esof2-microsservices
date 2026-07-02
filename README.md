# Trabalho ESOF II - Microsserviços

Marketplace curado de itens high-ticket (imóveis, carros, embarcações, joias, arte) construído sobre arquitetura distribuída de microsserviços. Projeto acadêmico ESOF II.

A plataforma conecta clientes a lojistas selecionados via curadoria editorial e recomendações baseadas em perfil. A venda não acontece online — o marketplace gera o lead e facilita o agendamento de visita presencial.

## Stack Tecnológica

- **Frontend/BFF:** Nuxt 4 (Vue 3) + Tailwind + SSR
- **Backend:** Node.js — Auth em Express, demais serviços em NestJS
- **Banco:** PostgreSQL (serviços) + MySQL (auth)
- **ORM:** Prisma
- **Infraestrutura:** Docker + Docker Compose + Nginx
- **Storage:** MinIO (compatível com S3)
- **Pagamentos:** Stripe, MercadoPago, Efí Pay ou AbacatePay

## Microsserviços

| Serviço | Porta | Status | Descrição |
|---------|-------|--------|-----------|
| webapp (BFF) | 3000 | Em progresso | Frontend Nuxt + BFF |
| auth-service | 3001 | Completo | JWT, login, refresh |
| user-service | 3002 | Pendente | Perfis, roles, questionário |
| payment-service | 3003 | Pendente | Planos de assinatura |
| store-service | 3004 | Pendente | Lojas, produtos, visitas |

## Desenvolvimento

```bash
docker-compose up
```

## Documentação

- [Overview](./docs/overview.md)
- [Arquitetura](./docs/ARCHITECTURE.md)
- [Pendências](./docs/pendencias.md)



