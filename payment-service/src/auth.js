/**
 * Middleware de autenticação.
 * Chama o auth-service POST /verify para validar o JWT e extrair o usuário.
 */
async function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'token requerido' });
  }

  try {
    const authUrl = process.env.AUTH_SERVICE_URL || 'http://auth-service:3001';
    const response = await fetch(`${authUrl}/verify`, {
      method: 'POST',
      headers: { authorization: `Bearer ${token}` },
    });

    const data = await response.json();

    if (!response.ok || !data.valid) {
      return res.status(401).json({ error: 'token inválido ou expirado' });
    }

    req.user = data.user; // { id, email }
    next();
  } catch (err) {
    console.error('[auth middleware] erro ao verificar token:', err.message);
    return res.status(503).json({ error: 'auth-service indisponível' });
  }
}

module.exports = { authenticate };
