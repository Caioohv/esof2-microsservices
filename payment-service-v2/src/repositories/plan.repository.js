const prisma = require('../prisma');

/**
 * Busca todos os planos ativos, ordenados por preço.
 */
async function findAllActive() {
  return prisma.plan.findMany({
    where: { active: true },
    orderBy: { price: 'asc' },
  });
}

/**
 * Busca um plano ativo pelo id.
 * @param {string} id
 */
async function findActiveById(id) {
  return prisma.plan.findFirst({
    where: { id, active: true },
  });
}

module.exports = { findAllActive, findActiveById };
