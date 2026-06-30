const { test, mock, beforeEach } = require('node:test');
const assert = require('node:assert/strict');

// --- mocks de módulos externos ---
const repMock = {
  insertUser: mock.fn(),
  findUserById: mock.fn(),
  updateUser: mock.fn(),
  insertSellerProfile: mock.fn(),
  findSellerProfileByUserId: mock.fn(),
  updateSellerProfile: mock.fn(),
  upsertUserProfile: mock.fn(),
  findUserProfileByUserId: mock.fn(),
};

// injeta o mock do repositório antes de carregar o módulo de negócio
const Module = require('node:module');
const originalLoad = Module._load;
Module._load = function (request, parent, isMain) {
  if (request.endsWith('repositories/user.rep')) return repMock;
  return originalLoad.apply(this, arguments);
};

const bs = require('./user.bs');

Module._load = originalLoad;

beforeEach(() => {
  for (const fn of Object.values(repMock)) fn.mock?.resetCalls?.();
});

// --- health ---

test('health: retorna status ok', () => {
  const result = bs.health();
  assert.equal(result.status, 'ok');
  assert.equal(result.service, 'user-service');
});

// --- createUser ---

test('createUser: cria e retorna o usuário', async () => {
  repMock.insertUser.mock.mockImplementation(async (data) => ({ id: 'u1', ...data }));

  const result = await bs.createUser({ id: 'u1', email: 'a@b.com', role: 'CLIENTE' });

  assert.equal(result.id, 'u1');
  assert.equal(result.email, 'a@b.com');
  assert.equal(repMock.insertUser.mock.calls.length, 1);
});

test('createUser: aplica role CLIENTE por padrão', async () => {
  repMock.insertUser.mock.mockImplementation(async (data) => ({ id: 'u1', ...data }));

  await bs.createUser({ email: 'a@b.com' });

  const [arg] = repMock.insertUser.mock.calls[0].arguments;
  assert.equal(arg.role, 'CLIENTE');
});

test('createUser: lança 409 quando email já existe (P2002)', async () => {
  const err = new Error('unique');
  err.code = 'P2002';
  repMock.insertUser.mock.mockImplementation(async () => { throw err; });

  await assert.rejects(() => bs.createUser({ email: 'dup@b.com' }), { status: 409 });
});

// --- getUser ---

test('getUser: retorna o usuário quando existe', async () => {
  repMock.findUserById.mock.mockImplementation(async () => ({ id: 'u1', email: 'a@b.com' }));

  const result = await bs.getUser('u1');

  assert.equal(result.id, 'u1');
});

test('getUser: lança 404 quando não existe', async () => {
  repMock.findUserById.mock.mockImplementation(async () => null);

  await assert.rejects(() => bs.getUser('x'), { status: 404 });
});

// --- getMe ---

test('getMe: lança 401 quando não recebe token', async () => {
  await assert.rejects(() => bs.getMe(), { status: 401 });
});

test('getMe: retorna usuário autenticado quando token é válido', async () => {
  process.env.AUTH_SERVICE_URL = 'http://auth-service:3001';

  const originalFetch = global.fetch;

  global.fetch = mock.fn(async () => ({
    ok: true,
    json: async () => ({
      valid: true,
      user: { id: 'u1', email: 'a@b.com' },
    }),
  }));

  repMock.findUserById.mock.mockImplementation(async () => ({
    id: 'u1',
    email: 'a@b.com',
    role: 'CLIENTE',
  }));

  const result = await bs.getMe('Bearer token-valido');

  assert.equal(result.id, 'u1');
  assert.equal(result.email, 'a@b.com');
  assert.equal(global.fetch.mock.calls.length, 1);
  assert.equal(repMock.findUserById.mock.calls.length, 1);

  global.fetch = originalFetch;
});

