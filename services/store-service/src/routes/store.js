const router = require('express').Router();
const controller = require('../controllers/storeController');

router.post('/', controller.createStore);
router.get('/', controller.getStores);
router.get('/:id', controller.getStoreById);
router.put('/:id', controller.updateStore);
router.delete('/:id', controller.deleteStore);

module.exports = router;
