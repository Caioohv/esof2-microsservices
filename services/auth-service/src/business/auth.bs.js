const crypto = require('crypto');
const { hashPassword, generateSalt } = require('../crypto');
const { issueAccessToken, issueRefreshToken, verifyRefreshToken, verifyAccessToken } = require('../jwt');
const repo = require('../repositories/auth.rep');
const userClient = require('../clients/user.client');
const { AppError } = require('../errors');
const logger = require('../lib/logger');

async function login(email, password) {
  const t0 = Date.now();
  const credential = await repo.findCredentialByEmail(email);
  if (!credential) {
    logger.warn('login_failure', { email, reason: 'user_not_found' });
    throw new AppError(401, 'invalid credentials');
  }

  const hash = hashPassword(password, credential.passwordSalt);
  if (hash !== credential.passwordHash) {
    logger.warn('login_failure', { email, reason: 'invalid_credentials' });
    throw new AppError(401, 'invalid credentials');
  }

  const payload = { sub: credential.userId, email: credential.email };
  const accessToken = issueAccessToken(payload);
  const refreshToken = issueRefreshToken(payload);

  await repo.insertRefreshToken(credential.userId, refreshToken);

  logger.info('login_success', { userId: credential.userId, email, durationMs: Date.now() - t0 });
  return { access_token: accessToken, refresh_token: refreshToken };
}

async function logout(refreshToken) {
  await repo.deleteRefreshToken(refreshToken);
  logger.info('logout', {});
}

async function refresh(refreshToken) {
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    logger.warn('token_refresh_failure', { reason: 'invalid_or_expired_token' });
    throw new AppError(401, 'invalid or expired refresh token');
  }

  const stored = await repo.findActiveRefreshToken(refreshToken);
  if (!stored) {
    logger.warn('token_refresh_failure', { reason: 'token_revoked' });
    throw new AppError(401, 'refresh token revoked or expired');
  }

  logger.info('token_refresh_success', { userId: payload.sub });
  return { access_token: issueAccessToken({ sub: payload.sub, email: payload.email }) };
}

function verify(token) {
  try {
    const payload = verifyAccessToken(token);
    return { valid: true, user: { id: payload.sub, email: payload.email } };
  } catch {
    logger.warn('token_verify_failure', { reason: 'invalid_or_expired_token' });
    throw new AppError(401, 'invalid or expired token');
  }
}

// Criação de conta: o auth-service orquestra a transação.
// 1. grava a credencial (porta de unicidade do email);
// 2. cria o usuário no user-service;
// 3. se o passo 2 falhar, faz rollback da credencial (best-effort).
async function register(email, password, role = 'CLIENTE') {
  const userId = crypto.randomUUID();
  const salt = generateSalt();
  const hash = hashPassword(password, salt);

  try {
    await repo.insertCredential(userId, email, hash, salt);
  } catch (err) {
    if (err.code === 'P2002') {
      logger.warn('register_failure', { email, reason: 'email_conflict' });
      throw new AppError(409, 'email already registered');
    }
    logger.error('register_failure', { email, reason: 'db_error', message: err.message });
    throw err;
  }

  try {
    await userClient.createUser({ id: userId, email, role });
  } catch (err) {
    // rollback da credencial para não deixar conta órfã
    await repo.deleteCredentialByUserId(userId).catch(() => {});
    logger.error('register_failure', { email, reason: 'user_service_error', message: err.message });
    throw err;
  }

  logger.info('register_success', { userId, email, role });
  return { user_id: userId, email, role };
}

module.exports = { login, logout, refresh, verify, register };
