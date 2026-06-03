const repository = require('../repositories/productRepository')

async function createProduct(storeId, data) {
  return repository.createProduct(
    storeId,
    data.name,
    data.description,
    data.price
  )
}

async function getProducts(storeId) {
  return repository.getProducts(storeId)
}

async function getProductById(storeId, productId) {
  return repository.getProductById(storeId, productId)
}

async function updateProduct(storeId, productId, data) {
  return repository.updateProduct(
    storeId,
    productId,
    data.name,
    data.description,
    data.price
  )
}

async function deleteProduct(storeId, productId) {
  return repository.deleteProduct(storeId, productId)
}

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct
}
