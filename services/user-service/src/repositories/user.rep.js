const crypto = require('crypto');
const prisma = require('../lib/prisma');

async function insertUser(name, email, type) {
  return prisma.user.create({
    data: {
      id: crypto.randomUUID(),
      name,
      email,
      type,
    },
  });
}

async function deleteUser(id) {
  await prisma.user.deleteMany({ where: { id } });
}

async function findUserById(id) {
  return prisma.user.findUnique({ where: { id } });
}

module.exports = {
  insertUser,
  deleteUser,
  findUserById,
};
