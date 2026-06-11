const planRepository = require('../repositories/plan.repository');

const PAYMENT_METHODS = [
  { id: 'credit_card', label: 'Cartão de Crédito', installments: true, max_installments: 12 },
  { id: 'boleto',      label: 'Boleto Bancário',   installments: false },
  { id: 'pix',         label: 'PIX',               installments: false },
];

/**
 * Lista todos os planos ativos.
 */
async function listPlans() {
  return planRepository.findAllActive();
}

/**
 * Lista métodos de pagamento disponíveis junto com os planos ativos.
 */
async function listPaymentOptions() {
  const plans = await planRepository.findAllActive();
  return { payment_methods: PAYMENT_METHODS, plans };
}

/**
 * Busca um plano ativo pelo id. Lança erro se não encontrado.
 * @param {string} planId
 */
async function getPlanOrThrow(planId) {
  const plan = await planRepository.findActiveById(planId);
  if (!plan) {
    const err = new Error('Plano não encontrado');
    err.statusCode = 404;
    throw err;
  }
  return plan;
}

module.exports = { listPlans, listPaymentOptions, getPlanOrThrow };
