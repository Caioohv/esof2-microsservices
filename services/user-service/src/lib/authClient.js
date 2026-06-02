const { AppError } = require('../errors');

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';

// Cria as credenciais no auth-service para um usuário já existente neste serviço.
// O auth-service é a fonte de verdade das credenciais; este serviço é a fonte de
// verdade da identidade. O userId é gerado aqui e propagado para o auth.
async function register(userId, email, password) {
  let res;
  try {
    res = await fetch(`${AUTH_SERVICE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, email, password }),
    });
  } catch {
    throw new AppError(502, 'auth-service unavailable');
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const status = res.status === 409 ? 409 : 502;
    throw new AppError(status, body.error || 'auth registration failed');
  }
}

// Valida um access token chamando o auth-service e retorna o usuário do payload.
async function verifyToken(token) {
  let res;
  try {
    res = await fetch(`${AUTH_SERVICE_URL}/verify`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch {
    throw new AppError(502, 'auth-service unavailable');
  }

  if (!res.ok) throw new AppError(401, 'invalid or expired token');

  const body = await res.json();
  return body.user;
}

module.exports = { register, verifyToken };
