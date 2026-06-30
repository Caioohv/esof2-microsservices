const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/user');
const logger = require('./middlewares/logger');
const { register, deregister } = require('./lib/consul');

const PORT = process.env.PORT || 3002;

const app = express();
app.use(cors());
app.use(express.json());
app.use(logger);
app.use(userRoutes);

app.use((err, req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'internal server error' });
});

async function main() {
  const id = await register({ name: 'user-service', port: PORT });

  app.listen(PORT, () => console.log(`user-service running on port ${PORT}`));

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
