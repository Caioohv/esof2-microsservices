const db = require('../config/db')

exports.createProduct = async (req, res) => {
  try {
    const { id } = req.params
    const { name, description, price } = req.body

    const result = await db.query(
      `INSERT INTO products
      (store_id, name, description, price)
      VALUES ($1, $2, $3, $4)
      RETURNING *`,
      [id, name, description, price]
    )

    res.status(201).json(result.rows[0])
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

exports.getProducts = async (req, res) => {
  try {
    const { id } = req.params

    const result = await db.query(
      'SELECT * FROM products WHERE store_id = $1',
      [id]
    )

    res.json(result.rows)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

exports.getProductById = async (req, res) => {
  try {
    const { id, productId } = req.params

    const result = await db.query(
      'SELECT * FROM products WHERE store_id = $1 AND id = $2',
      [id, productId]
    )

    res.json(result.rows[0])
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

exports.updateProduct = async (req, res) => {
  try {
    const { id, productId } = req.params
    const { name, description, price } = req.body

    const result = await db.query(
      `UPDATE products
       SET name = $1,
           description = $2,
           price = $3
       WHERE store_id = $4 AND id = $5
       RETURNING *`,
      [name, description, price, id, productId]
    )

    res.json(result.rows[0])
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

exports.deleteProduct = async (req, res) => {
  try {
    const { id, productId } = req.params

    await db.query(
      'DELETE FROM products WHERE store_id = $1 AND id = $2',
      [id, productId]
    )

    res.json({
      message: 'Produto removido com sucesso'
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}