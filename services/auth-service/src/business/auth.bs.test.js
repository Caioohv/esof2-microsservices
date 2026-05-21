const { test, mock, beforeEach } = require('node:test');
const assert = require('node:assert/strict');

// --- mocks de módulos externos ---
const repMock = {
  findCredentialByEmail: mock.fn(),
  insertRefreshToken: mock.fn(),
  deleteRefreshToken: mock.fn(),
  findActiveRefreshToken: mock.fn(),
  insertCredential: mock.fn(),
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

// injeta mocks antes de carregar o módulo
const Module = require('node:module');
const originalLoad = Module._load;
Module._load = function (request, parent, isMain) {
  if (request.endsWith('repositories/auth.rep')) return repMock;
  if (request.endsWith('jwt')) return jwtMock;
  if (request.endsWith('crypto')) return cryptoMock;
  return originalLoad.apply(this, arguments);
};

const bs = require('./auth.bs');

Module._load = originalLoad;

// reseta chamadas entre testes
beforeEach(() => {
  for (const fn of Object.values(repMock)) fn.mock?.resetCalls?.();
  for (const fn of Object.values(jwtMock)) fn.mock?.resetCalls?.();
  for (const fn of Object.values(cryptoMock)) fn.mock?.resetCalls?.();
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

test('register: insere credencial com sucesso', async () => {
  repMock.insertCredential.mock.mockImplementation(async () => {});

  await assert.doesNotReject(() => bs.register('u1', 'a@b.com', 'senha'));

  assert.equal(repMock.insertCredential.mock.calls.length, 1);
});

test('register: lança 409 quando email já existe (P2002)', async () => {
  const err = new Error('unique');
  err.code = 'P2002';
  repMock.insertCredential.mock.mockImplementation(async () => { throw err; });

  await assert.rejects(() => bs.register('u1', 'dup@b.com', 'senha'), { status: 409 });
});
