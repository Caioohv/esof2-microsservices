const express = require('express');
const planRoutes = require('./routes/plan');
const paymentRoutes = require('./routes/payment');

const app = express();

// O webhook do Stripe exige o body RAW (não parseado) para validar a assinatura.
// Por isso aplicamos express.raw() SOMENTE na rota do webhook.
app.use('/payment/webhook', express.raw({ type: 'application/json' }), (req, res, next) => {
  // Disponibiliza o raw body para o handler do webhook
  if (Buffer.isBuffer(req.body)) {
    req.rawBody = req.body;
    req.body = JSON.parse(req.body.toString('utf8'));
  }
  next();
});

// Para todas as demais rotas usamos JSON normal
app.use(express.json());

// ── Rotas ──────────────────────────────────────────────────────────────────
app.use(planRoutes);
app.use(paymentRoutes);

// ── Health check ───────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'payment-service', ts: new Date().toISOString() });
});

// ── Error handler ──────────────────────────────────────────────────────────
app.use((err, req, res, _next) => {
  console.error('[payment-service error]', err);
  res.status(500).json({ error: 'internal server error' });
});

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => console.log(`payment-service running on port ${PORT}`));
