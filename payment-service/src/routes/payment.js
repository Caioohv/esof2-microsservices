const router = require('express').Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { authenticate } = require('../auth');

const wrap = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// ─── Stripe (inicializado apenas se a chave existir) ───────────────────────
let stripe = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
}

// ─── Helpers ──────────────────────────────────────────────────────────────
function baseUrl(req) {
  const host = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
  return host;
}

/**
 * Ativa / renova uma subscription no banco após pagamento confirmado.
 */
async function activateSubscription({ lojista_id, plan_id, session_id, stripe_subscription_id }) {
  const [planRows] = await db.query('SELECT duration_days FROM plans WHERE id = ?', [plan_id]);
  const plan = planRows[0];
  if (!plan) throw new Error(`Plano não encontrado: ${plan_id}`);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + plan.duration_days);

  // Cancela assinaturas anteriores do lojista
  await db.query(
    "UPDATE subscriptions SET status = 'cancelled' WHERE lojista_id = ? AND status IN ('active', 'pending')",
    [lojista_id],
  );

  const subscriptionId = uuidv4();
  await db.query(
    `INSERT INTO subscriptions
       (id, lojista_id, plan_id, status, stripe_session_id, stripe_subscription_id, expires_at)
     VALUES (?, ?, ?, 'active', ?, ?, ?)`,
    [subscriptionId, lojista_id, plan_id, session_id ?? null, stripe_subscription_id ?? null, expiresAt],
  );

  return subscriptionId;
}

// ─── Rotas ────────────────────────────────────────────────────────────────

/**
 * GET /payment/options
 * Lista métodos de pagamento disponíveis e valores dos planos.
 * Público.
 */
router.get('/payment/options', wrap(async (req, res) => {
  const [plans] = await db.query(
    'SELECT id, name, price, features, duration_days FROM plans WHERE active = TRUE ORDER BY price ASC',
  );

  const methods = [
    { id: 'credit_card', label: 'Cartão de Crédito', installments: true, max_installments: 12 },
    { id: 'boleto',      label: 'Boleto Bancário',   installments: false },
    { id: 'pix',         label: 'PIX',               installments: false },
  ];

  res.json({
    payment_methods: methods,
    plans: plans.map(p => ({
      id: p.id,
      name: p.name,
      price: Number(p.price),
      features: typeof p.features === 'string' ? JSON.parse(p.features) : p.features,
      duration_days: p.duration_days,
    })),
  });
}));

/**
 * POST /payment/checkout
 * Cria uma sessão de checkout.
 * Se Stripe estiver configurado, cria um Stripe Checkout Session.
 * Caso contrário (modo acadêmico/mock), simula a sessão.
 * Requer autenticação.
 *
 * Body: { plan_id: string }
 */
router.post('/payment/checkout', authenticate, wrap(async (req, res) => {
  const { plan_id } = req.body;
  const userId = req.user.id;

  if (!plan_id) {
    return res.status(400).json({ error: 'plan_id é obrigatório' });
  }

  const [planRows] = await db.query(
    'SELECT * FROM plans WHERE id = ? AND active = TRUE',
    [plan_id],
  );
  const plan = planRows[0];

  if (!plan) {
    return res.status(404).json({ error: 'plano não encontrado' });
  }

  const base = baseUrl(req);

  // ── Modo Stripe real ──
  if (stripe && plan.stripe_price_id) {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: plan.stripe_price_id, quantity: 1 }],
      success_url: `${base}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/payment/cancel`,
      metadata: { lojista_id: userId, plan_id },
    });

    // Cria subscription como 'pending' até o webhook confirmar
    await db.query(
      `INSERT INTO subscriptions (id, lojista_id, plan_id, status, stripe_session_id)
       VALUES (?, ?, ?, 'pending', ?)`,
      [uuidv4(), userId, plan_id, session.id],
    );

    return res.status(201).json({
      checkout_url: session.url,
      session_id: session.id,
      mode: 'stripe',
    });
  }

  // ── Modo mock (sem Stripe configurado — ambiente acadêmico) ──
  const mockSessionId = `mock_session_${uuidv4()}`;

  await db.query(
    `INSERT INTO subscriptions (id, lojista_id, plan_id, status, stripe_session_id)
     VALUES (?, ?, ?, 'pending', ?)`,
    [uuidv4(), userId, plan_id, mockSessionId],
  );

  const checkoutUrl = `${base}/payment/success?session_id=${mockSessionId}&mock=true&plan_id=${plan_id}&user_id=${userId}`;

  res.status(201).json({
    checkout_url: checkoutUrl,
    session_id: mockSessionId,
    mode: 'mock',
    plan: {
      name: plan.name,
      price: Number(plan.price),
    },
  });
}));

/**
 * POST /payment/webhook
 * Recebe eventos do Stripe (checkout.session.completed, customer.subscription.deleted).
 * Requer raw body para validar a assinatura do webhook.
 */
