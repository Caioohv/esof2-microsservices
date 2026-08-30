const express = require('express');
const planRoutes    = require('./routes/plan.routes');
const paymentRoutes = require('./routes/payment.routes');

const app = express();

// Webhook do Stripe precisa do body RAW para validar a assinatura criptográfica.
app.use('/payment/webhook', express.raw({ type: 'application/json' }), (req, _res, next) => {
  if (Buffer.isBuffer(req.body)) {
    req.rawBody = req.body;
    req.body = JSON.parse(req.body.toString('utf8'));
  }
  next();
});

app.use(express.json());

app.use(planRoutes);
app.use(paymentRoutes);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'payment-service', ts: new Date().toISOString() });
});

app.use((err, _req, res, _next) => {
  const status = err.statusCode ?? 500;
  console.error(`[payment-service] ${err.message}`);
  res.status(status).json({ error: err.message || 'internal server error' });
});

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => console.log(`payment-service running on port ${PORT}`));
