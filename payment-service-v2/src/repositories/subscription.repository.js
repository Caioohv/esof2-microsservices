const prisma = require('../prisma');

/**
 * Cria uma subscription com status pending.
 */
async function createPending({ lojista_id, plan_id, stripe_session_id }) {
  return prisma.subscription.create({
    data: { lojista_id, plan_id, stripe_session_id, status: 'pending' },
  });
}

/**
 * Cancela todas as subscriptions ativas ou pendentes de um lojista.
 */
async function cancelActiveByLojista(lojista_id) {
  return prisma.subscription.updateMany({
    where: {
      lojista_id,
      status: { in: ['active', 'pending'] },
    },
    data: { status: 'cancelled' },
  });
}

/**
 * Ativa uma subscription existente (pelo stripe_session_id),
 * ou cria uma nova caso não exista ainda.
 */
async function activate({ lojista_id, plan_id, stripe_session_id, stripe_subscription_id, expires_at }) {
  return prisma.subscription.upsert({
    where: { id: (await findBySessionId(stripe_session_id))?.id ?? '__not_found__' },
    update: {
      status: 'active',
      stripe_subscription_id,
      expires_at,
    },
    create: {
      lojista_id,
      plan_id,
      status: 'active',
      stripe_session_id,
      stripe_subscription_id,
      expires_at,
    },
  });
}

/**
 * Busca a subscription mais recente de um lojista, incluindo o plano.
 */
async function findLatestByLojista(lojista_id) {
  return prisma.subscription.findFirst({
    where: { lojista_id },
    orderBy: { created_at: 'desc' },
    include: { plan: true },
  });
}

/**
 * Busca subscription pelo stripe_session_id.
 */
async function findBySessionId(stripe_session_id) {
  return prisma.subscription.findFirst({
    where: { stripe_session_id },
  });
}

/**
 * Cancela subscription pelo stripe_subscription_id (evento do Stripe).
 */
async function cancelByStripeSubscriptionId(stripe_subscription_id) {
  return prisma.subscription.updateMany({
    where: { stripe_subscription_id },
    data: { status: 'cancelled' },
  });
}

module.exports = {
  createPending,
  cancelActiveByLojista,
  activate,
  findLatestByLojista,
  findBySessionId,
  cancelByStripeSubscriptionId,
};
