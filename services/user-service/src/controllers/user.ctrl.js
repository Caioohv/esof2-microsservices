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

async function createSellerProfile(req, res) {
  const { businessName, description } = req.body;

  try {
    const profile = await business.createSellerProfile(req.params.id, {
      businessName,
      description,
    });

    res.status(201).json(profile);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
}

async function getSellerProfile(req, res) {
  try {
    const profile = await business.getSellerProfile(req.params.id);
    res.json(profile);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
}

async function updateSellerProfile(req, res) {
  const { businessName, description, status } = req.body;

  const VALID_SELLER_STATUS = ['pending', 'approved', 'rejected'];

  if (status !== undefined && !VALID_SELLER_STATUS.includes(status)) {
    return res.status(400).json({ error: 'invalid seller profile status' });
  }

  try {
    const profile = await business.updateSellerProfile(req.params.id, {
      businessName,
      description,
      status,
    });

    res.json(profile);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
}

async function upsertUserProfile(req, res) {
  const {
    minBedrooms,
    minBathrooms,
    wantsGarage,
    preferredDoors,
    preferredFuel,
    lifestyleTags,
    incomeRange,
    preferences,
  } = req.body;

  if (lifestyleTags !== undefined && !Array.isArray(lifestyleTags)) {
    return res.status(400).json({ error: 'lifestyleTags must be an array' });
  }

  try {
    const profile = await business.upsertUserProfile(req.params.id, {
      minBedrooms,
      minBathrooms,
      wantsGarage,
      preferredDoors,
      preferredFuel,
      lifestyleTags,
      incomeRange,
      preferences,
    });

    res.status(200).json(profile);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
}

async function getUserProfile(req, res) {
  try {
    const profile = await business.getUserProfile(req.params.id);
    res.json(profile);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
}


async function verifyPermission(req, res) {
  const { userId, role } = req.body;

  if (role !== undefined && !VALID_ROLES.includes(role)) {
    return res.status(400).json({ error: 'invalid role' });
  }

  try {
    const result = await business.verifyPermission({ userId, role });
    res.json(result);
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
  createSellerProfile,
  getSellerProfile,
  updateSellerProfile,
  upsertUserProfile,
  getUserProfile,
  verifyPermission,
};
