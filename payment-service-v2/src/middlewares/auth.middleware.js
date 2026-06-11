async function authenticate(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];

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

    req.user = data.user;
    next();
  } catch (err) {
    console.error('[auth middleware] erro:', err.message);
    return res.status(503).json({ error: 'auth-service indisponível' });
  }
}

module.exports = { authenticate };
