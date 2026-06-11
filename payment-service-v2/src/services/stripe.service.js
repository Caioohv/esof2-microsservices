let _stripe = null;

/**
 * Retorna a instância do Stripe, ou null se a chave não estiver configurada (modo mock).
 */
function getStripe() {
  if (_stripe) return _stripe;
  if (process.env.STRIPE_SECRET_KEY) {
    _stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  }
  return _stripe;
}

/**
 * Cria uma Checkout Session no Stripe.
 * @param {{ plan, lojistaId, successUrl, cancelUrl }} params
 */
async function createCheckoutSession({ plan, lojistaId, successUrl, cancelUrl }) {
  const stripe = getStripe();
  return stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [{ price: plan.stripe_price_id, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: { lojista_id: lojistaId, plan_id: plan.id },
  });
}

/**
 * Valida e constrói o evento de webhook do Stripe.
 * @param {Buffer} rawBody
 * @param {string} signature
 * @returns {import('stripe').Stripe.Event}
 */
function constructWebhookEvent(rawBody, signature) {
  const stripe = getStripe();
  return stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);
}

/**
 * Indica se o Stripe está configurado e pronto para uso.
 */
function isConfigured() {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

module.exports = { getStripe, createCheckoutSession, constructWebhookEvent, isConfigured };
