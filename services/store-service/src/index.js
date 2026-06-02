const express = require('express');
const cors = require('cors');

const storeRoutes = require('./routes/store');
const productRoutes = require('./routes/product');
const logger = require('./middlewares/logger');

const app = express();

app.use(cors());
app.use(express.json());
app.use(logger);

app.use('/store', storeRoutes);
app.use('/store', productRoutes);

app.use((err, req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'internal server error' });
});

const PORT = process.env.PORT || 3004;
app.listen(PORT, () => console.log(`store-service running on port ${PORT}`));

module.exports = app;
