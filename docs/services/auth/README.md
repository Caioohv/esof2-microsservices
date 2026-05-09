# Auth Service

O **Auth Service** é um microserviço centralizado responsável pela autenticação e autorização em toda a plataforma. Ele gerencia credenciais de usuários, emissão de tokens JWT e validação de acesso.

## 📋 Visão Geral

- **Porta padrão**: 3001
- **Tecnologia**: Node.js + Express
- **Banco de dados**: MySQL
- **Autenticação**: JWT (Access Token + Refresh Token)
- **Segurança**: PBKDF2 para hash de senhas, SHA256 para refresh tokens

## 🔑 Recursos Principais

- ✅ Autenticação via email e senha
- ✅ Emissão de Access Token (15 minutos) e Refresh Token (7 dias)
- ✅ Validação de tokens
- ✅ Logout com revogação de refresh tokens
- ✅ Registro de novos usuários (via user-service)
- ✅ Segurança: senhas hasheadas com PBKDF2, tokens armazenados com SHA256

## 📚 Documentação

- **[Setup e Configuração](./SETUP.md)** - Como configurar e inicializar o serviço
- **[API Reference](./API.md)** - Documentação completa dos endpoints
- **[Guia de Integração](./INTEGRATION.md)** - Como integrar o auth service em outros serviços
- **[Fluxo de Autenticação](./FLOW.md)** - Diagrama e explicação do fluxo de autenticação

## 🚀 Quick Start

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente (copiar .env.example)
cp .env.example .env

# Iniciar o serviço
npm start

# Ou em modo desenvolvimento
npm run dev
```

## 🔐 Variáveis de Ambiente

```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=secret
DB_NAME=auth_db
JWT_SECRET=sua_chave_secreta_aqui
JWT_REFRESH_SECRET=sua_chave_refresh_secreta_aqui
PORT=3001
```

## 💡 Exemplo de Uso

```bash
# Login
curl -X POST http://localhost:3001/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"senha123"}'

# Resposta
{
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc..."
}

# Verificar token
curl -X POST http://localhost:3001/verify \
  -H "Authorization: Bearer eyJhbGc..."

# Resposta
{
  "valid": true,
  "user": {
    "id": "user-uuid",
    "email": "user@example.com"
  }
}
```

## 🔄 Endpoints

| Método | Endpoint | Descrição | Autenticação |
|--------|----------|-----------|--------------|
| POST | `/login` | Login com email e senha | ❌ |
| POST | `/refresh` | Renovar access token | ❌ |
| POST | `/verify` | Validar access token | Via Bearer Token |
| POST | `/logout` | Logout e revogação de token | ❌ |
| POST | `/register` | Registrar novas credenciais | ❌ (Uso interno) |

## 🏗️ Arquitetura

```
auth-service/
├── src/
│   ├── index.js          # Servidor Express
│   ├── routes/
│   │   └── auth.js       # Rotas de autenticação
│   ├── jwt.js            # Funções JWT
│   ├── crypto.js         # Hash de senhas
│   └── db.js             # Conexão com MySQL
├── init.sql              # Schema do banco de dados
├── Dockerfile            # Imagem Docker
└── package.json
```

## 🔒 Segurança

- Senhas são hasheadas com PBKDF2 (100.000 iterações)
- Access tokens expiram em 15 minutos
- Refresh tokens expiram em 7 dias e são revogáveis
- Refresh tokens são armazenados como hash SHA256 no banco
- Todas as respostas de erro são genéricas para evitar enumeração de usuários

## 📞 Suporte

Para dúvidas sobre integração ou problemas, consulte a documentação de integração ou entre em contato com o time de backend.
