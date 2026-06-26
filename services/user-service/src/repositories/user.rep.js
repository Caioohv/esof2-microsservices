const crypto = require('crypto');
const prisma = require('../lib/prisma');

async function insertUser({ id, email, role }) {
  return prisma.user.create({
    data: {
      id: id || crypto.randomUUID(),
      email,
      role,
    },
  });
}

async function findUserById(id) {
  return prisma.user.findUnique({ where: { id } });
}

module.exports = {
  insertUser,
  findUserById,
};
