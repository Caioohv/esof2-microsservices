const router = require('express').Router();
const controller = require('../controllers/auth.ctrl');

router.post('/login', controller.login);
router.post('/logout', controller.logout);
router.post('/refresh', controller.refresh);
router.post('/verify', controller.verify);
router.post('/register', controller.register);

module.exports = router;
