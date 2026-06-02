const authClient = require('../lib/authClient');

// Autenticação delegada ao auth-service: não há segredo JWT compartilhado aqui.
// O token é validado via auth-service/verify e o usuário do payload é anexado
// ao request.
const authenticate = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'token required' });

  try {
    req.user = await authClient.verifyToken(token);
    next();
  } catch (err) {
    res.status(err.status || 401).json({ error: err.message });
  }
};

module.exports = authenticate;
