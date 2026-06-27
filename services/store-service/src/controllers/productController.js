const bs = require('../business/product.bs')

exports.createProduct = async (req, res, next) => {
  try {
    const product = await bs.createProduct(req.params.id, req.body)
    res.status(201).json(product)
  } catch (err) {
    next(err)
  }
}

exports.getProducts = async (req, res, next) => {
  try {
    const products = await bs.listProducts(req.params.id)
    res.json(products)
  } catch (err) {
    next(err)
  }
}

exports.getProductById = async (req, res, next) => {
  try {
    const product = await bs.getProduct(req.params.id, req.params.productId)
    res.json(product)
  } catch (err) {
    next(err)
  }
}

exports.updateProduct = async (req, res, next) => {
  try {
    const product = await bs.updateProduct(req.params.id, req.params.productId, req.body)
    res.json(product)
  } catch (err) {
    next(err)
  }
}

exports.deleteProduct = async (req, res, next) => {
  try {
    await bs.deleteProduct(req.params.id, req.params.productId)
    res.status(204).send()
  } catch (err) {
    next(err)
  }
}
