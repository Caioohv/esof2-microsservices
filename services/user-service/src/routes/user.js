const router = require('express').Router();
const controller = require('../controllers/user.ctrl');

router.get('/health', controller.health);
router.post('/users', controller.create);
router.get('/users/me', controller.me);
router.patch('/users/:id', controller.update);
router.get('/users/:id', controller.getById);

module.exports = router;
