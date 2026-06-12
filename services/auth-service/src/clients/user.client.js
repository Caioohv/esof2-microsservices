const { AppError } = require('../errors');

const BASE_URL = process.env.USER_SERVICE_URL || 'http://user-service:3002';

// Cria o usuário no user-service. O auth-service é dono da credencial;
// o user-service é dono do perfil/usuário. A criação de conta envolve os dois.
async function createUser({ id, email, role }) {
  let res;
  try {
    res = await fetch(`${BASE_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, email, role }),
    });
  } catch {
    throw new AppError(502, 'user-service unreachable');
  }

  if (res.status === 409) throw new AppError(409, 'email already registered');
  if (!res.ok) throw new AppError(502, 'failed to create user');

  return res.json();
}

module.exports = { createUser };
