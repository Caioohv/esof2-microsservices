const repository = require('../repositories/storeRepository')

async function createStore(data) {
  return repository.createStore(
    data.name,
    data.description,
    data.category
  )
}

async function getStores() {
  return repository.getStores()
}

async function getStoreById(id) {
  return repository.getStoreById(id)
}

async function updateStore(id, data) {
  return repository.updateStore(
    id,
    data.name,
    data.description,
    data.category
  )
}

async function deleteStore(id) {
  return repository.deleteStore(id)
}

module.exports = {
  createStore,
  getStores,
  getStoreById,
  updateStore,
  deleteStore
}
