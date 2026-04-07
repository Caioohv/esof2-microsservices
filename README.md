# Trabalho ESOF II - Microsserviços

A ideia do projeto é ser um sistema distribuído que tem como produto final um site que funcionará como uma vitrine para lojas High-ticket, como lojas de carros, imobiliárias e outros.

Nós fundamentamos a ideia no fato de que esses tipos de vendas não são feitas online, sendo necessário ver pessoalmente, avaliar, negociar, etc.

## Stack Tecnológica

- Nuxt (recomendo) ou Next
- Node.js
- PostgreSQL
- Docker
- Docker Compose
- Stripe ou MercadoPago ou Efí Pay ou AbacatePay

## Microsserviços

### Auth

**Microsserviço de Autenticação e Autorização.**

Desenvolvido em Node.js (Sugestão: ElysiaJS, NestJS ou Express)

Endpoints e Funcionalidades:

- POST /login - Login
- POST /logout - Logout
- POST /refresh - Refresh token
- POST /verify - Verificar token
...

### Users

Desenvolvido em Node.js (Sugestão: ElysiaJS, NestJS ou Express)

Endpoints e Funcionalidades:

- POST /register - Cadastrar usuário
- GET /permissions - Listar permissões
- GET /permissions/verify - Verificar se usuário possui permissão
- GET /users/me - Obter dados do usuário (incluso tipo -> lojista ou cliente)
...

### Payment

**Microsserviço de Pagamentos.**

Desenvolvido em Node.js (Sugestão: ElysiaJS, NestJS ou Express)

Endpoints e Funcionalidades:

- GET /plan - Listar planos
- GET /payment/options - Listar métodos de pagamento e valores
- POST /payment/checkout - Criar sessão de checkout de pagamento
- POST /payment/webhook - Webhook de pagamento
- GET /payment/success - Página de sucesso
- GET /payment/cancel - Página de cancelamento
- GET /plan/status - status do plano em relação ao seu pagamento
...


### Store

**Microsserviço de Lojas.**

Desenvolvido em Node.js (Sugestão: ElysiaJS, NestJS ou Express)

Endpoints e Funcionalidades:

- POST /store - Criar loja
- GET /store - Listar lojas
- GET /store/:id - Obter loja
- PUT /store/:id - Atualizar loja
- DELETE /store/:id - Deletar loja
- POST /store/:id/product - Criar produto
- GET /store/:id/products - Listar produtos
- GET /store/:id/product/:id - Obter produto
- PUT /store/:id/product/:id - Atualizar produto
- DELETE /store/:id/product/:id - Deletar produto
- POST /visit - Agendar visita
- GET /visit - Listar visitas
- GET /visit/:id - Obter visita
- PUT /visit/:id - Atualizar visita
...

### BFF

**Backend For Frontend**

Microsserviço que fará uma ponte entre o frontend e os outros microsserviços.

Sugestão: Nuxt (ou Next), na parte do server. será integrado ao frontend.

### Frontend

Desenvolvido em Nuxt (ou Next)
Podemos usar:
- Tailwind
- Nuxt UI

### Banco de dados

Instância do PostgreSQL (ou MySQL) com Docker.
Podemos pensar em mongodb

### Nginx

Proxy reverso para lidar com multiplas requisições (não acho que seja necessário)

### S3 (similar)

Algum projeto similar ao AWS S3 para armazenamento de imagens.
Alternativas grátis:
- MinIO
- LocalStack
...