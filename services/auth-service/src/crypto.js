const crypto = require('crypto');

function generateSalt() {
  return crypto.randomBytes(16).toString('hex');
}

function hashPassword(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 100_000, 64, 'sha512').toString('hex');
}

module.exports = { generateSalt, hashPassword };
