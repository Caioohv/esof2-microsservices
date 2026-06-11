const repo = require('../repositories/store.rep');
const { AppError } = require('../errors');

async function createStore({ ownerId, name, description, category }) {
  if (!ownerId) throw new AppError(400, 'owner_id is required');
  if (!name) throw new AppError(400, 'name is required');
  return repo.insertStore({ ownerId, name, description, category });
}

async function listStores({ ownerId } = {}) {
  return repo.findStores({ ownerId });
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
