const { test, mock, beforeEach } = require('node:test');
const assert = require('node:assert/strict');

// --- mocks de módulos externos ---
const repMock = {
  findCredentialByEmail: mock.fn(),
  insertRefreshToken: mock.fn(),
  deleteRefreshToken: mock.fn(),
  findActiveRefreshToken: mock.fn(),
  insertCredential: mock.fn(),
  deleteCredentialByUserId: mock.fn(async () => {}),
};

const jwtMock = {
  issueAccessToken: mock.fn(() => 'access-token'),
  issueRefreshToken: mock.fn(() => 'refresh-token'),
  verifyAccessToken: mock.fn(),
  verifyRefreshToken: mock.fn(),
};

const cryptoMock = {
  generateSalt: mock.fn(() => 'salt'),
  hashPassword: mock.fn(() => 'hashed'),
};

const userClientMock = {
  createUser: mock.fn(async () => ({ id: 'u1' })),
};

// injeta mocks antes de carregar o módulo
const Module = require('node:module');
const originalLoad = Module._load;
Module._load = function (request, parent, isMain) {
  if (request.endsWith('repositories/auth.rep')) return repMock;
  if (request.endsWith('clients/user.client')) return userClientMock;
  if (request.endsWith('jwt')) return jwtMock;
  if (request.endsWith('/crypto')) return cryptoMock; // só o módulo local ../crypto, não o builtin
  return originalLoad.apply(this, arguments);
};

const bs = require('./auth.bs');

Module._load = originalLoad;

// reseta chamadas entre testes
beforeEach(() => {
  for (const fn of Object.values(repMock)) fn.mock?.resetCalls?.();
  for (const fn of Object.values(jwtMock)) fn.mock?.resetCalls?.();
  for (const fn of Object.values(cryptoMock)) fn.mock?.resetCalls?.();
  userClientMock.createUser.mock.resetCalls();
  userClientMock.createUser.mock.mockImplementation(async () => ({ id: 'u1' }));
});

// --- login ---

test('login: retorna tokens quando credenciais são válidas', async () => {
  repMock.findCredentialByEmail.mock.mockImplementation(async () => ({
    userId: 'u1',
    email: 'a@b.com',
    passwordHash: 'hashed',
    passwordSalt: 'salt',
  }));
  repMock.insertRefreshToken.mock.mockImplementation(async () => {});

  const result = await bs.login('a@b.com', 'password');

  assert.equal(result.access_token, 'access-token');
  assert.equal(result.refresh_token, 'refresh-token');
});

test('login: lança 401 quando usuário não existe', async () => {
  repMock.findCredentialByEmail.mock.mockImplementation(async () => null);

  await assert.rejects(() => bs.login('x@x.com', 'pass'), { status: 401 });
});

test('login: lança 401 quando senha está errada', async () => {
  repMock.findCredentialByEmail.mock.mockImplementation(async () => ({
    userId: 'u1',
    email: 'a@b.com',
    passwordHash: 'outro-hash',
    passwordSalt: 'salt',
  }));

  await assert.rejects(() => bs.login('a@b.com', 'errada'), { status: 401 });
});

// --- logout ---

test('logout: chama deleteRefreshToken', async () => {
  repMock.deleteRefreshToken.mock.mockImplementation(async () => {});

  await bs.logout('token');

  assert.equal(repMock.deleteRefreshToken.mock.calls.length, 1);
});

// --- refresh ---

test('refresh: retorna novo access token quando token é válido', async () => {
  jwtMock.verifyRefreshToken.mock.mockImplementation(() => ({ sub: 'u1', email: 'a@b.com' }));
  repMock.findActiveRefreshToken.mock.mockImplementation(async () => ({ id: '1' }));

  const result = await bs.refresh('valid-token');

  assert.equal(result.access_token, 'access-token');
});

test('refresh: lança 401 quando token JWT é inválido', async () => {
  jwtMock.verifyRefreshToken.mock.mockImplementation(() => { throw new Error('expired'); });

  await assert.rejects(() => bs.refresh('bad-token'), { status: 401 });
});

test('refresh: lança 401 quando token não está no banco', async () => {
  jwtMock.verifyRefreshToken.mock.mockImplementation(() => ({ sub: 'u1', email: 'a@b.com' }));
  repMock.findActiveRefreshToken.mock.mockImplementation(async () => null);

  await assert.rejects(() => bs.refresh('revogado'), { status: 401 });
});

// --- verify ---

test('verify: retorna payload quando token é válido', () => {
  jwtMock.verifyAccessToken.mock.mockImplementation(() => ({ sub: 'u1', email: 'a@b.com' }));

  const result = bs.verify('valid-token');

  assert.deepEqual(result, { valid: true, user: { id: 'u1', email: 'a@b.com' } });
});

test('verify: lança 401 quando token é inválido', () => {
  jwtMock.verifyAccessToken.mock.mockImplementation(() => { throw new Error('invalid'); });

  assert.throws(() => bs.verify('bad'), { status: 401 });
});

// --- register ---

test('register: cria credencial e usuário, retorna user_id', async () => {
  repMock.insertCredential.mock.mockImplementation(async () => {});

  const result = await bs.register('a@b.com', 'senha');

  assert.equal(repMock.insertCredential.mock.calls.length, 1);
  assert.equal(userClientMock.createUser.mock.calls.length, 1);
  assert.equal(result.email, 'a@b.com');
  assert.equal(result.role, 'CLIENTE');
  assert.ok(result.user_id);
});

test('register: usa a role informada', async () => {
  repMock.insertCredential.mock.mockImplementation(async () => {});

  const result = await bs.register('lojista@b.com', 'senha', 'LOJISTA');

  assert.equal(result.role, 'LOJISTA');
  const [arg] = userClientMock.createUser.mock.calls[0].arguments;
  assert.equal(arg.role, 'LOJISTA');
});

test('register: lança 409 quando email já existe (P2002)', async () => {
  const err = new Error('unique');
  err.code = 'P2002';
  repMock.insertCredential.mock.mockImplementation(async () => { throw err; });

  await assert.rejects(() => bs.register('dup@b.com', 'senha'), { status: 409 });
  assert.equal(userClientMock.createUser.mock.calls.length, 0);
});

test('register: faz rollback da credencial se o user-service falhar', async () => {
  repMock.insertCredential.mock.mockImplementation(async () => {});
  userClientMock.createUser.mock.mockImplementation(async () => {
    const e = new Error('user-service unreachable');
    e.status = 502;
    throw e;
  });

  await assert.rejects(() => bs.register('a@b.com', 'senha'), { status: 502 });
  assert.equal(repMock.deleteCredentialByUserId.mock.calls.length, 1);
});
