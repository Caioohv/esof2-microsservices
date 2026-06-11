const business = require('../business/store.bs');

const create = async (req, res) => {
  const { owner_id, name, description, category } = req.body;
  if (!owner_id) return res.status(400).json({ error: 'owner_id required' });

  try {
    const store = await business.createStore({ ownerId: owner_id, name, description, category });
    res.status(201).json(store);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

const list = async (req, res) => {
  try {
    const { owner_id } = req.query;
    res.json(await business.listStores({ ownerId: owner_id }));
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

const getById = async (req, res) => {
  try {
    res.json(await business.getStore(req.params.id));
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

const update = async (req, res) => {
  try {
    res.json(await business.updateStore(req.params.id, req.body));
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

const remove = async (req, res) => {
  try {
    await business.deleteStore(req.params.id);
    res.status(204).end();
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

module.exports = { create, list, getById, update, remove };
