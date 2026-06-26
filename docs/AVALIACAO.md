# Avaliação Técnica do Projeto

Análise das qualidades estruturais e técnicas do sistema de microsserviços High-Ticket Showcase.

---

## 1. Arquitetura de Software

### Separação de responsabilidades real, não cosmética

O `auth-service` implementa uma cadeia `routes → controller → business → repository` onde cada camada tem papel único e não vaza para as outras. O controller valida entrada, a business layer decide, o repository fala com o banco. Nenhuma query no controller, nenhuma regra de negócio no repository.

```
Request
  └── routes/auth.js         — define endpoints e verbos HTTP
        └── controllers/     — valida input, trata erros HTTP
              └── business/  — lógica de domínio pura
                    └── repositories/ — queries ao banco, sem lógica
```

### Database-per-service com isolamento real

Cada serviço tem seu próprio banco de dados — não schemas separados no mesmo banco. Uma falha ou migração no `store_db` não afeta o `auth_db`. Decisão documentada e motivada em `.agent-files/context/memory.md`.

### Auth centralizado via endpoint, não via segredo compartilhado

Em vez de propagar o `JWT_SECRET` para todos os serviços (anti-padrão comum), qualquer serviço valida tokens chamando `POST /verify` no auth-service. O segredo fica em um único lugar. Mudar o algoritmo de assinatura não exige redeploy de toda a plataforma.

```
Serviço X recebe request com JWT
  └── POST auth-service/verify
        └── auth-service valida e retorna { valid, user }
              └── Serviço X prossegue ou rejeita
```

---

## 2. Segurança

### Derivação de senha com PBKDF2

```js
// crypto.js
crypto.pbkdf2Sync(password, salt, 100_000, 64, 'sha512')
```

100.000 iterações + SHA-512 — recomendação do NIST para derivação de chave de senha. Salt gerado com `crypto.randomBytes(16)` — único por credencial.

### Refresh tokens jamais armazenados em texto claro

```js
// auth.rep.js — ao persistir
tokenHash: hashToken(refreshToken)   // SHA-256 do token

// ao buscar
where: { tokenHash: hashToken(refreshToken) }
```

Se o banco vazar, os tokens não são recuperáveis. O token real nunca toca o banco de dados.

### Dois segredos JWT independentes

`JWT_SECRET` (access token, 15 min) e `JWT_REFRESH_SECRET` (refresh token, 7 dias) são segredos distintos. Um access token vazado não pode ser usado para emitir novos tokens.

### Expiração verificada no banco, não só no JWT

```js
// auth.rep.js
where: {
  tokenHash: hashToken(refreshToken),
  expiresAt: { gt: new Date() },   // ← filtro no banco
}
```

Tokens revogados manualmente não passam mesmo que o JWT ainda seja criptograficamente válido.

### Índices de performance onde importa

```prisma
// schema.prisma
@@index([tokenHash])
@@index([userId])
```

As duas colunas que aparecem em `WHERE` em toda query crítica de autenticação têm índice declarado no schema.

---

## 3. Testes

### Zero dependências de teste

Os testes usam `node:test` e `node:assert/strict` — módulos nativos do Node.js 18+. Sem Jest, Mocha ou Vitest. Isso elimina uma categoria inteira de vulnerabilidades de supply chain e reduz o `node_modules` drasticamente.

### Mocking sem framework

```js
// auth.bs.test.js
Module._load = function (request, parent, isMain) {
  if (request.endsWith('repositories/auth.rep')) return repMock;
  if (request.endsWith('jwt')) return jwtMock;
  if (request.endsWith('crypto')) return cryptoMock;
  return originalLoad.apply(this, arguments);
};
```

Intercepta `Module._load` para injetar mocks antes do `require()` carregar o módulo — a mesma técnica usada internamente pelo Jest, feita sem dependência.

### Cobertura de fluxos do auth-service

