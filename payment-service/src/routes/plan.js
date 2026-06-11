const router = require('express').Router();
const db = require('../db');
const { authenticate } = require('../auth');

const wrap = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

/**
 * GET /plan
 * Lista todos os planos disponíveis.
 * Público — não requer autenticação.
 */
router.get('/plan', wrap(async (req, res) => {
  const [rows] = await db.query(
    'SELECT id, name, price, features, duration_days FROM plans WHERE active = TRUE ORDER BY price ASC',
  );

  const plans = rows.map(row => ({
    id: row.id,
    name: row.name,
    price: Number(row.price),
    features: typeof row.features === 'string' ? JSON.parse(row.features) : row.features,
    duration_days: row.duration_days,
  }));

  res.json({ plans });
}));

/**
 * GET /plan/status
 * Retorna o status da assinatura ativa do Lojista autenticado.
 * Requer autenticação (JWT Bearer).
 */
router.get('/plan/status', authenticate, wrap(async (req, res) => {
  const userId = req.user.id;

  const [rows] = await db.query(
    `SELECT
       s.id,
       s.status,
       s.expires_at,
       s.created_at,
       p.id   AS plan_id,
       p.name AS plan_name,
       p.price AS plan_price,
       p.features AS plan_features,
       p.duration_days
     FROM subscriptions s
     JOIN plans p ON p.id = s.plan_id
     WHERE s.lojista_id = ?
     ORDER BY s.created_at DESC
     LIMIT 1`,
    [userId],
  );

  if (!rows[0]) {
    return res.json({
      has_subscription: false,
      status: 'none',
      subscription: null,
    });
  }

  const sub = rows[0];
  const isActive = sub.status === 'active' && new Date(sub.expires_at) > new Date();

  res.json({
    has_subscription: true,
    status: isActive ? 'active' : sub.status,
    subscription: {
      id: sub.id,
      status: sub.status,
      expires_at: sub.expires_at,
      created_at: sub.created_at,
      plan: {
        id: sub.plan_id,
        name: sub.plan_name,
        price: Number(sub.plan_price),
        features: typeof sub.plan_features === 'string'
          ? JSON.parse(sub.plan_features)
          : sub.plan_features,
        duration_days: sub.duration_days,
      },
    },
  });
}));

module.exports = router;
