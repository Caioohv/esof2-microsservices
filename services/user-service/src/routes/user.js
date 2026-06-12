const router = require('express').Router();
const controller = require('../controllers/user.ctrl');

router.get('/health', controller.health);
router.post('/users', controller.create);
router.get('/users/:id', controller.getById);

module.exports = router;
