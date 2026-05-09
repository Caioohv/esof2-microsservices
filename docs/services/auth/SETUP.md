# Auth Service - Setup e Configuração

Instruções completas para configurar e inicializar o Auth Service.

## Pré-requisitos

- Node.js 18+ instalado
- MySQL 8.0+ rodando e acessível
- npm ou yarn

## Instalação Rápida

### 1. Clonar e Instalar Dependências

```bash
cd services/auth-service
npm install
```

### 2. Configurar Variáveis de Ambiente

```bash
cp .env.example .env
```

Editar `.env` com suas configurações:

```env
# Banco de Dados
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=sua_senha_aqui
DB_NAME=auth_db

# JWT Secrets (MUDE ISSO EM PRODUÇÃO!)
JWT_SECRET=sua_chave_secreta_muito_longa_aqui
JWT_REFRESH_SECRET=sua_chave_refresh_secreta_aqui

# Porta do Serviço
PORT=3001
```

### 3. Inicializar Banco de Dados

```bash
mysql -u root -p < init.sql
```

Se solicitado, insira a senha do MySQL.

**Importante**: O script `init.sql` criará:
- Database `auth_db`
- Tabela `credentials` (email, user_id, hashes de senha)
- Tabela `refresh_tokens` (tokens revogáveis)

### 4. Iniciar o Serviço

```bash
npm start
```

Você deve ver:

```
auth-service running on port 3001
```

### 5. Testar Conexão

```bash
curl -X POST http://localhost:3001/verify
```

Deve retornar status 401 (esperado, sem token):

```json
{
  "error": "token required"
}
```
 
Se chegou aqui, o serviço está funcionando!

---

## Docker (Opcional)

### Build da Imagem

```bash
docker build -t auth-service .
```

### Executar com Docker

```bash
docker run -p 3001:3001 \
  -e DB_HOST=host.docker.internal \
  -e DB_USER=root \
  -e DB_PASSWORD=secret \
  -e DB_NAME=auth_db \
  -e JWT_SECRET=sua_chave_secreta \
  -e JWT_REFRESH_SECRET=sua_chave_refresh \
  auth-service
```

### Docker Compose

Criar `docker-compose.yml`:

```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: secret
      MYSQL_DATABASE: auth_db
    ports:
      - "3306:3306"
    volumes:
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
      - mysql_data:/var/lib/mysql

  auth-service:
    build: .
    ports:
      - "3001:3001"
    environment:
      DB_HOST: mysql
      DB_USER: root
      DB_PASSWORD: secret
      DB_NAME: auth_db
      JWT_SECRET: ${JWT_SECRET:-change_me_in_production}
      JWT_REFRESH_SECRET: ${JWT_REFRESH_SECRET:-change_me_refresh_in_production}
    depends_on:
      - mysql

volumes:
  mysql_data:
```

Iniciar:

```bash
docker-compose up -d
```

---

## 🔧 Configuração Detalhada

### Variáveis de Ambiente

| Variável | Descrição | Padrão | Obrigatório |
|----------|-----------|--------|-------------|
| `DB_HOST` | Host do MySQL | `localhost` | ✅ Sim |
| `DB_PORT` | Porta do MySQL | `3306` | ❌ Não |
| `DB_USER` | Usuário MySQL | `root` | ✅ Sim |
| `DB_PASSWORD` | Senha MySQL | | ✅ Sim |
| `DB_NAME` | Nome do banco | `auth_db` | ❌ Não |
| `JWT_SECRET` | Chave para sign de access tokens | | ✅ Sim |
| `JWT_REFRESH_SECRET` | Chave para sign de refresh tokens | | ✅ Sim |
| `PORT` | Porta do serviço | `3001` | ❌ Não |

### Geração de JWT Secrets

Gerar chaves seguras:

```bash
# Com Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Com OpenSSL
openssl rand -hex 32

# Com Python
python3 -c "import secrets; print(secrets.token_hex(32))"
```

### Exemplo de Configuração Segura

```env
# .env (Desenvolvimento)
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=dev_password_123
DB_NAME=auth_db
JWT_SECRET=development_secret_key_this_is_not_secure_change_in_production
JWT_REFRESH_SECRET=development_refresh_secret_also_change_in_production
PORT=3001
NODE_ENV=development

# Para Produção, gerar secrets com:
# node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 🗄️ Estrutura do Banco de Dados

### Tabela: credentials

Armazena credenciais de login dos usuários.

```sql
CREATE TABLE credentials (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  password_salt VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**Campos**:
- `id`: UUID único da credencial
- `user_id`: UUID do usuário (vinculado ao User Service)
- `email`: Email único do usuário
- `password_hash`: Senha hasheada com PBKDF2
- `password_salt`: Salt usado no hash (único por usuário)
- `created_at`: Data/hora de criação
- `updated_at`: Data/hora da última atualização

### Tabela: refresh_tokens

Armazena refresh tokens emitidos para revogação.

```sql
CREATE TABLE refresh_tokens (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  token_hash VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES credentials(user_id) ON DELETE CASCADE
);
```

**Campos**:
- `id`: UUID único do refresh token record
- `user_id`: UUID do usuário
- `token_hash`: SHA256 hash do refresh token (não o token em si!)
- `expires_at`: Data/hora de expiração
- `created_at`: Data/hora de criação

---

## 🧪 Teste de Funcionalidade

### 1. Testar Endpoint /verify (sem token)

```bash
curl -X POST http://localhost:3001/verify \
  -H "Content-Type: application/json"
```

**Resposta esperada**:
```json
{
  "error": "token required"
}
```

**Status**: 401

### 2. Registrar Novo Usuário

Primeiro, criar credenciais via `/register` (chamado normalmente pelo User Service):

```bash
curl -X POST http://localhost:3001/register \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "test@example.com",
    "password": "senha123456"
  }'
```

**Resposta esperada**:
```json
{
  "message": "credentials created"
}
```

**Status**: 201

### 3. Fazer Login

```bash
curl -X POST http://localhost:3001/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "senha123456"
  }'
```

**Resposta esperada**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDAiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJpYXQiOjE2NTMyNjUwMDAsImV4cCI6MTY1MzI2NTkwMH0.xxx",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxx"
}
```

**Status**: 200

### 4. Verificar Access Token

Use o `access_token` da resposta anterior:

```bash
curl -X POST http://localhost:3001/verify \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Resposta esperada**:
```json
{
  "valid": true,
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "test@example.com"
  }
}
```

