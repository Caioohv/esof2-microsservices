const express = require('express');
const cors = require('cors');
const storeRoutes = require('./routes/store');
const productRoutes = require('./routes/product');
const logger = require('./middlewares/logger');
const { register, deregister } = require('./lib/consul');

const PORT = process.env.PORT || 3004;

const app = express();
app.use(cors());
app.use(express.json());
app.use(logger);
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'store-service' }));
app.use('/store', storeRoutes);
app.use('/store', productRoutes);

app.use((err, req, res, _next) => {
  if (err.status) return res.status(err.status).json({ error: err.message });
  console.error(err);
  res.status(500).json({ error: 'internal server error' });
});

async function main() {
  const id = await register({ name: 'store-service', port: PORT });

  app.listen(PORT, () => console.log(`store-service running on port ${PORT}`));

  async function shutdown() {
    await deregister(id);
    process.exit(0);
  }
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

main().catch(err => {
  console.error('startup failed:', err);
  process.exit(1);
});

module.exports = app;