test('getMe: lança 401 quando auth-service rejeita token', async () => {
  process.env.AUTH_SERVICE_URL = 'http://auth-service:3001';

  const originalFetch = global.fetch;

  global.fetch = mock.fn(async () => ({
    ok: false,
    json: async () => ({ valid: false }),
  }));

  await assert.rejects(() => bs.getMe('Bearer token-invalido'), { status: 401 });

  global.fetch = originalFetch;
});

// --- updateUser ---

test('updateUser: atualiza e retorna o usuário', async () => {
  repMock.updateUser.mock.mockImplementation(async (id, data) => ({
    id,
    email: data.email,
    role: data.role,
  }));

  const result = await bs.updateUser('u1', {
    email: 'novo@email.com',
    role: 'LOJISTA',
  });

  assert.equal(result.id, 'u1');
  assert.equal(result.email, 'novo@email.com');
  assert.equal(result.role, 'LOJISTA');
  assert.equal(repMock.updateUser.mock.calls.length, 1);
});

test('updateUser: lança 400 quando nenhum campo é enviado', async () => {
  await assert.rejects(() => bs.updateUser('u1', {}), { status: 400 });
});

test('updateUser: lança 404 quando usuário não existe', async () => {
  const err = new Error('not found');
  err.code = 'P2025';

  repMock.updateUser.mock.mockImplementation(async () => {
    throw err;
  });

  await assert.rejects(
    () => bs.updateUser('usuario-inexistente', { email: 'a@b.com' }),
    { status: 404 },
  );
});

test('updateUser: lança 409 quando email já está cadastrado', async () => {
  const err = new Error('unique');
  err.code = 'P2002';

  repMock.updateUser.mock.mockImplementation(async () => {
    throw err;
  });

  await assert.rejects(
    () => bs.updateUser('u1', { email: 'duplicado@email.com' }),
    { status: 409 },
  );
});


// --- SellerProfile ---

test('createSellerProfile: cria perfil de lojista', async () => {
  repMock.findUserById.mock.mockImplementation(async () => ({
    id: 'u1',
    email: 'lojista@email.com',
    role: 'LOJISTA',
  }));

  repMock.insertSellerProfile.mock.mockImplementation(async (data) => ({
    id: 'sp1',
    ...data,
    status: 'pending',
  }));

  const result = await bs.createSellerProfile('u1', {
    businessName: 'Loja Olimpo',
    description: 'Loja de itens premium',
  });

  assert.equal(result.id, 'sp1');
  assert.equal(result.userId, 'u1');
  assert.equal(result.businessName, 'Loja Olimpo');
  assert.equal(result.status, 'pending');
});

test('createSellerProfile: lança 400 quando businessName não é enviado', async () => {
  await assert.rejects(
    () => bs.createSellerProfile('u1', {}),
    { status: 400 },
  );
});

test('createSellerProfile: lança 404 quando usuário não existe', async () => {
  repMock.findUserById.mock.mockImplementation(async () => null);

  await assert.rejects(
    () => bs.createSellerProfile('usuario-inexistente', { businessName: 'Loja' }),
    { status: 404 },
  );
});

test('createSellerProfile: lança 409 quando perfil já existe', async () => {
  repMock.findUserById.mock.mockImplementation(async () => ({
    id: 'u1',
    email: 'lojista@email.com',
    role: 'LOJISTA',
  }));

  const err = new Error('unique');
  err.code = 'P2002';

  repMock.insertSellerProfile.mock.mockImplementation(async () => {
    throw err;
  });

  await assert.rejects(
    () => bs.createSellerProfile('u1', { businessName: 'Loja' }),
    { status: 409 },
  );
});

test('getSellerProfile: retorna perfil de lojista quando existe', async () => {
  repMock.findSellerProfileByUserId.mock.mockImplementation(async () => ({
    id: 'sp1',
    userId: 'u1',
    businessName: 'Loja Olimpo',
    status: 'pending',
  }));

  const result = await bs.getSellerProfile('u1');

  assert.equal(result.id, 'sp1');
  assert.equal(result.userId, 'u1');
  assert.equal(result.businessName, 'Loja Olimpo');
});

