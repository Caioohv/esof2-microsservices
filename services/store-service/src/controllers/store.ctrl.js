const business = require('../business/store.bs');

const create = async (req, res) => {
  try {
    const store = await business.createStore(req.body);
    res.status(201).json(store);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

const list = async (req, res) => {
  try {
    res.json(await business.listStores());
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
