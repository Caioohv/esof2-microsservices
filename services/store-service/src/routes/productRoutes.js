const express = require('express')
const router = express.Router()

const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController')

router.post('/:id/product', createProduct)
router.get('/:id/products', getProducts)
router.get('/:id/product/:productId', getProductById)
router.put('/:id/product/:productId', updateProduct)
router.delete('/:id/product/:productId', deleteProduct)

module.exports = router