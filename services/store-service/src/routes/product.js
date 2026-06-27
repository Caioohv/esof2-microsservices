const router = require('express').Router();
const controller = require('../controllers/productController');

router.post('/:id/product', controller.createProduct);
router.get('/:id/products', controller.getProducts);
router.get('/:id/product/:productId', controller.getProductById);
router.put('/:id/product/:productId', controller.updateProduct);
router.delete('/:id/product/:productId', controller.deleteProduct);

module.exports = router;
