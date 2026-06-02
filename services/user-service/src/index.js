const express = require('express');
const userRoutes = require('./routes/user');
const logger = require('./middlewares/logger');

const app = express();
app.use(express.json());
app.use(logger);
app.use(userRoutes);

app.use((err, req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'internal server error' });
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`user-service running on port ${PORT}`));
