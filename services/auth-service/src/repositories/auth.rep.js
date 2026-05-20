const crypto = require('crypto');
const db = require('../db');
const { hashToken, refreshExpiresAt } = require('../jwt');

async function findCredentialByEmail(email) {
  const [rows] = await db.query('SELECT * FROM credentials WHERE email = ?', [email]);
  return rows[0] || null;
}

async function insertRefreshToken(userId, refreshToken) {
  await db.query(
    'INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at) VALUES (?, ?, ?, ?)',
    [crypto.randomUUID(), userId, hashToken(refreshToken), refreshExpiresAt()],
  );
}

async function deleteRefreshToken(refreshToken) {
  await db.query('DELETE FROM refresh_tokens WHERE token_hash = ?', [hashToken(refreshToken)]);
}

async function findActiveRefreshToken(refreshToken) {
  const [rows] = await db.query(
    'SELECT id FROM refresh_tokens WHERE token_hash = ? AND expires_at > NOW()',
    [hashToken(refreshToken)],
  );
  return rows[0] || null;
}

async function insertCredential(userId, email, passwordHash, passwordSalt) {
  await db.query(
    'INSERT INTO credentials (id, user_id, email, password_hash, password_salt) VALUES (?, ?, ?, ?, ?)',
    [crypto.randomUUID(), userId, email, passwordHash, passwordSalt],
  );
}

module.exports = {
  findCredentialByEmail,
  insertRefreshToken,
  deleteRefreshToken,
  findActiveRefreshToken,
  insertCredential,
};
