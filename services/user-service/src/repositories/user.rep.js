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

async function updateUser(id, data) {
  return prisma.user.update({
    where: { id },
    data,
  });
}
module.exports = {
  insertUser,
  findUserById,
  updateUser,
};