router.post(
  '/payment/webhook',
  express_raw_body_middleware, // aplicado via rawBody abaixo
  wrap(async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    if (stripe && webhookSecret) {
      // Valida assinatura do Stripe
      try {
        event = stripe.webhooks.constructEvent(req.rawBody, sig, webhookSecret);
      } catch (err) {
        console.error('[webhook] assinatura inválida:', err.message);
        return res.status(400).json({ error: `webhook inválido: ${err.message}` });
      }
    } else {
      // Modo mock: aceita o body JSON diretamente
      event = req.body;
    }

    console.log(`[webhook] evento recebido: ${event.type}`);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data?.object ?? event.data ?? event;
        const lojista_id = session.metadata?.lojista_id ?? session.lojista_id;
        const plan_id = session.metadata?.plan_id ?? session.plan_id;
        const session_id = session.id ?? session.session_id;
        const stripe_subscription_id = session.subscription ?? null;

        if (!lojista_id || !plan_id) {
          console.warn('[webhook] metadata incompleta:', { lojista_id, plan_id });
          return res.json({ received: true });
        }

        await activateSubscription({ lojista_id, plan_id, session_id, stripe_subscription_id });
        console.log(`[webhook] assinatura ativada — lojista: ${lojista_id}, plano: ${plan_id}`);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data?.object ?? event.data ?? event;
        const stripeSubId = subscription.id ?? subscription.stripe_subscription_id;

        if (stripeSubId) {
          await db.query(
            "UPDATE subscriptions SET status = 'cancelled' WHERE stripe_subscription_id = ?",
            [stripeSubId],
          );
          console.log(`[webhook] assinatura cancelada — stripe_id: ${stripeSubId}`);
        }
        break;
      }

      // Mock: evento simples para testes
      case 'mock.payment.success': {
        const { lojista_id, plan_id, session_id } = event.data ?? {};
        if (lojista_id && plan_id) {
          await activateSubscription({ lojista_id, plan_id, session_id });
        }
        break;
      }

      default:
        console.log(`[webhook] evento ignorado: ${event.type}`);
    }

    res.json({ received: true });
  }),
);

/**
 * GET /payment/success
 * Página de sucesso após checkout.
 * Em modo mock, ativa automaticamente a assinatura.
 */
router.get('/payment/success', wrap(async (req, res) => {
  const { session_id, mock, plan_id, user_id } = req.query;

  // Ativa automaticamente no modo mock
  if (mock === 'true' && plan_id && user_id) {
    const [existing] = await db.query(
      "SELECT id, status FROM subscriptions WHERE stripe_session_id = ?",
      [session_id],
    );

    if (existing[0]?.status === 'pending') {
      await activateSubscription({ lojista_id: user_id, plan_id, session_id });
    }
  }

  res.send(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Pagamento Confirmado</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          font-family: system-ui, -apple-system, sans-serif;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f0fdf4;
          color: #166534;
        }
        .card {
          background: white;
          border-radius: 16px;
          padding: 48px 40px;
          text-align: center;
          box-shadow: 0 4px 24px rgba(0,0,0,0.08);
          max-width: 420px;
          width: 90%;
        }
        .icon { font-size: 64px; margin-bottom: 16px; }
        h1 { font-size: 1.75rem; margin-bottom: 8px; }
        p { color: #4b5563; margin-bottom: 24px; }
        .session { font-size: 0.75rem; color: #9ca3af; word-break: break-all; }
        a {
          display: inline-block;
          background: #16a34a;
          color: white;
          padding: 12px 28px;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 600;
          margin-top: 8px;
        }
        a:hover { background: #15803d; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="icon">✅</div>
        <h1>Pagamento Confirmado!</h1>
        <p>Sua assinatura foi ativada com sucesso.<br>Você já pode começar a usar a plataforma.</p>
        ${session_id ? `<p class="session">ID da sessão: ${session_id}</p>` : ''}
        <a href="/">Ir para o início</a>
      </div>
    </body>
    </html>
  `);
}));

/**
 * GET /payment/cancel
 * Página exibida quando o usuário cancela o checkout.
 */
router.get('/payment/cancel', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Pagamento Cancelado</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          font-family: system-ui, -apple-system, sans-serif;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #fff7ed;
          color: #9a3412;
        }
        .card {
          background: white;
          border-radius: 16px;
          padding: 48px 40px;
          text-align: center;
          box-shadow: 0 4px 24px rgba(0,0,0,0.08);
          max-width: 420px;
          width: 90%;
        }
        .icon { font-size: 64px; margin-bottom: 16px; }
        h1 { font-size: 1.75rem; margin-bottom: 8px; }
        p { color: #4b5563; margin-bottom: 24px; }
        a {
          display: inline-block;
          background: #ea580c;
          color: white;
          padding: 12px 28px;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 600;
          margin-right: 8px;
          margin-top: 8px;
        }
        a:hover { opacity: 0.9; }
        a.secondary { background: #6b7280; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="icon">❌</div>
        <h1>Pagamento Cancelado</h1>
        <p>Nenhuma cobrança foi realizada.<br>Você pode tentar novamente quando quiser.</p>
        <a href="/plan">Ver Planos</a>
        <a href="/" class="secondary">Início</a>
      </div>
    </body>
    </html>
  `);
});

// Placeholder — será substituído no index.js pelo express.raw()
function express_raw_body_middleware(req, res, next) {
  next();
}

module.exports = router;