**Status**: 200

### 5. Renovar Token

Use o `refresh_token`:

```bash
curl -X POST http://localhost:3001/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```

**Resposta esperada**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Status**: 200

### 6. Fazer Logout

```bash
curl -X POST http://localhost:3001/logout \
  -H "Content-Type: application/json" \
  -d '{
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```

**Resposta esperada**: (vazio)

**Status**: 204

---

## Troubleshooting

### Erro: "connect ECONNREFUSED"

**Problema**: Não consegue conectar ao MySQL

**Soluções**:

```bash
# 1. Verificar se MySQL está rodando
mysql -u root -p -e "SELECT 1"

# 2. Verificar credenciais em .env
cat .env

# 3. Testar conexão direta
mysql -h localhost -u root -p -e "SHOW DATABASES"
```

### Erro: "ER_NO_DB_ERROR"

**Problema**: Banco de dados `auth_db` não existe

**Solução**:

```bash
# Executar o script de inicialização
mysql -u root -p < init.sql

# Ou criar manualmente
mysql -u root -p -e "CREATE DATABASE auth_db;"
```

### Erro: "listen EADDRINUSE"

**Problema**: Porta 3001 já está em uso

**Soluções**:

```bash
# 1. Encontrar processo usando porta 3001
lsof -i :3001
# ou
netstat -tulpn | grep 3001

# 2. Matar o processo
kill -9 <PID>

# 3. Ou usar porta diferente
PORT=3002 npm start
```

### Erro: "Cannot find module 'express'"

**Problema**: Dependências não instaladas

**Solução**:

```bash
npm install
```

### Token sempre retorna erro "invalid token"

**Problema**: JWT secret errado ou token foi criado com secret diferente

**Soluções**:

```bash
# 1. Verificar se JWT_SECRET está correto em .env
cat .env | grep JWT_SECRET

# 2. Se mudou a secret, fazer novo login para obter novo token
# 3. Limpar tokens antigos e fazer login novamente
```

### Erro "email already registered"

**Problema**: Email já foi cadastrado

**Solução**:

```bash
# 1. Usar email diferente
# 2. Ou remover do banco de dados
mysql -u root -p auth_db -e "DELETE FROM credentials WHERE email = 'seu@email.com';"
```

---

## Monitoramento

### Visualizar Logs

```bash
# Durante execução (logs em tempo real)
npm run dev

# Ou com arquivo
npm start > auth.log 2>&1
tail -f auth.log
```

### Verificar Saúde do Serviço

```bash
# Simples verificação de conectividade
curl http://localhost:3001/verify 2>/dev/null || echo "Serviço offline"
```

### Query no Banco para Debug

```bash
# Conectar ao DB
mysql -u root -p auth_db

# Ver users cadastrados
SELECT id, email, created_at FROM credentials;

# Ver refresh tokens ativos
SELECT * FROM refresh_tokens WHERE expires_at > NOW();

# Ver tokens expirados
SELECT * FROM refresh_tokens WHERE expires_at < NOW();

# Contar logins por usuário
SELECT user_id, COUNT(*) FROM refresh_tokens GROUP BY user_id;
```

---

## Segurança

### Checklist de Produção

- [ ] JWT_SECRET e JWT_REFRESH_SECRET são strong (32+ caracteres, aleatórios)
- [ ] Variáveis de ambiente não estão no git (`.env` em `.gitignore`)
- [ ] DB_PASSWORD é forte
- [ ] MySQL está com acesso restrito (não localhost:3306 exposto publicamente)
- [ ] HTTPS está habilitado (se usando Auth Service em produção)
- [ ] Logs não expõem tokens ou senhas
- [ ] Rate limiting está configurado para `/login` (opcional, pode adicionar)
- [ ] Backup do banco está configurado
- [ ] Monitoramento/alertas para falhas de autenticação estão ativos

### Rate Limiting (Recomendado)

```javascript
// Adicionar ao src/index.js
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 tentativas
  message: 'Muitas tentativas de login, tente novamente mais tarde'
});

app.post('/login', loginLimiter, authRoutes);
```

Instalar: `npm install express-rate-limit`

---

## Próximos Passos

1. **Integrar com User Service**: O User Service deve chamar `/register` ao criar novo usuário
2. **Integrar com Gateway/API**: O API Gateway deve validar tokens chamando `/verify`
3. **Integrar Frontend**: Ver [Guia de Integração](./INTEGRATION.md)
4. **Configurar HTTPS**: Em produção, usar HTTPS
5. **Setup de Backup**: Fazer backup regular do banco de dados

---

## Documentação Relacionada

- [API Reference](./API.md) - Documentação dos endpoints
- [Guia de Integração](./INTEGRATION.md) - Como integrar em outros serviços
- [Fluxo de Autenticação](./FLOW.md) - Diagrama do fluxo
- [README](./README.md) - Visão geral
