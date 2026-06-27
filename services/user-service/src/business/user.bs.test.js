const { test, mock, beforeEach } = require('node:test');
const assert = require('node:assert/strict');

// --- mocks de módulos externos ---
const repMock = {
  insertUser: mock.fn(),
  findUserById: mock.fn(),
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
