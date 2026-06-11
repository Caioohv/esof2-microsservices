const router = require('express').Router();
const planController = require('../controllers/plan.controller');
const { authenticate } = require('../middlewares/auth.middleware');

const wrap = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

router.get('/plan',        wrap(planController.listPlans));
router.get('/plan/status', authenticate, wrap(planController.getPlanStatus));

module.exports = router;
