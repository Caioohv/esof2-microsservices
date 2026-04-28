const router = require('express').Router();
const crypto = require('crypto');
const db = require('../db');
const { generateSalt, hashPassword } = require('../crypto');
const {
  issueAccessToken,
  issueRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  hashToken,
  refreshExpiresAt,
} = require('../jwt');

const wrap = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

router.post('/login', wrap(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });

  const [rows] = await db.query('SELECT * FROM credentials WHERE email = ?', [email]);
  const credential = rows[0];
  if (!credential) return res.status(401).json({ error: 'invalid credentials' });

  const hash = hashPassword(password, credential.password_salt);
  if (hash !== credential.password_hash) return res.status(401).json({ error: 'invalid credentials' });

  const payload = { sub: credential.user_id, email: credential.email };
  const accessToken = issueAccessToken(payload);
  const refreshToken = issueRefreshToken(payload);

  await db.query(
    'INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at) VALUES (?, ?, ?, ?)',
    [crypto.randomUUID(), credential.user_id, hashToken(refreshToken), refreshExpiresAt()],
  );

  res.json({ access_token: accessToken, refresh_token: refreshToken });
}));

router.post('/logout', wrap(async (req, res) => {
  const { refresh_token } = req.body;
  if (!refresh_token) return res.status(400).json({ error: 'refresh_token required' });

  await db.query('DELETE FROM refresh_tokens WHERE token_hash = ?', [hashToken(refresh_token)]);
  res.status(204).send();
}));

router.post('/refresh', wrap(async (req, res) => {
  const { refresh_token } = req.body;
  if (!refresh_token) return res.status(400).json({ error: 'refresh_token required' });

  let payload;
  try {
    payload = verifyRefreshToken(refresh_token);
  } catch {
    return res.status(401).json({ error: 'invalid or expired refresh token' });
  }

  const [rows] = await db.query(
    'SELECT id FROM refresh_tokens WHERE token_hash = ? AND expires_at > NOW()',
    [hashToken(refresh_token)],
  );
  if (!rows[0]) return res.status(401).json({ error: 'refresh token revoked or expired' });

  res.json({ access_token: issueAccessToken({ sub: payload.sub, email: payload.email }) });
}));

router.post('/verify', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'token required' });

  try {
    const payload = verifyAccessToken(token);
    res.json({ valid: true, user: { id: payload.sub, email: payload.email } });
  } catch {
    res.status(401).json({ valid: false, error: 'invalid or expired token' });
  }
});

// Internal endpoint — called by user-service when registering a new user
router.post('/register', wrap(async (req, res) => {
  const { user_id, email, password } = req.body;
  if (!user_id || !email || !password) {
    return res.status(400).json({ error: 'user_id, email, and password required' });
  }

  const salt = generateSalt();
  const hash = hashPassword(password, salt);

  try {
    await db.query(
      'INSERT INTO credentials (id, user_id, email, password_hash, password_salt) VALUES (?, ?, ?, ?, ?)',
      [crypto.randomUUID(), user_id, email, hash, salt],
    );
    res.status(201).json({ message: 'credentials created' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'email already registered' });
    throw err;
  }
}));

module.exports = router;
