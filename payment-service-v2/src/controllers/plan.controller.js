const planBusiness = require('../business/plan.business');

/**
 * GET /plan
 */
async function listPlans(req, res) {
  const plans = await planBusiness.listPlans();
  res.json({ plans });
}

/**
 * GET /plan/status
 */
async function getPlanStatus(req, res) {
  const paymentBusiness = require('../business/payment.business');
  const result = await paymentBusiness.getSubscriptionStatus(req.user.id);
  res.json(result);
}

module.exports = { listPlans, getPlanStatus };
