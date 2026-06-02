const router = require('express').Router();
const controller = require('../controllers/user.ctrl');
const authenticate = require('../middlewares/auth');

router.post('/register', controller.register);
router.get('/me', authenticate, controller.me);
router.post('/permissions/verify', controller.verifyPermission);
router.get('/users/:id', controller.getUser);

module.exports = router;
