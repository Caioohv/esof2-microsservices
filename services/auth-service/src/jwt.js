const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const REFRESH_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function issueAccessToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '15m' });
}

function issueRefreshToken(payload) {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
}

function verifyAccessToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

function verifyRefreshToken(token) {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function refreshExpiresAt() {
  return new Date(Date.now() + REFRESH_TTL_MS);
}

module.exports = {
  issueAccessToken,
  issueRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  hashToken,
  refreshExpiresAt,
};
