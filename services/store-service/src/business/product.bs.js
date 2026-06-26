const repo = require('../repositories/product.rep');
const storeRepo = require('../repositories/store.rep');
const { AppError } = require('../errors');

async function assertStoreExists(storeId) {
  const store = await storeRepo.findStoreById(storeId);
  if (!store) throw new AppError(404, 'store not found');
}

async function createProduct(storeId, { name, description, price }) {
  if (!name) throw new AppError(400, 'name is required');
  if (price === undefined || price === null) throw new AppError(400, 'price is required');
  await assertStoreExists(storeId);
  return repo.insertProduct(storeId, { name, description, price });
}

async function listProducts(storeId) {
  await assertStoreExists(storeId);
  return repo.findProductsByStore(storeId);
}

async function getProduct(storeId, productId) {
  const product = await repo.findProductById(storeId, productId);
  if (!product) throw new AppError(404, 'product not found');
  return product;
}

async function updateProduct(storeId, productId, { name, description, price }) {
  await getProduct(storeId, productId);
  return repo.updateProduct(productId, { name, description, price });
}

async function deleteProduct(storeId, productId) {
  await getProduct(storeId, productId);
  await repo.deleteProduct(productId);
}

module.exports = {
  createProduct,
  listProducts,
  getProduct,
  updateProduct,
  deleteProduct,
};
