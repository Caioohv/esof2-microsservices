const express = require('express')
const cors = require('cors')

const storeRoutes = require('./routes/storeRoutes')
const productRoutes = require('./routes/productRoutes')

const app = express()

app.use(cors())
app.use(express.json())

app.use('/store', storeRoutes)
app.use('/store', productRoutes)

module.exports = app