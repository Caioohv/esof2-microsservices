const crypto = require('crypto');
const prisma = require('../lib/prisma');

async function insertStore({ ownerId, name, description, category }) {
  return prisma.store.create({
    data: {
      id: crypto.randomUUID(),
      ownerId,
      name,
      description,
      category,
    },
  });
}

async function findStores({ ownerId } = {}) {
  return prisma.store.findMany({
    where: ownerId ? { ownerId } : undefined,
    orderBy: { createdAt: 'desc' },
  });
}

async function findStoreById(id) {
  return prisma.store.findUnique({ where: { id } });
}

async function updateStore(id, { name, description, category }) {
  return prisma.store.update({
    where: { id },
    data: { name, description, category },
  });
}

async function deleteStore(id) {
  await prisma.store.deleteMany({ where: { id } });
}

module.exports = {
  insertStore,
  findStores,
  findStoreById,
  updateStore,
  deleteStore,
};
