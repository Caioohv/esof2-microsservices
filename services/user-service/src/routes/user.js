const router = require('express').Router();
const controller = require('../controllers/user.ctrl');

router.get('/health', controller.health);

module.exports = router;