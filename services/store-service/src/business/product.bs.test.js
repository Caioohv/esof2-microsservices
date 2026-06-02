const { test, mock, beforeEach } = require('node:test');
const assert = require('node:assert/strict');

// --- mocks de módulos externos ---
const productRepMock = {
  insertProduct: mock.fn(),
  findProductsByStore: mock.fn(),
  findProductById: mock.fn(),
  updateProduct: mock.fn(),
  deleteProduct: mock.fn(),
};

const storeRepMock = {
  findStoreById: mock.fn(),
};

const Module = require('node:module');
const originalLoad = Module._load;
Module._load = function (request, parent, isMain) {
  if (request.endsWith('repositories/product.rep')) return productRepMock;
  if (request.endsWith('repositories/store.rep')) return storeRepMock;
  return originalLoad.apply(this, arguments);
};

const bs = require('./product.bs');

Module._load = originalLoad;

beforeEach(() => {
  for (const fn of Object.values(productRepMock)) fn.mock?.resetCalls?.();
  for (const fn of Object.values(storeRepMock)) fn.mock?.resetCalls?.();
});

// --- createProduct ---

test('createProduct: cria o produto quando a loja existe', async () => {
  storeRepMock.findStoreById.mock.mockImplementation(async () => ({ id: 's1' }));
  productRepMock.insertProduct.mock.mockImplementation(async (storeId, data) => ({ id: 'p1', storeId, ...data }));

  const result = await bs.createProduct('s1', { name: 'Produto', price: 10 });

  assert.equal(result.id, 'p1');
  assert.equal(result.storeId, 's1');
  assert.equal(productRepMock.insertProduct.mock.calls.length, 1);
});

test('createProduct: lança 400 quando name está ausente', async () => {
  await assert.rejects(() => bs.createProduct('s1', { price: 10 }), { status: 400 });
  assert.equal(productRepMock.insertProduct.mock.calls.length, 0);
});

test('createProduct: lança 400 quando price está ausente', async () => {
  await assert.rejects(() => bs.createProduct('s1', { name: 'Produto' }), { status: 400 });
});

test('createProduct: aceita price igual a 0', async () => {
  storeRepMock.findStoreById.mock.mockImplementation(async () => ({ id: 's1' }));
  productRepMock.insertProduct.mock.mockImplementation(async (storeId, data) => ({ id: 'p1', storeId, ...data }));

  const result = await bs.createProduct('s1', { name: 'Brinde', price: 0 });

  assert.equal(result.price, 0);
});

test('createProduct: lança 404 quando a loja não existe', async () => {
  storeRepMock.findStoreById.mock.mockImplementation(async () => null);

  await assert.rejects(() => bs.createProduct('inexistente', { name: 'Produto', price: 10 }), { status: 404 });
  assert.equal(productRepMock.insertProduct.mock.calls.length, 0);
});

// --- getProduct ---

test('getProduct: retorna o produto da loja', async () => {
  productRepMock.findProductById.mock.mockImplementation(async () => ({ id: 'p1', storeId: 's1' }));

  const result = await bs.getProduct('s1', 'p1');

  assert.equal(result.id, 'p1');
});

test('getProduct: lança 404 quando o produto não pertence à loja', async () => {
  productRepMock.findProductById.mock.mockImplementation(async () => null);

  await assert.rejects(() => bs.getProduct('s1', 'p999'), { status: 404 });
});

// --- deleteProduct ---

test('deleteProduct: remove o produto existente', async () => {
  productRepMock.findProductById.mock.mockImplementation(async () => ({ id: 'p1', storeId: 's1' }));
  productRepMock.deleteProduct.mock.mockImplementation(async () => {});

  await bs.deleteProduct('s1', 'p1');

  assert.equal(productRepMock.deleteProduct.mock.calls.length, 1);
  assert.equal(productRepMock.deleteProduct.mock.calls[0].arguments[0], 'p1');
});

test('deleteProduct: lança 404 quando o produto não existe', async () => {
  productRepMock.findProductById.mock.mockImplementation(async () => null);

  await assert.rejects(() => bs.deleteProduct('s1', 'p999'), { status: 404 });
  assert.equal(productRepMock.deleteProduct.mock.calls.length, 0);
});
