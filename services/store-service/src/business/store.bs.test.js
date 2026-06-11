const { test, mock, beforeEach } = require('node:test');
const assert = require('node:assert/strict');

// --- mocks de módulos externos ---
const repMock = {
  insertStore: mock.fn(),
  findStores: mock.fn(),
  findStoreById: mock.fn(),
  updateStore: mock.fn(),
  deleteStore: mock.fn(),
};

// injeta o mock do repositório antes de carregar o módulo de negócio
const Module = require('node:module');
const originalLoad = Module._load;
Module._load = function (request, parent, isMain) {
  if (request.endsWith('repositories/store.rep')) return repMock;
  return originalLoad.apply(this, arguments);
};

const bs = require('./store.bs');

Module._load = originalLoad;

beforeEach(() => {
  for (const fn of Object.values(repMock)) fn.mock?.resetCalls?.();
});

// --- createStore ---

test('createStore: cria e retorna a loja', async () => {
  repMock.insertStore.mock.mockImplementation(async (data) => ({ id: 's1', ...data }));

  const result = await bs.createStore({ ownerId: 'u1', name: 'Loja A', description: 'desc', category: 'cars' });

  assert.equal(result.id, 's1');
  assert.equal(result.ownerId, 'u1');
  assert.equal(result.name, 'Loja A');
  assert.equal(repMock.insertStore.mock.calls.length, 1);
});

test('createStore: lança 400 quando owner_id está ausente', async () => {
  await assert.rejects(() => bs.createStore({ name: 'Loja A' }), { status: 400 });
  assert.equal(repMock.insertStore.mock.calls.length, 0);
});

test('createStore: lança 400 quando name está ausente', async () => {
  await assert.rejects(() => bs.createStore({ ownerId: 'u1', description: 'x' }), { status: 400 });
  assert.equal(repMock.insertStore.mock.calls.length, 0);
});

// --- getStore ---

test('getStore: retorna a loja existente', async () => {
  repMock.findStoreById.mock.mockImplementation(async () => ({ id: 's1', name: 'Loja A' }));

  const result = await bs.getStore('s1');

  assert.equal(result.id, 's1');
});

test('getStore: lança 404 quando a loja não existe', async () => {
  repMock.findStoreById.mock.mockImplementation(async () => null);

  await assert.rejects(() => bs.getStore('inexistente'), { status: 404 });
});

// --- updateStore ---

test('updateStore: lança 404 quando a loja não existe', async () => {
  repMock.findStoreById.mock.mockImplementation(async () => null);

  await assert.rejects(() => bs.updateStore('inexistente', { name: 'novo' }), { status: 404 });
  assert.equal(repMock.updateStore.mock.calls.length, 0);
});

// --- deleteStore ---

test('deleteStore: remove a loja existente', async () => {
  repMock.findStoreById.mock.mockImplementation(async () => ({ id: 's1' }));
  repMock.deleteStore.mock.mockImplementation(async () => {});

  await bs.deleteStore('s1');

  assert.equal(repMock.deleteStore.mock.calls.length, 1);
  assert.equal(repMock.deleteStore.mock.calls[0].arguments[0], 's1');
});

test('deleteStore: lança 404 quando a loja não existe', async () => {
  repMock.findStoreById.mock.mockImplementation(async () => null);

  await assert.rejects(() => bs.deleteStore('inexistente'), { status: 404 });
  assert.equal(repMock.deleteStore.mock.calls.length, 0);
});
