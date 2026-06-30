const logger = require('../lib/logger');

const httpLogger = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const durationMs = Date.now() - start;
    const level = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';
    logger[level]('http_request', { method: req.method, path: req.path, status: res.statusCode, durationMs });
  });

  next();
};

module.exports = httpLogger;
