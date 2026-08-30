const router = require('express').Router();
const paymentController = require('../controllers/payment.controller');
const { authenticate } = require('../middlewares/auth.middleware');

const wrap = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

router.get ('/payment/options',  wrap(paymentController.getPaymentOptions));
router.post('/payment/checkout', authenticate, wrap(paymentController.createCheckout));
router.post('/payment/webhook',  wrap(paymentController.handleWebhook));
router.get ('/payment/success',  wrap(paymentController.paymentSuccess));
router.get ('/payment/cancel',   wrap(paymentController.paymentCancel));

module.exports = router;