| Função | Casos testados |
|--------|---------------|
| `login` | credenciais válidas, usuário inexistente, senha errada |
| `logout` | invocação de `deleteRefreshToken` |
| `refresh` | token válido, JWT inválido, token não está no banco |
| `verify` | token válido, token inválido |
| `register` | sucesso, email duplicado (P2002) |

---

## 4. Infraestrutura

### Health check real no Docker Compose

```yaml
# docker-compose.yml
auth-service:
  depends_on:
    mysql:
      condition: service_healthy   # ← aguarda resposta real do banco
```

`condition: service_healthy` garante que o auth-service só sobe quando o MySQL responde ao `mysqladmin ping`. Não há race condition de "serviço sobe antes do banco estar pronto".

### Dockerfile de produção correto

```dockerfile
FROM node:20-alpine          # imagem mínima
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev        # apenas dependências de produção
COPY src ./src               # apenas o código necessário
ENV NODE_ENV=production
EXPOSE 3001
CMD ["node", "src/index.js"]
```

Nenhuma ferramenta de desenvolvimento, nenhum código de teste, nenhum `node_modules` de dev no container final.

---

## 5. Processo de Desenvolvimento — Spec-Driven Development

### Pipeline de agentes com responsabilidade única

```
Contextualizer → Planner → Task-Creator → Developer → Reviewer
```

Cinco agentes com papéis distintos e não sobrepostos. Cada um lê artefatos da etapa anterior e produz artefatos para a próxima. Nenhum agente toma decisões de arquitetura — elas estão registradas nos arquivos de contexto.

### Decisões de arquitetura versionadas no repositório

```
.agent-files/context/
  spec.md      — stack técnica e decisões travadas
  memory.md    — gotchas, dívida técnica, histórico de decisões
  goals.md     — visão do produto
  roadmap.md   — fases com dependências e critérios de sucesso
```

O raciocínio por trás de cada decisão (por que Prisma, por que NestJS, por que database-per-service) está em texto, no Git, junto com o código que implementa essas decisões.

### Tasks como contratos de implementação

Cada arquivo em `tasks/pending/` contém contexto, steps numerados, acceptance criteria verificável e lista de arquivos a criar/modificar. O Developer Agent não precisa interpretar — só executar. O Reviewer valida contra os mesmos acceptance criteria antes de mover para `tasks/done/`.

---

## 6. Qualidade de Código

### Funções pequenas com responsabilidade única

O `auth.bs.js` tem 5 funções, nenhuma com mais de 15 linhas. O `auth.rep.js` tem 5 funções, cada uma executando exatamente uma operação no banco.

### Erros com semântica HTTP nativa

```js
// errors.js
class AppError extends Error {
  constructor(status, message) { ... }
}

// controller — sem mapeamento manual
res.status(err.status || 500).json({ error: err.message });
```

`AppError` carrega o código HTTP na exceção. O controller propaga sem precisar saber qual erro é qual.

### Sem magic strings no schema

```prisma
model Credential {
  userId       String  @unique @map("user_id")     // TypeScript usa camelCase
  passwordHash String  @map("password_hash")        // banco usa snake_case
  @@map("credentials")                              // declarativo, não manual
}
```

Prisma `@map` e `@@map` separam os nomes TypeScript dos nomes do banco de forma declarativa. Sem conversão manual espalhada pelo código.

---

## Resumo

| Dimensão | Ponto de Destaque |
|----------|------------------|
| **Arquitetura** | Clean Architecture em camadas, database-per-service, auth centralizado via endpoint |
| **Segurança** | PBKDF2+100k iterações, tokens hasheados no banco, dois segredos JWT, expiração dupla |
| **Testes** | Zero dependências externas, mocking nativo, cobertura de todos os fluxos do auth-service |
| **Infraestrutura** | Health check com `condition: service_healthy`, Dockerfile de produção enxuto |
| **Processo** | Pipeline SDD com 5 agentes especializados, decisões de arquitetura versionadas em Git |
| **Código** | Funções ≤15 linhas, erros com status HTTP embutido, schema declarativo sem magic strings |
