const bs = require('../business/store.bs')

exports.createStore = async (req, res, next) => {
  try {
    const store = await bs.createStore(req.body)
    res.status(201).json(store)
  } catch (err) {
    next(err)
  }
}

exports.getStores = async (req, res, next) => {
  try {
    const stores = await bs.listStores(req.query)
    res.json(stores)
  } catch (err) {
    next(err)
  }
}

exports.getStoreById = async (req, res, next) => {
  try {
    const store = await bs.getStore(req.params.id)
    res.json(store)
  } catch (err) {
    next(err)
  }
}

exports.updateStore = async (req, res, next) => {
  try {
    const store = await bs.updateStore(req.params.id, req.body)
    res.json(store)
  } catch (err) {
    next(err)
  }
}

exports.deleteStore = async (req, res, next) => {
  try {
    await bs.deleteStore(req.params.id)
    res.status(204).send()
  } catch (err) {
    next(err)
  }
}