test('getSellerProfile: lança 404 quando perfil não existe', async () => {
  repMock.findSellerProfileByUserId.mock.mockImplementation(async () => null);

  await assert.rejects(
    () => bs.getSellerProfile('u1'),
    { status: 404 },
  );
});

test('updateSellerProfile: atualiza perfil de lojista', async () => {
  repMock.updateSellerProfile.mock.mockImplementation(async (userId, data) => ({
    id: 'sp1',
    userId,
    businessName: data.businessName,
    description: data.description,
    status: data.status,
  }));

  const result = await bs.updateSellerProfile('u1', {
    businessName: 'Nova Loja',
    description: 'Nova descrição',
    status: 'approved',
  });

  assert.equal(result.userId, 'u1');
  assert.equal(result.businessName, 'Nova Loja');
  assert.equal(result.description, 'Nova descrição');
  assert.equal(result.status, 'approved');
});

test('updateSellerProfile: lança 400 quando nenhum campo é enviado', async () => {
  await assert.rejects(
    () => bs.updateSellerProfile('u1', {}),
    { status: 400 },
  );
});

test('updateSellerProfile: lança 404 quando perfil não existe', async () => {
  const err = new Error('not found');
  err.code = 'P2025';

  repMock.updateSellerProfile.mock.mockImplementation(async () => {
    throw err;
  });

  await assert.rejects(
    () => bs.updateSellerProfile('u1', { businessName: 'Loja' }),
    { status: 404 },
  );
});

// --- UserProfile ---

test('upsertUserProfile: cria ou atualiza perfil de usuário', async () => {
  repMock.findUserById.mock.mockImplementation(async () => ({
    id: 'u1',
    email: 'cliente@email.com',
    role: 'CLIENTE',
  }));

  repMock.upsertUserProfile.mock.mockImplementation(async (userId, data) => ({
    id: 'up1',
    userId,
    ...data,
  }));

  const result = await bs.upsertUserProfile('u1', {
    minBedrooms: 2,
    minBathrooms: 1,
    wantsGarage: true,
    preferredFuel: 'flex',
    lifestyleTags: ['familia', 'conforto'],
    incomeRange: 'alto',
    preferences: { category: 'imoveis' },
  });

  assert.equal(result.id, 'up1');
  assert.equal(result.userId, 'u1');
  assert.equal(result.minBedrooms, 2);
  assert.equal(result.wantsGarage, true);
  assert.deepEqual(result.lifestyleTags, ['familia', 'conforto']);
});

test('upsertUserProfile: lança 404 quando usuário não existe', async () => {
  repMock.findUserById.mock.mockImplementation(async () => null);

  await assert.rejects(
    () => bs.upsertUserProfile('usuario-inexistente', { incomeRange: 'alto' }),
    { status: 404 },
  );
});

test('upsertUserProfile: lança 400 quando nenhum campo de perfil é enviado', async () => {
  repMock.findUserById.mock.mockImplementation(async () => ({
    id: 'u1',
    email: 'cliente@email.com',
    role: 'CLIENTE',
  }));

  await assert.rejects(
    () => bs.upsertUserProfile('u1', {}),
    { status: 400 },
  );
});

test('getUserProfile: retorna perfil de usuário quando existe', async () => {
  repMock.findUserProfileByUserId.mock.mockImplementation(async () => ({
    id: 'up1',
    userId: 'u1',
    lifestyleTags: ['luxo', 'familia'],
    incomeRange: 'alto',
  }));

  const result = await bs.getUserProfile('u1');

  assert.equal(result.id, 'up1');
  assert.equal(result.userId, 'u1');
  assert.deepEqual(result.lifestyleTags, ['luxo', 'familia']);
});

test('getUserProfile: lança 404 quando perfil não existe', async () => {
  repMock.findUserProfileByUserId.mock.mockImplementation(async () => null);

  await assert.rejects(
    () => bs.getUserProfile('u1'),
    { status: 404 },
  );
});