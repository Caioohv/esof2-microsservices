const express = require('express')
const router = express.Router()

const {
  createStore,
  getStores,
  getStoreById,
  updateStore,
  deleteStore,
} = require('../controllers/storeController')

router.post('/', createStore)
router.get('/', getStores)
router.get('/:id', getStoreById)
router.put('/:id', updateStore)
router.delete('/:id', deleteStore)

module.exports = router