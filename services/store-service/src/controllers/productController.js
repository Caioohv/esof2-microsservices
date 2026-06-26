const productService = require('../services/productService')

exports.createProduct = async (req, res) => {
  try {
    const product = await productService.createProduct(
      req.params.id,
      req.body
    )

    res.status(201).json(product)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

exports.getProducts = async (req, res) => {
  try {
    const products = await productService.getProducts(
      req.params.id
    )

    res.json(products)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

exports.getProductById = async (req, res) => {
  try {
    const product = await productService.getProductById(
      req.params.id,
      req.params.productId
    )

    res.json(product)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

exports.updateProduct = async (req, res) => {
  try {
    const product = await productService.updateProduct(
      req.params.id,
      req.params.productId,
      req.body
    )

    res.json(product)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

exports.deleteProduct = async (req, res) => {
  try {
    await productService.deleteProduct(
      req.params.id,
      req.params.productId
    )

    return res.status(204).send()
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
