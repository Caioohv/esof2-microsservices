const { test, mock, beforeEach } = require('node:test');
const assert = require('node:assert/strict');

// --- mocks de módulos externos ---
const repMock = {
  insertUser: mock.fn(),
  deleteUser: mock.fn(),
  findUserById: mock.fn(),
};

const authClientMock = {
  register: mock.fn(),
  verifyToken: mock.fn(),
};

// injeta mocks antes de carregar o módulo
const Module = require('node:module');
const originalLoad = Module._load;
Module._load = function (request, parent, isMain) {
  if (request.endsWith('repositories/user.rep')) return repMock;
  if (request.endsWith('lib/authClient')) return authClientMock;
  return originalLoad.apply(this, arguments);
};

const bs = require('./user.bs');

Module._load = originalLoad;

// reseta chamadas entre testes
beforeEach(() => {
  for (const fn of Object.values(repMock)) fn.mock?.resetCalls?.();
  for (const fn of Object.values(authClientMock)) fn.mock?.resetCalls?.();
});

// --- register ---

test('register: cria usuário, registra credenciais e retorna dados públicos', async () => {
  repMock.insertUser.mock.mockImplementation(async () => ({
    id: 'u1', email: 'a@b.com', name: 'Ana', type: 'CLIENTE',
  }));
  authClientMock.register.mock.mockImplementation(async () => {});

  const result = await bs.register('Ana', 'a@b.com', 'senha', 'CLIENTE');

  assert.deepEqual(result, { id: 'u1', email: 'a@b.com', name: 'Ana', type: 'CLIENTE' });
  assert.equal(repMock.insertUser.mock.calls.length, 1);
  assert.equal(authClientMock.register.mock.calls.length, 1);
  assert.equal(repMock.deleteUser.mock.calls.length, 0);
});

test('register: usa CLIENTE como tipo padrão', async () => {
  let captured;
  repMock.insertUser.mock.mockImplementation(async (name, email, type) => {
    captured = type;
    return { id: 'u1', email, name, type };
  });
  authClientMock.register.mock.mockImplementation(async () => {});

  await bs.register('Ana', 'a@b.com', 'senha');

  assert.equal(captured, 'CLIENTE');
});

test('register: lança 400 quando type é inválido', async () => {
  await assert.rejects(() => bs.register('Ana', 'a@b.com', 'senha', 'ADMIN'), { status: 400 });
  assert.equal(repMock.insertUser.mock.calls.length, 0);
});

test('register: lança 409 quando email já existe no user_db (P2002)', async () => {
  const err = new Error('unique');
  err.code = 'P2002';
  repMock.insertUser.mock.mockImplementation(async () => { throw err; });

  await assert.rejects(() => bs.register('Ana', 'dup@b.com', 'senha', 'CLIENTE'), { status: 409 });
  assert.equal(authClientMock.register.mock.calls.length, 0);
});

test('register: faz rollback do usuário quando auth-service falha', async () => {
  repMock.insertUser.mock.mockImplementation(async () => ({
    id: 'u1', email: 'a@b.com', name: 'Ana', type: 'CLIENTE',
  }));
  const err = new Error('auth down');
  err.status = 502;
  authClientMock.register.mock.mockImplementation(async () => { throw err; });

  await assert.rejects(() => bs.register('Ana', 'a@b.com', 'senha', 'CLIENTE'), { status: 502 });
  assert.equal(repMock.deleteUser.mock.calls.length, 1);
  assert.equal(repMock.deleteUser.mock.calls[0].arguments[0], 'u1');
});

// --- me / getUser ---

test('me: retorna dados públicos do usuário', async () => {
  repMock.findUserById.mock.mockImplementation(async () => ({
    id: 'u1', email: 'a@b.com', name: 'Ana', type: 'LOJISTA',
  }));

  const result = await bs.me('u1');

  assert.deepEqual(result, { id: 'u1', email: 'a@b.com', name: 'Ana', type: 'LOJISTA' });
});

test('me: lança 404 quando usuário não existe', async () => {
  repMock.findUserById.mock.mockImplementation(async () => null);

  await assert.rejects(() => bs.me('inexistente'), { status: 404 });
});

test('getUser: lança 404 quando usuário não existe', async () => {
  repMock.findUserById.mock.mockImplementation(async () => null);

  await assert.rejects(() => bs.getUser('inexistente'), { status: 404 });
});

// --- verifyPermission ---

test('verifyPermission: LOJISTA possui escopo de criação de loja', async () => {
  repMock.findUserById.mock.mockImplementation(async () => ({ id: 'u1', type: 'LOJISTA' }));

  const result = await bs.verifyPermission('u1', 'store:create');

  assert.deepEqual(result, { allowed: true, type: 'LOJISTA' });
});

test('verifyPermission: CLIENTE não possui escopo de criação de loja', async () => {
  repMock.findUserById.mock.mockImplementation(async () => ({ id: 'u1', type: 'CLIENTE' }));

  const result = await bs.verifyPermission('u1', 'store:create');

  assert.deepEqual(result, { allowed: false, type: 'CLIENTE' });
});

test('verifyPermission: CLIENTE possui escopo de agendamento de visita', async () => {
  repMock.findUserById.mock.mockImplementation(async () => ({ id: 'u1', type: 'CLIENTE' }));

  const result = await bs.verifyPermission('u1', 'visit:create');

  assert.equal(result.allowed, true);
});

test('verifyPermission: lança 404 quando usuário não existe', async () => {
  repMock.findUserById.mock.mockImplementation(async () => null);

  await assert.rejects(() => bs.verifyPermission('inexistente', 'store:read'), { status: 404 });
});
