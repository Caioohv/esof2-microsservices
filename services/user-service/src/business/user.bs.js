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

module.exports = {
  health,
  createUser,
  getUser,
};
