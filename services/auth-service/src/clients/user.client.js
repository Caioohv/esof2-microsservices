const { discoverService } = require('../lib/consul');
const { AppError } = require('../errors');

let userServiceUrl = null;

async function getBaseUrl() {
  if (!userServiceUrl) {
    try {
      userServiceUrl = await discoverService('user-service');
    } catch {
      userServiceUrl = process.env.USER_SERVICE_URL || 'http://user-service:3002';
    }
  }
  return userServiceUrl;
}

async function createUser({ id, email, role }) {
  const baseUrl = await getBaseUrl();
  let res;
  try {
    res = await fetch(`${baseUrl}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, email, role }),
    });
  } catch {
    userServiceUrl = null; // reset cache so next call re-discovers
    throw new AppError(502, 'user-service unreachable');
  }

  if (res.status === 409) throw new AppError(409, 'email already registered');
  if (!res.ok) throw new AppError(502, 'failed to create user');

  return res.json();
}

module.exports = { createUser };
