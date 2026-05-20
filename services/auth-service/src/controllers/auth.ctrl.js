const business = require('../business/auth.bs');

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });

  try {
    const result = await business.login(email, password);
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

const logout = async (req, res) => {
  const { refresh_token } = req.body;
  if (!refresh_token) return res.status(400).json({ error: 'refresh_token required' });

  try {
    await business.logout(refresh_token);
    res.status(204).send();
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

const refresh = async (req, res) => {
  const { refresh_token } = req.body;
  if (!refresh_token) return res.status(400).json({ error: 'refresh_token required' });

  try {
    const result = await business.refresh(refresh_token);
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

const verify = (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'token required' });

  try {
    const result = business.verify(token);
    res.json(result);
  } catch (err) {
    res.status(err.status || 401).json({ valid: false, error: err.message });
  }
};

const register = async (req, res) => {
  const { user_id, email, password } = req.body;
  if (!user_id || !email || !password) {
    return res.status(400).json({ error: 'user_id, email, and password required' });
  }

  try {
    await business.register(user_id, email, password);
    res.status(201).json({ message: 'credentials created' });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

module.exports = { login, logout, refresh, verify, register };
