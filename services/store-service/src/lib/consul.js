const Consul = require('consul');

const consul = new Consul({
  host: process.env.CONSUL_HOST || 'consul',
  port: Number(process.env.CONSUL_PORT) || 8500,
  promisify: true,
});

async function register({ name, port }) {
  const id = `${name}-${process.env.HOSTNAME || 'local'}`;
  try {
    await consul.agent.service.register({
      id,
      name,
      address: name,
      port: Number(port),
      check: {
        http: `http://${name}:${port}/health`,
        interval: '10s',
        deregistercriticalserviceafter: '30s',
      },
    });
    console.log(`[consul] registered ${name} as ${id}`);
  } catch (err) {
    console.warn(`[consul] registration failed: ${err.message}`);
  }
  return id;
}

async function deregister(id) {
  try {
    await consul.agent.service.deregister(id);
    console.log(`[consul] deregistered ${id}`);
  } catch (err) {
    console.warn(`[consul] deregistration failed: ${err.message}`);
  }
}

async function discoverService(name) {
  const result = await consul.health.service({ service: name, passing: true });
  if (!result || result.length === 0) throw new Error(`no healthy instance of ${name}`);
  const { Address, Port } = result[0].Service;
  return `http://${Address}:${Port}`;
}

async function getConfig(key, defaultValue) {
  try {
    const result = await consul.kv.get(key);
    if (result && result.Value) return Buffer.from(result.Value, 'base64').toString('utf8').trim();
  } catch {
    // consul unavailable — fall through to default
  }
  return defaultValue;
}

module.exports = { register, deregister, discoverService, getConfig };
