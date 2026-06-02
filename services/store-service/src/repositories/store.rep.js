const crypto = require('crypto');
const prisma = require('../lib/prisma');

async function insertStore({ name, description, category }) {
  return prisma.store.create({
    data: {
      id: crypto.randomUUID(),
      name,
      description,
      category,
    },
  });
}

async function findStores() {
  return prisma.store.findMany({ orderBy: { createdAt: 'desc' } });
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
