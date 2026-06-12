const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const logger = require('./middlewares/logger');

const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());
app.use(logger);
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'auth-service' }));
app.use(authRoutes);

app.use((err, req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'internal server error' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`auth-service running on port ${PORT}`));
