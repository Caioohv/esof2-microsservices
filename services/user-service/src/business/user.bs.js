const repo = require('../repositories/user.rep');
const authClient = require('../lib/authClient');
const { AppError } = require('../errors');

// Mapa MVP de escopos por tipo de usuário. Substitui o modelo de permissões
// granulares por loja (UserStoreRole) que entra numa task futura junto ao
// store-service. A assinatura de verifyPermission já aceita storeId para manter
// compatibilidade com essa evolução.
const SCOPES_BY_TYPE = {
  LOJISTA: [
    'store:create', 'store:read', 'store:update', 'store:delete',
    'product:create', 'product:read', 'product:update', 'product:delete',
    'visit:read', 'visit:update',
  ],
  CLIENTE: [
    'store:read', 'product:read',
    'visit:create', 'visit:read',
  ],
};

const VALID_TYPES = Object.keys(SCOPES_BY_TYPE);

// Cria o usuário (fonte de verdade da identidade) e, em seguida, registra as
// credenciais no auth-service. Se o auth falhar, desfaz o usuário criado —
// compensação manual já que não há transação distribuída entre os bancos.
async function register(name, email, password, type) {
  const userType = type || 'CLIENTE';
  if (!VALID_TYPES.includes(userType)) {
    throw new AppError(400, 'type must be LOJISTA or CLIENTE');
  }

  let user;
  try {
    user = await repo.insertUser(name, email, userType);
  } catch (err) {
    if (err.code === 'P2002') throw new AppError(409, 'email already registered');
    throw err;
  }

  try {
    await authClient.register(user.id, email, password);
  } catch (err) {
    await repo.deleteUser(user.id);
    throw err;
  }

  return toPublic(user);
}

async function me(userId) {
  const user = await repo.findUserById(userId);
  if (!user) throw new AppError(404, 'user not found');
  return toPublic(user);
}

async function getUser(id) {
  const user = await repo.findUserById(id);
  if (!user) throw new AppError(404, 'user not found');
  return toPublic(user);
}

async function verifyPermission(userId, scope, _storeId) {
  const user = await repo.findUserById(userId);
  if (!user) throw new AppError(404, 'user not found');

  const allowed = (SCOPES_BY_TYPE[user.type] || []).includes(scope);
  return { allowed, type: user.type };
}

function toPublic(user) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    type: user.type,
  };
}

module.exports = { register, me, getUser, verifyPermission };
