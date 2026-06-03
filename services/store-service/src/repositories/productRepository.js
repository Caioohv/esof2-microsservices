const db = require('../config/db')

async function createProduct(storeId, name, description, price) {
  const result = await db.query(
    `INSERT INTO products
    (store_id, name, description, price)
    VALUES ($1, $2, $3, $4)
    RETURNING *`,
    [storeId, name, description, price]
  )

  return result.rows[0]
}

async function getProducts(storeId) {
  const result = await db.query(
    'SELECT * FROM products WHERE store_id = $1',
    [storeId]
  )

  return result.rows
}

async function getProductById(storeId, productId) {
  const result = await db.query(
    'SELECT * FROM products WHERE store_id = $1 AND id = $2',
    [storeId, productId]
  )

  return result.rows[0]
}

async function updateProduct(storeId, productId, name, description, price) {
  const result = await db.query(
    `UPDATE products
     SET name = $1,
         description = $2,
         price = $3
     WHERE store_id = $4 AND id = $5
     RETURNING *`,
    [name, description, price, storeId, productId]
  )

  return result.rows[0]
}

async function deleteProduct(storeId, productId) {
  await db.query(
    'DELETE FROM products WHERE store_id = $1 AND id = $2',
    [storeId, productId]
  )
}

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct
}
