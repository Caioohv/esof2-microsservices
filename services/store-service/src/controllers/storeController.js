const db = require('../config/db')

exports.createStore = async (req, res) => {
  try {
    const { name, description, category } = req.body

    const result = await db.query(
      'INSERT INTO stores (name, description, category) VALUES ($1, $2, $3) RETURNING *',
      [name, description, category]
    )

    res.status(201).json(result.rows[0])
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

exports.getStores = async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM stores ORDER BY id DESC'
    )

    res.json(result.rows)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

exports.getStoreById = async (req, res) => {
  try {
    const { id } = req.params

    const result = await db.query(
      'SELECT * FROM stores WHERE id = $1',
      [id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Loja não encontrada'
      })
    }

    res.json(result.rows[0])
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

exports.updateStore = async (req, res) => {
  try {
    const { id } = req.params
    const { name, description, category } = req.body

    const result = await db.query(
      `UPDATE stores
       SET name = $1,
           description = $2,
           category = $3
       WHERE id = $4
       RETURNING *`,
      [name, description, category, id]
    )

    res.json(result.rows[0])
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

exports.deleteStore = async (req, res) => {
  try {
    const { id } = req.params

    await db.query(
      'DELETE FROM stores WHERE id = $1',
      [id]
    )

    res.json({
      message: 'Loja deletada com sucesso'
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}