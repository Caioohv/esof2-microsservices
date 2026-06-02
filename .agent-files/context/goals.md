# Project Goals - High-Ticket Marketplace

## Product Vision

Criar um marketplace curado de itens high-ticket (imóveis, carros, embarcações, joias, arte) sobre arquitetura distribuída de microsserviços. A plataforma conecta clientes a lojistas aprovados via discovery editorial e recomendações personalizadas. O fechamento da venda ocorre presencialmente — o sistema gera o lead e agenda a visita.

## Princípios do Marketplace

- **Curadoria sobre volume**: lojas entram por aprovação, não por cadastro livre
- **Discovery editorial**: a experiência padrão é curada (destaques, recomendações), não busca crua
- **Perfil opcional**: o cliente pode informar seu estilo de vida para receber recomendações mais adequadas
- **Identidade da loja preservada**: cada loja tem sua página própria mesmo dentro do marketplace
- **Visita presencial como core**: o agendamento é o diferencial e não pode ser removido

## Roadmap Imediato

- [ ] **Infrastructure Setup**: Docker Compose para PostgreSQL, S3 (MinIO) e serviços
- [ ] **Auth & Users**: Identidade, JWT, perfil de usuário e questionário opcional
- [ ] **Store & Marketplace**: CRUD de lojas/produtos + busca cross-store + recomendações por perfil
- [ ] **Scheduling**: Agendamento de visitas presenciais
- [ ] **Frontend/BFF**: Nuxt com experiência de marketplace curado
- [ ] **Payments**: Modelo de assinatura para lojistas

## Critérios de Sucesso

- Integração fluida entre microsserviços
- UI premium (Nuxt + Tailwind) com experiência de marketplace curado
- Busca cross-store funcional com filtros por categoria, preço e localização
- Recomendações por perfil retornando resultados relevantes
- Fluxo completo: discovery → página do produto → agendamento de visita
