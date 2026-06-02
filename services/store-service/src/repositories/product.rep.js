const crypto = require('crypto');
const prisma = require('../lib/prisma');

async function insertProduct(storeId, { name, description, price }) {
  return prisma.product.create({
    data: {
      id: crypto.randomUUID(),
      storeId,
      name,
      description,
      price,
    },
  });
}

async function findProductsByStore(storeId) {
  return prisma.product.findMany({
    where: { storeId },
    orderBy: { createdAt: 'desc' },
  });
}

async function findProductById(storeId, productId) {
  return prisma.product.findFirst({ where: { id: productId, storeId } });
}

async function updateProduct(productId, { name, description, price }) {
  return prisma.product.update({
    where: { id: productId },
    data: { name, description, price },
  });
}

async function deleteProduct(productId) {
  await prisma.product.deleteMany({ where: { id: productId } });
}

module.exports = {
  insertProduct,
  findProductsByStore,
  findProductById,
  updateProduct,
  deleteProduct,
};
