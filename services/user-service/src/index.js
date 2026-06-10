const express = require('express');
const userRoutes = require('./routes/user');

const app = express();

app.use(express.json());
app.use(userRoutes);

const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {
  console.log(`user-service running on port ${PORT}`);
});