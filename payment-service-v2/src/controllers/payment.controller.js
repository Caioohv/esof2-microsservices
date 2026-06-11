const paymentBusiness = require('../business/payment.business');
const planBusiness = require('../business/plan.business');

/**
 * GET /payment/options
 */
async function getPaymentOptions(req, res) {
  const options = await planBusiness.listPaymentOptions();
  res.json(options);
}

/**
 * POST /payment/checkout
 * Body: { plan_id }
 */
async function createCheckout(req, res) {
  const { plan_id } = req.body;

  if (!plan_id) {
    return res.status(400).json({ error: 'plan_id é obrigatório' });
  }

  const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
  const result = await paymentBusiness.createCheckout({
    planId: plan_id,
    lojistaId: req.user.id,
    baseUrl,
  });

  res.status(201).json(result);
}

/**
 * POST /payment/webhook
 */
async function handleWebhook(req, res) {
  await paymentBusiness.handleWebhook({
    rawBody: req.rawBody,
    signature: req.headers['stripe-signature'],
    body: req.body,
  });
  res.json({ received: true });
}

/**
 * GET /payment/success
 * Redireciona o BFF/frontend com os dados do resultado.
 * Não retorna HTML — retorna JSON para o BFF renderizar a página.
 */
async function paymentSuccess(req, res) {
  const { session_id, mock, plan_id, user_id } = req.query;

  if (mock === 'true' && plan_id && user_id) {
    await paymentBusiness.handleMockSuccess({
      sessionId: session_id,
      planId: plan_id,
      userId: user_id,
    });
  }

  res.json({
    success: true,
    message: 'Pagamento confirmado. Assinatura ativada.',
    session_id: session_id ?? null,
  });
}

/**
 * GET /payment/cancel
 * Retorna JSON para o BFF renderizar a página de cancelamento.
 */
async function paymentCancel(req, res) {
  res.json({
    success: false,
    message: 'Checkout cancelado. Nenhuma cobrança foi realizada.',
  });
}

module.exports = {
  getPaymentOptions,
  createCheckout,
  handleWebhook,
  paymentSuccess,
  paymentCancel,
};
