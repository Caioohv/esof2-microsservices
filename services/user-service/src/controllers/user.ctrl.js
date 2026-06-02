const business = require('../business/user.bs');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const register = async (req, res) => {
  const { name, email, password, type } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'name, email, and password required' });
  }
  if (!EMAIL_RE.test(email)) return res.status(400).json({ error: 'invalid email format' });

  try {
    const user = await business.register(name, email, password, type);
    res.status(201).json(user);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

const me = async (req, res) => {
  try {
    const user = await business.me(req.user.id);
    res.json(user);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

const getUser = async (req, res) => {
  try {
    const user = await business.getUser(req.params.id);
    res.json(user);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

const verifyPermission = async (req, res) => {
  const { user_id, scope, store_id } = req.body;
  if (!user_id || !scope) {
    return res.status(400).json({ error: 'user_id and scope required' });
  }

  try {
    const result = await business.verifyPermission(user_id, scope, store_id);
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

module.exports = { register, me, getUser, verifyPermission };
