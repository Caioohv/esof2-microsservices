# Services Documentation

Documentação dos microserviços da plataforma.

## 📚 Serviços Disponíveis

### 🔐 [Auth Service](./auth/)

Serviço centralizado de autenticação e autorização.

- **Porta**: 3001
- **Tecnologia**: Node.js + Express
- **Banco**: MySQL
- **Autenticação**: JWT (Access + Refresh Token)

**Documentação**:
- [README](./auth/README.md) - Visão geral e quick start
- [Setup](./auth/SETUP.md) - Instalação e configuração
- [API Reference](./auth/API.md) - Documentação completa dos endpoints
- [Guia de Integração](./auth/INTEGRATION.md) - Como integrar em outros serviços
- [Fluxo de Autenticação](./auth/FLOW.md) - Diagrama e explicação do fluxo

**Quick Links**:
- Endpoint de login: `POST /login`
- Endpoint de verificação: `POST /verify`
- Endpoint de refresh: `POST /refresh`
- Endpoint de logout: `POST /logout`

---

## 🚀 Como Começar

### 1. Para Desenvolvedores do Backend

Se você está desenvolvendo um novo serviço que precisa de autenticação:

1. Leia [Auth Service - README](./auth/README.md) para entender o conceito
2. Consulte [Integração em Serviços Backend](./auth/INTEGRATION.md#integração-em-serviços-backend) para seu stack
3. Implemente o middleware de autenticação

### 2. Para Desenvolvedores do Frontend

Se você está desenvolvendo o frontend:

1. Leia [Auth Service - README](./auth/README.md)
2. Siga [Integração no Frontend](./auth/INTEGRATION.md#integração-no-frontend)
3. Use os exemplos React/JavaScript fornecidos

### 3. Para DevOps/Infraestrutura

Se você vai fazer deploy:

1. Leia [Setup e Configuração](./auth/SETUP.md)
2. Use o Docker Compose disponível
3. Configure variáveis de ambiente

---

## 🔗 Integração Entre Serviços

```
┌──────────────┐
│  Frontend    │
└──────┬───────┘
       │ Login/Autenticação
       │
┌──────▼──────────────┐
│  Auth Service       │
│  (Centralizado)     │
└─────┬────────────────┘
      │ Valida Tokens
      │
┌─────┴────────────────┐
│  Outros Serviços     │
│  (User, Store, etc)  │
└──────────────────────┘
```

Todos os serviços usam o Auth Service como fonte de verdade para autenticação.

---

## 📋 Estrutura da Documentação

```
docs/
└── services/
    ├── README.md (você está aqui)
    ├── auth/
    │   ├── README.md              # Visão geral
    │   ├── SETUP.md               # Setup local
    │   ├── API.md                 # Endpoints completos
    │   ├── INTEGRATION.md         # Integração em outros serviços
    │   └── FLOW.md                # Fluxo de autenticação
    └── [outros serviços]
```

---

## 🔐 Segurança

Todos os serviços devem:

- ✅ Validar tokens do Auth Service antes de processar requisições
- ✅ Nunca armazenar senhas (isso é responsabilidade do Auth Service)
- ✅ Usar HTTPS em produção
- ✅ Não expor tokens em logs ou mensagens de erro

---

## 💡 Troubleshooting Comum

### Erro "invalid token" mesmo com token válido
→ Ver [Troubleshooting - Token não é reconhecido](./auth/INTEGRATION.md#token-não-é-reconhecido-por-outro-serviço)

### Como renovar um token expirado?
→ Ver [Auth Service - Renovação de Token](./auth/FLOW.md#3️⃣-renovação-de-token-refresh)

### Como fazer logout?
→ Ver [Auth Service - Logout](./auth/API.md#-post-logout)

### Como integrar no meu serviço?
→ Ver [Guia de Integração](./auth/INTEGRATION.md)

---

## 🚀 Deploy em Produção

**Checklist antes de fazer deploy**:

- [ ] JWT_SECRET e JWT_REFRESH_SECRET são strings seguras (32+ chars)
- [ ] Variáveis de ambiente não estão no git
- [ ] HTTPS está habilitado
- [ ] Database backup está configurado
- [ ] Monitoramento/alertas estão ativos
- [ ] Rate limiting está configurado
- [ ] Logs não expõem dados sensíveis

Mais detalhes em [Setup - Checklist de Produção](./auth/SETUP.md#-segurança)

---

## 📞 Suporte

Dúvidas ou problemas?

1. Consulte a documentação específica do serviço
2. Verifique a seção de Troubleshooting
3. Abra uma issue no repositório

---

## 📖 Documentação Relacionada

- [Arquitetura de Microsserviços](../../../uml/microsservicos.md)
- [Comunicação Entre Serviços](../../../uml/comunicacao.md)
- [Pub/Sub](../../../uml/pubsub.md)

---

## 🗂️ Próximos Serviços a Documentar

- [ ] User Service
- [ ] Store Service
- [ ] Payment Service
- [ ] Visit Scheduling Service

Quando novos serviços forem criados, seguir o mesmo padrão de documentação.
