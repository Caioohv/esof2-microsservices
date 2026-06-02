const storeService = require('../services/storeService')

exports.createStore = async (req, res) => {
  try {
    const store = await storeService.createStore(req.body)

    res.status(201).json(store)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

exports.getStores = async (req, res) => {
  try {
    const stores = await storeService.getStores()

    res.json(stores)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

exports.getStoreById = async (req, res) => {
  try {
    const store = await storeService.getStoreById(req.params.id)

    if (!store) {
      return res.status(404).json({
        message: 'Loja não encontrada'
      })
    }

    res.json(store)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

exports.updateStore = async (req, res) => {
  try {
    const store = await storeService.updateStore(
      req.params.id,
      req.body
    )

    res.json(store)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

exports.deleteStore = async (req, res) => {
  try {
    await storeService.deleteStore(req.params.id)

    return res.status(204).send()
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
