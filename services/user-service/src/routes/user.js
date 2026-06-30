const router = require('express').Router();
const controller = require('../controllers/user.ctrl');

router.get('/health', controller.health);
router.post('/permissions/verify', controller.verifyPermission);
router.post('/users', controller.create);
router.get('/users/me', controller.me);
router.post('/users/:id/profile', controller.upsertUserProfile);
router.get('/users/:id/profile', controller.getUserProfile);
router.post('/users/:id/seller-profile', controller.createSellerProfile);
router.get('/users/:id/seller-profile', controller.getSellerProfile);
router.patch('/users/:id/seller-profile', controller.updateSellerProfile);
router.patch('/users/:id', controller.update);
router.get('/users/:id', controller.getById);

module.exports = router;
