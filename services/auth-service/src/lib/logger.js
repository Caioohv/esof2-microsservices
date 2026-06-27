const SERVICE = 'auth-service';

function log(level, event, data = {}) {
  process.stdout.write(
    JSON.stringify({ timestamp: new Date().toISOString(), level, service: SERVICE, event, ...data }) + '\n',
  );
}

module.exports = {
  info: (event, data) => log('INFO', event, data),
  warn: (event, data) => log('WARN', event, data),
  error: (event, data) => log('ERROR', event, data),
};
