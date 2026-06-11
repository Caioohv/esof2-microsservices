# 11 — Infra: configurar Nginx como reverse proxy

**Serviço:** infra  
**Responsável:**  
**Data limite:**  

## Descrição

Configurar o Nginx como único ponto de entrada externo, roteando tráfego para cada serviço conforme o spec:

| Rota externa | Serviço interno |
|---|---|
| `/auth/*` | auth-service:3001 |
| `/users/*` | user-service:3002 |
| `/payment/*` | payment-service:3003 |
| `/store/*` | store-service:3004 |
| `/*` | webapp:3000 |

## Como executar

Criar `services/nginx/nginx.conf`:

```nginx
events {}

http {
  upstream auth    { server auth-service:3001; }
  upstream users   { server user-service:3002; }
  upstream payment { server payment-service:3003; }
  upstream store   { server store-service:3004; }
  upstream webapp  { server webapp:3000; }

  server {
    listen 80;

    location /auth/    { proxy_pass http://auth/; }
    location /users/   { proxy_pass http://users/; }
    location /payment/ { proxy_pass http://payment/; }
    location /store/   { proxy_pass http://store/; }
    location /         { proxy_pass http://webapp/; }
  }
}
```

Adicionar ao `docker-compose.yml`:

```yaml
nginx:
  image: nginx:alpine
  ports:
    - "80:80"
  volumes:
    - ./services/nginx/nginx.conf:/etc/nginx/nginx.conf:ro
  depends_on:
    - auth-service
    - user-service
    - store-service
    - webapp
```

## Acceptance criteria

- [ ] `curl http://localhost/auth/health` responde (via Nginx → auth-service)
- [ ] `curl http://localhost/store/health` responde (via Nginx → store-service)
- [ ] `curl http://localhost/` carrega o webapp
- [ ] Serviços não são acessíveis diretamente (portas internas não expostas no compose de produção)
