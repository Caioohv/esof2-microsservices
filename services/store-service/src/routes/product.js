const router = require('express').Router();
const controller = require('../controllers/product.ctrl');

router.post('/:id/product', controller.create);
router.get('/:id/products', controller.list);
router.get('/:id/product/:productId', controller.getById);
router.put('/:id/product/:productId', controller.update);
router.delete('/:id/product/:productId', controller.remove);

module.exports = router;
