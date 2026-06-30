const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const logger = require('./middlewares/logger');
const { register, deregister, getConfig } = require('./lib/consul');

const PORT = process.env.PORT || 3001;

async function main() {
  const corsOrigin = await getConfig(
    'config/auth-service/cors-origin',
    process.env.CORS_ORIGIN || '*',
  );

  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use(logger);
  app.get('/health', (req, res) => res.json({ status: 'ok', service: 'auth-service' }));
  app.use(authRoutes);
  app.use((err, req, res, _next) => {
    console.error(err);
    res.status(500).json({ error: 'internal server error' });
  });

  const id = await register({ name: 'auth-service', port: PORT });

  app.listen(PORT, () => console.log(`auth-service running on port ${PORT}`));

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
