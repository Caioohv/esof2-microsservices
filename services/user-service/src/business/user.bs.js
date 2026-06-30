const repo = require('../repositories/user.rep');
const { AppError } = require('../errors');

function health() {
  return {
    status: 'ok',
    service: 'user-service',
  };
}

async function createUser({ id, email, role = 'CLIENTE' }) {
  try {
    return await repo.insertUser({ id, email, role });
  } catch (err) {
    if (err.code === 'P2002') throw new AppError(409, 'email already registered');
    throw err;
  }
}

async function getUser(id) {
  const user = await repo.findUserById(id);
  if (!user) throw new AppError(404, 'user not found');
  return user;
}

async function getMe(authHeader) {
  if (!authHeader) throw new AppError(401, 'token required');

  const res = await fetch(`${process.env.AUTH_SERVICE_URL}/verify`, {
    method: 'POST',
    headers: {
      Authorization: authHeader,
    },
  });

  if (!res.ok) throw new AppError(401, 'invalid or expired token');

  const result = await res.json();
  const user = await repo.findUserById(result.user.id);

  if (!user) throw new AppError(404, 'user not found');

  return user;
}

async function updateUser(id, { email, role }) {
  const data = {};

  if (email !== undefined) data.email = email;
  if (role !== undefined) data.role = role;

  if (Object.keys(data).length === 0) {
    throw new AppError(400, 'no fields to update');
  }

  try {
    return await repo.updateUser(id, data);
  } catch (err) {
    if (err.code === 'P2025') throw new AppError(404, 'user not found');
    if (err.code === 'P2002') throw new AppError(409, 'email already registered');
    throw err;
  }
}

async function createSellerProfile(userId, { businessName, description }) {
  if (!businessName) throw new AppError(400, 'businessName required');

  const user = await repo.findUserById(userId);
  if (!user) throw new AppError(404, 'user not found');

  try {
    return await repo.insertSellerProfile({ userId, businessName, description });
  } catch (err) {
    if (err.code === 'P2002') throw new AppError(409, 'seller profile already exists');
    if (err.code === 'P2003') throw new AppError(404, 'user not found');
    throw err;
  }
}

async function getSellerProfile(userId) {
  const profile = await repo.findSellerProfileByUserId(userId);
  if (!profile) throw new AppError(404, 'seller profile not found');
  return profile;
}

async function updateSellerProfile(userId, { businessName, description, status }) {
  const data = {};

  if (businessName !== undefined) data.businessName = businessName;
  if (description !== undefined) data.description = description;
  if (status !== undefined) data.status = status;

  if (Object.keys(data).length === 0) {
    throw new AppError(400, 'no fields to update');
  }

  try {
    return await repo.updateSellerProfile(userId, data);
  } catch (err) {
    if (err.code === 'P2025') throw new AppError(404, 'seller profile not found');
    throw err;
  }
}

async function upsertUserProfile(userId, {
  minBedrooms,
  minBathrooms,
  wantsGarage,
  preferredDoors,
  preferredFuel,
  lifestyleTags,
  incomeRange,
  preferences,
}) {
  const user = await repo.findUserById(userId);
  if (!user) throw new AppError(404, 'user not found');

  const data = {};

  if (minBedrooms !== undefined) data.minBedrooms = minBedrooms;
  if (minBathrooms !== undefined) data.minBathrooms = minBathrooms;
  if (wantsGarage !== undefined) data.wantsGarage = wantsGarage;
  if (preferredDoors !== undefined) data.preferredDoors = preferredDoors;
  if (preferredFuel !== undefined) data.preferredFuel = preferredFuel;
  if (lifestyleTags !== undefined) data.lifestyleTags = lifestyleTags;
  if (incomeRange !== undefined) data.incomeRange = incomeRange;
  if (preferences !== undefined) data.preferences = preferences;

  if (Object.keys(data).length === 0) {
    throw new AppError(400, 'no profile fields provided');
  }

  try {
    return await repo.upsertUserProfile(userId, data);
  } catch (err) {
    if (err.code === 'P2003') throw new AppError(404, 'user not found');
    throw err;
  }
}

async function getUserProfile(userId) {
  const profile = await repo.findUserProfileByUserId(userId);
  if (!profile) throw new AppError(404, 'user profile not found');
  return profile;
}

module.exports = {
  health,
  createUser,
  getUser,
  getMe,
  updateUser,
  createSellerProfile,
  getSellerProfile,
  updateSellerProfile,
  upsertUserProfile,
  getUserProfile,
};
