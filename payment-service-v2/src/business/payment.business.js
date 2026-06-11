const { v4: uuidv4 } = require('uuid');
const planBusiness = require('./plan.business');
const subscriptionRepo = require('../repositories/subscription.repository');
const stripeService = require('../services/stripe.service');

/**
 * Cria uma sessão de checkout para o lojista assinar um plano.
 * Modo Stripe real: chama a API do Stripe.
 * Modo mock: gera uma session_id local e retorna uma URL de sucesso direto.
 *
 * @param {{ planId: string, lojistaId: string, baseUrl: string }}
 */
async function createCheckout({ planId, lojistaId, baseUrl }) {
  const plan = await planBusiness.getPlanOrThrow(planId);

  if (stripeService.isConfigured() && plan.stripe_price_id) {
    const session = await stripeService.createCheckoutSession({
      plan,
      lojistaId,
      successUrl: `${baseUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${baseUrl}/payment/cancel`,
    });

    await subscriptionRepo.createPending({
      lojista_id: lojistaId,
      plan_id: plan.id,
      stripe_session_id: session.id,
    });

    return { checkout_url: session.url, session_id: session.id, mode: 'stripe' };
  }

  // Modo mock
  const mockSessionId = `mock_session_${uuidv4()}`;

  await subscriptionRepo.createPending({
    lojista_id: lojistaId,
    plan_id: plan.id,
    stripe_session_id: mockSessionId,
  });

  return {
    checkout_url: `${baseUrl}/payment/success?session_id=${mockSessionId}&mock=true&plan_id=${plan.id}&user_id=${lojistaId}`,
    session_id: mockSessionId,
    mode: 'mock',
    plan: { name: plan.name, price: Number(plan.price) },
  };
}

/**
 * Ativa uma subscription após confirmação de pagamento.
 * Cancela qualquer assinatura anterior do mesmo lojista.
 *
 * @param {{ lojistaId, planId, sessionId, stripeSubscriptionId }}
 */
async function activateSubscription({ lojistaId, planId, sessionId, stripeSubscriptionId }) {
  const plan = await planBusiness.getPlanOrThrow(planId);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + plan.duration_days);

  await subscriptionRepo.cancelActiveByLojista(lojistaId);

  return subscriptionRepo.activate({
    lojista_id: lojistaId,
    plan_id: planId,
    stripe_session_id: sessionId ?? null,
    stripe_subscription_id: stripeSubscriptionId ?? null,
    expires_at: expiresAt,
  });
}

/**
 * Processa um evento de webhook recebido (Stripe ou mock).
 * @param {{ rawBody: Buffer, signature: string, body: object }}
 */
async function handleWebhook({ rawBody, signature, body }) {
  let event;

  if (stripeService.isConfigured() && process.env.STRIPE_WEBHOOK_SECRET) {
    event = stripeService.constructWebhookEvent(rawBody, signature);
  } else {
    event = body;
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session      = event.data?.object ?? event.data ?? event;
      const lojistaId    = session.metadata?.lojista_id ?? session.lojista_id;
      const planId       = session.metadata?.plan_id    ?? session.plan_id;
      const sessionId    = session.id ?? session.session_id;
      const stripeSubId  = session.subscription ?? null;

      if (lojistaId && planId) {
        await activateSubscription({ lojistaId, planId, sessionId, stripeSubscriptionId: stripeSubId });
      }
      break;
    }

    case 'customer.subscription.deleted': {
      const sub     = event.data?.object ?? event.data ?? event;
      const subId   = sub.id ?? sub.stripe_subscription_id;
      if (subId) {
        await subscriptionRepo.cancelByStripeSubscriptionId(subId);
      }
      break;
    }

    case 'mock.payment.success': {
      const { lojista_id, plan_id, session_id } = event.data ?? {};
      if (lojista_id && plan_id) {
        await activateSubscription({ lojistaId: lojista_id, planId: plan_id, sessionId: session_id });
      }
      break;
    }

    default:
      console.log(`[webhook] evento ignorado: ${event.type}`);
  }
}

/**
 * Processa o retorno do mock no GET /payment/success.
 * Se a subscription ainda estiver pending, ativa ela.
 */
async function handleMockSuccess({ sessionId, planId, userId }) {
  const existing = await subscriptionRepo.findBySessionId(sessionId);
  if (existing?.status === 'pending') {
    await activateSubscription({ lojistaId: userId, planId, sessionId });
  }
}

/**
 * Retorna o status da assinatura do lojista.
 * @param {string} lojistaId
 */
async function getSubscriptionStatus(lojistaId) {
  const sub = await subscriptionRepo.findLatestByLojista(lojistaId);

  if (!sub) {
    return { has_subscription: false, status: 'none', subscription: null };
  }

  const isActive = sub.status === 'active' && new Date(sub.expires_at) > new Date();

  return {
    has_subscription: true,
    status: isActive ? 'active' : sub.status,
    subscription: {
      id: sub.id,
      status: sub.status,
      expires_at: sub.expires_at,
      created_at: sub.created_at,
      plan: {
        id: sub.plan.id,
        name: sub.plan.name,
        price: Number(sub.plan.price),
        features: sub.plan.features,
        duration_days: sub.plan.duration_days,
      },
    },
  };
}

module.exports = {
  createCheckout,
  activateSubscription,
  handleWebhook,
  handleMockSuccess,
  getSubscriptionStatus,
};
