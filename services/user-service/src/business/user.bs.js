const repo = require('../repositories/user.rep');
const { AppError } = require('../errors');
const logger = require('../lib/logger');

function health() {
  return { status: 'ok', service: 'user-service' };
}

async function createUser({ id, email, role = 'CLIENTE' }) {
  try {
    const user = await repo.insertUser({ id, email, role });
    logger.info('user_create_success', { userId: id, email, role });
    return user;
  } catch (err) {
    if (err.code === 'P2002') {
      logger.warn('user_create_conflict', { email });
      throw new AppError(409, 'email already registered');
    }
    logger.error('user_create_failure', { email, message: err.message });
    throw err;
  }
}

async function getUser(id) {
  const user = await repo.findUserById(id);
  if (!user) {
    logger.warn('user_not_found', { userId: id });
    throw new AppError(404, 'user not found');
  }
  return user;
}

module.exports = { health, createUser, getUser };
