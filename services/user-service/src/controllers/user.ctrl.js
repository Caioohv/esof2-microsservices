const business = require('../business/user.bs');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_ROLES = ['ADMIN', 'LOJISTA', 'CLIENTE'];

async function health(req, res) {
  const result = business.health();
  res.json(result);
}

async function create(req, res) {
  const { id, email, role } = req.body;
  if (!email) return res.status(400).json({ error: 'email required' });
  if (!EMAIL_RE.test(email)) return res.status(400).json({ error: 'invalid email format' });
  if (role && !VALID_ROLES.includes(role)) {
    return res.status(400).json({ error: 'invalid role' });
  }

  try {
    const user = await business.createUser({ id, email, role });
    res.status(201).json(user);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
}

async function getById(req, res) {
  try {
    const user = await business.getUser(req.params.id);
    res.json(user);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
}

async function me(req, res) {
  const authHeader = req.headers['authorization'];

  try {
    const user = await business.getMe(authHeader);
    res.json(user);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
}

async function update(req, res) {
  const { email, role } = req.body;

  if (email !== undefined && !EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'invalid email format' });
  }

  if (role !== undefined && !VALID_ROLES.includes(role)) {
    return res.status(400).json({ error: 'invalid role' });
  }

  try {
    const user = await business.updateUser(req.params.id, { email, role });
    res.json(user);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
}

module.exports = {
  health,
  create,
  getById,
  me,
  update,
};
