# Consul

O Consul é usado no projeto para duas finalidades: **service discovery** e **config centralizado (KV Store)**.

## Fluxo de subida

```
consul sobe → consul-init popula KV → auth/user/store-service sobem → se registram no Consul
```

## 1. Service Discovery

Cada serviço se registra no Consul ao iniciar e se desregistra ao parar (SIGTERM/SIGINT). O `auth-service` usa isso para descobrir a URL do `user-service` dinamicamente:

```js
// auth-service/src/clients/user.client.js
userServiceUrl = await discoverService('user-service');
// retorna "http://user-service:3002"
```

Se o Consul estiver indisponível, cai no fallback `USER_SERVICE_URL` do ambiente.

Com Docker Compose o DNS já resolve os hostnames, então o service discovery é mais infraestrutura para escala futura (múltiplas instâncias, Kubernetes).

## 2. Config Centralizado (KV Store)

O `infra/consul/init.sh` popula o KV na subida do `consul-init`:

```sh
consul kv put config/auth-service/cors-origin "*"
consul kv put config/auth-service/port "3001"
consul kv put config/user-service/port "3002"
consul kv put config/store-service/port "3004"
```

O `auth-service` lê o valor antes de iniciar o servidor:

```js
const corsOrigin = await getConfig('config/auth-service/cors-origin', '*');
```

Para mudar um valor em produção sem restartar o container:

```sh
consul kv put config/auth-service/cors-origin "https://olimposhowcase.com.br"
```

## UI

Em desenvolvimento, acesse `http://localhost:8500` após `docker compose up`.

- **Services**: serviços registrados e status dos health checks (batem em `/health` de cada serviço)
- **Key/Value**: configs populados pelo `init.sh`

## Health Checks

Cada serviço expõe `/health` e o Consul verifica a cada 10s. Se um serviço ficar crítico por 30s, é desregistrado automaticamente.

## Lib compartilhada

Cada serviço tem `src/lib/consul.js` com as funções:

| Função | Uso |
|--------|-----|
| `register({ name, port })` | Registra o serviço no startup |
| `deregister(id)` | Desregistra no shutdown |
| `discoverService(name)` | Retorna URL de uma instância saudável |
| `getConfig(key, default)` | Lê valor do KV Store com fallback |
