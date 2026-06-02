const business = require('../business/product.bs');

const create = async (req, res) => {
  try {
    const product = await business.createProduct(req.params.id, req.body);
    res.status(201).json(product);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

const list = async (req, res) => {
  try {
    res.json(await business.listProducts(req.params.id));
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

const getById = async (req, res) => {
  try {
    res.json(await business.getProduct(req.params.id, req.params.productId));
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

const update = async (req, res) => {
  try {
    res.json(await business.updateProduct(req.params.id, req.params.productId, req.body));
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

const remove = async (req, res) => {
  try {
    await business.deleteProduct(req.params.id, req.params.productId);
    res.status(204).end();
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

module.exports = { create, list, getById, update, remove };
