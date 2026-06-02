const repo = require('../repositories/store.rep');
const { AppError } = require('../errors');

async function createStore({ name, description, category }) {
  if (!name) throw new AppError(400, 'name is required');
  return repo.insertStore({ name, description, category });
}

async function listStores() {
  return repo.findStores();
}

async function getStore(id) {
  const store = await repo.findStoreById(id);
  if (!store) throw new AppError(404, 'store not found');
  return store;
}

async function updateStore(id, { name, description, category }) {
  await getStore(id);
  return repo.updateStore(id, { name, description, category });
}

async function deleteStore(id) {
  await getStore(id);
  await repo.deleteStore(id);
}

module.exports = {
  createStore,
  listStores,
  getStore,
  updateStore,
  deleteStore,
};
