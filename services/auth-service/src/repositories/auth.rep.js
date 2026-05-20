const crypto = require('crypto');
const prisma = require('../lib/prisma');
const { hashToken, refreshExpiresAt } = require('../jwt');

async function findCredentialByEmail(email) {
  return prisma.credential.findUnique({ where: { email } });
}

async function insertRefreshToken(userId, refreshToken) {
  await prisma.refreshToken.create({
    data: {
      id: crypto.randomUUID(),
      userId,
      tokenHash: hashToken(refreshToken),
      expiresAt: refreshExpiresAt(),
    },
  });
}

async function deleteRefreshToken(refreshToken) {
  await prisma.refreshToken.deleteMany({
    where: { tokenHash: hashToken(refreshToken) },
  });
}

async function findActiveRefreshToken(refreshToken) {
  return prisma.refreshToken.findFirst({
    where: {
      tokenHash: hashToken(refreshToken),
      expiresAt: { gt: new Date() },
    },
    select: { id: true },
  });
}

async function insertCredential(userId, email, passwordHash, passwordSalt) {
  await prisma.credential.create({
    data: {
      id: crypto.randomUUID(),
      userId,
      email,
      passwordHash,
      passwordSalt,
    },
  });
}

module.exports = {
  findCredentialByEmail,
  insertRefreshToken,
  deleteRefreshToken,
  findActiveRefreshToken,
  insertCredential,
};
