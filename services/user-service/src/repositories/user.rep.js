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

async function insertSellerProfile({ userId, businessName, description }) {
  return prisma.sellerProfile.create({
    data: {
      userId,
      businessName,
      description,
    },
  });
}

async function findSellerProfileByUserId(userId) {
  return prisma.sellerProfile.findUnique({
    where: { userId },
  });
}

async function updateSellerProfile(userId, data) {
  return prisma.sellerProfile.update({
    where: { userId },
    data,
  });
}

async function upsertUserProfile(userId, data) {
  return prisma.userProfile.upsert({
    where: { userId },
    update: data,
    create: {
      userId,
      ...data,
    },
  });
}

async function findUserProfileByUserId(userId) {
  return prisma.userProfile.findUnique({
    where: { userId },
  });
}

module.exports = {
  insertUser,
  findUserById,
  updateUser,
  insertSellerProfile,
  findSellerProfileByUserId,
  updateSellerProfile,
  upsertUserProfile,
  findUserProfileByUserId,
};
