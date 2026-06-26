# 04 — User Service: completar endpoints e integração com auth-service

**Serviço:** user-service  
**Responsável:**  
**Data limite:**  

## Descrição

O user-service local (untracked em `services/user-service/`) já tem estrutura em camadas e os modelos `User` + `SellerProfile`. Faltam os endpoints que outros serviços e o BFF dependem: criação de usuário orquestrando o auth-service, endpoint `/me` autenticado, verificação de permissão por role e o endpoint de perfil de preferências do comprador (`UserProfile`).

> **Decisão:** Usar a implementação local (mais completa) em vez do PR #8 da Mari (só tem health check). Criar uma branch nova, commitar e abrir PR.

## O que já existe (não commitar de novo)

- `User` + `SellerProfile` no schema Prisma
- `POST /users` (cria usuário) — business, controller, repository
- `GET /users/:id`, `PATCH /users/:id`
- `POST /users/:id/seller-profile`, `GET /users/:id/seller-profile`, `PATCH /users/:id/seller-profile`

## O que precisa ser adicionado

### 1. Endpoint `GET /users/me` — usuário autenticado

Precisa validar o token chamando o auth-service antes de retornar:

```js
// user.bs.js
async function getMe(token) {
  const res = await fetch(`${process.env.AUTH_SERVICE_URL}/auth/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  });
  if (!res.ok) throw new AppError(401, 'invalid or expired token');
  const { user: authUser } = await res.json();
  return repo.findUserById(authUser.id);
}
```

Adicionar env var `AUTH_SERVICE_URL=http://auth-service:3001` no docker-compose.

### 2. Endpoint `POST /permissions/verify` — verificação de role

Usado pelo store-service e outros para checar se um usuário é LOJISTA ou CLIENTE:

```js
// user.bs.js
async function verifyPermission(userId, type) {
  const user = await repo.findUserById(userId);
  if (!user) throw new AppError(404, 'user not found');

  if (type === 'LOJISTA') {
    const profile = await sellerRepo.findSellerProfileByUserId(userId);
    if (!profile || profile.status !== 'approved') {
      throw new AppError(403, 'user is not an approved seller');
    }
  }
  // CLIENTE: qualquer usuário registrado é cliente
  return { authorized: true, userId, type };
}
```

### 3. Modelo `UserProfile` — perfil de preferências do comprador

Adicionar ao `schema.prisma`:

```prisma
model UserProfile {
  id             String   @id @default(uuid())
  userId         String   @unique @map("user_id")
  user           User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  // preferências de imóvel
  minBedrooms    Int?     @map("min_bedrooms")
  minBathrooms   Int?     @map("min_bathrooms")
  wantsGarage    Boolean? @map("wants_garage")
  // preferências de veículo
  preferredDoors Int?     @map("preferred_doors")   // 2 ou 4
  preferredFuel  String?  @map("preferred_fuel")    // gasolina | diesel | elétrico | híbrido
  // gerais
  lifestyleTags  String[] @map("lifestyle_tags")    // familia, aventura, negocios, etc.
  incomeRange    String?  @map("income_range")
  preferences    Json?    // campo livre para extensão futura
  createdAt      DateTime @default(now()) @map("created_at")
  updatedAt      DateTime @updatedAt @map("updated_at")

  @@map("user_profiles")
}
```

Rotas:
- `POST /users/:id/profile` — cria ou atualiza (upsert)
- `GET /users/:id/profile` — retorna perfil ou 404

### 4. Integração do `POST /users` com auth-service

Atualmente `createUser` só insere no user-service. Precisa também registrar credencial no auth-service (saga simples com rollback):

```js
async function createUser({ name, email, password }) {
  // 1. inserir usuário no user-service
  const user = await repo.insertUser({ name, email });
  try {
    // 2. registrar credencial no auth-service
    await fetch(`${process.env.AUTH_SERVICE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, email, password }),
    });
  } catch (err) {
    // rollback: remover usuário criado
    await repo.deleteUser(user.id);
    throw new AppError(502, 'failed to register credentials');
  }
  return user;
}
```

## Como executar

```bash
git checkout -b feat/user-service-complete
git add services/user-service/
git commit -m "feat: user-service com User, SellerProfile e estrutura base"

# Adicionar os novos endpoints e o UserProfile
cd services/user-service
npx prisma migrate dev --name add_user_profile
npm test
git add -A && git commit -m "feat: user-service /me, /permissions/verify e UserProfile"
gh pr create --title "feat: user-service completo" --base master
```

## Rotas finais esperadas

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| POST | /users | — | Cria usuário + registra no auth-service |
| GET | /users/me | JWT | Retorna usuário autenticado |
| GET | /users/:id | — | Lookup interno |
| PATCH | /users/:id | — | Atualiza nome |
| POST | /users/:id/seller-profile | — | Solicita perfil de lojista |
| GET | /users/:id/seller-profile | — | Retorna perfil de lojista |
| PATCH | /users/:id/seller-profile | — | Admin atualiza status (pending → approved) |
| POST | /users/:id/profile | JWT | Salva preferências do comprador |
| GET | /users/:id/profile | — | Retorna preferências |
| POST | /permissions/verify | — | Verifica se usuário tem role (LOJISTA/CLIENTE) |

## Acceptance criteria

- [ ] `POST /users` cria usuário e chama auth-service/register; em caso de falha faz rollback
- [ ] `GET /users/me` retorna 401 sem token, retorna usuário com token válido
- [ ] `POST /permissions/verify` retorna 403 para usuário sem SellerProfile approved tentando ser LOJISTA
- [ ] Schema com `UserProfile` e migration gerada
- [ ] `POST/GET /users/:id/profile` funciona
- [ ] Testes unitários cobrindo os fluxos novos
- [ ] PR criado e revisado
