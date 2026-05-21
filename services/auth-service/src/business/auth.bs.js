const { hashPassword, generateSalt } = require('../crypto');
const { issueAccessToken, issueRefreshToken, verifyRefreshToken, verifyAccessToken } = require('../jwt');
const repo = require('../repositories/auth.rep');
const { AppError } = require('../errors');

async function login(email, password) {
  const credential = await repo.findCredentialByEmail(email);
  if (!credential) throw new AppError(401, 'invalid credentials');

  const hash = hashPassword(password, credential.passwordHash);
  if (hash !== credential.passwordHash) throw new AppError(401, 'invalid credentials');

  const payload = { sub: credential.userId, email: credential.email };
  const accessToken = issueAccessToken(payload);
  const refreshToken = issueRefreshToken(payload);

  await repo.insertRefreshToken(credential.userId, refreshToken);

  return { access_token: accessToken, refresh_token: refreshToken };
}

async function logout(refreshToken) {
  await repo.deleteRefreshToken(refreshToken);
}

async function refresh(refreshToken) {
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new AppError(401, 'invalid or expired refresh token');
  }

  const stored = await repo.findActiveRefreshToken(refreshToken);
  if (!stored) throw new AppError(401, 'refresh token revoked or expired');

  return { access_token: issueAccessToken({ sub: payload.sub, email: payload.email }) };
}

function verify(token) {
  try {
    const payload = verifyAccessToken(token);
    return { valid: true, user: { id: payload.sub, email: payload.email } };
  } catch {
    throw new AppError(401, 'invalid or expired token');
  }
}

async function register(userId, email, password) {
  const salt = generateSalt();
  const hash = hashPassword(password, salt);

  try {
    await repo.insertCredential(userId, email, hash, salt);
  } catch (err) {
    if (err.code === 'P2002') throw new AppError(409, 'email already registered');
    throw err;
  }
}

module.exports = { login, logout, refresh, verify, register };
