const db = require('../config/db')

async function createStore(name, description, category) {
  const result = await db.query(
    'INSERT INTO stores (name, description, category) VALUES ($1, $2, $3) RETURNING *',
    [name, description, category]
  )

  return result.rows[0]
}

async function getStores() {
  const result = await db.query(
    'SELECT * FROM stores ORDER BY id DESC'
  )

  return result.rows
}

async function getStoreById(id) {
  const result = await db.query(
    'SELECT * FROM stores WHERE id = $1',
    [id]
  )

  return result.rows[0]
}

async function updateStore(id, name, description, category) {
  const result = await db.query(
    `UPDATE stores
     SET name = $1,
         description = $2,
         category = $3
     WHERE id = $4
     RETURNING *`,
    [name, description, category, id]
  )

  return result.rows[0]
}

async function deleteStore(id) {
  await db.query(
    'DELETE FROM stores WHERE id = $1',
    [id]
  )
}

module.exports = {
  createStore,
  getStores,
  getStoreById,
  updateStore,
  deleteStore
}
