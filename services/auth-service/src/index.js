const express = require('express');
const authRoutes = require('./routes/auth');
const logger = require('./middlewares/logger');

const app = express();
app.use(express.json());
app.use(logger);
app.use(authRoutes);

app.use((err, req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'internal server error' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`auth-service running on port ${PORT}`));
