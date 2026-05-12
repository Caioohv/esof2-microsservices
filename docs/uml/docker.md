# Docker — Arquitetura e Configuração

## Visão Geral

Toda a plataforma roda em contêineres Docker orquestrados via **Docker Compose**. Cada serviço tem seu próprio `Dockerfile` e se comunica via rede interna `showcase-network`.

## Diagrama de Infraestrutura (PlantUML)

```plantuml
@startuml docker-infra
title Docker Compose — Infraestrutura

skinparam componentStyle rectangle
skinparam linetype ortho

cloud "Internet" as internet

rectangle "Host" {
  component "Nginx\n:80 / :443" as nginx

  rectangle "showcase-network (bridge)" {
    component "BFF / Nuxt 3\n:3000" as bff
    component "auth-service\n:3001" as auth
    component "user-service\n:3002" as users
    component "payment-service\n:3003" as payment
    component "store-service\n:3004" as store

    database  "MySQL\n:3306\nauth_db" as mysql
    database  "PostgreSQL\n:5432\nusers_db\nstore_db\npayment_db" as postgres
    storage   "MinIO (S3)\n:9000" as minio
    queue     "Redis\n:6379" as redis
  }
}

internet --> nginx

nginx --> bff      : /
nginx --> auth     : /api/auth/*  (interno)

bff --> auth
bff --> users
bff --> payment
bff --> store

auth    --> mysql
users   --> postgres
payment --> postgres
store   --> postgres
store   --> minio
store   --> redis   : publish
payment --> redis   : publish

@enduml
```

---

## Serviços e Contêineres

| Serviço | Imagem | Porta host | Porta interna | Depende de |
|---|---|---|---|---|
| `nginx` | nginx:alpine | 80, 443 | 80, 443 | bff, auth |
| `bff` | build: apps/showcase-app | — | 3000 | auth, users, payment, store |
| `auth-service` | build: services/auth-service | — | 3001 | mysql |
| `user-service` | build: services/user-service | — | 3002 | postgres, auth |
| `payment-service` | build: services/payment-service | — | 3003 | postgres, auth |
| `store-service` | build: services/store-service | — | 3004 | postgres, auth, users, minio, redis |
| `mysql` | mysql:8 | — | 3306 | — |
| `postgres` | postgres:16-alpine | — | 5432 | — |
| `minio` | minio/minio | — | 9000, 9001 | — |
| `redis` | redis:7-alpine | — | 6379 | — |

> Portas de banco, Redis e MinIO **não** são expostas ao host em produção. Em desenvolvimento, podem ser mapeadas para inspeção local.

---

## Estrutura de Dockerfiles

### Padrão multi-stage (Node.js / NestJS)

```dockerfile
# services/<nome>/Dockerfile

FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
EXPOSE <PORTA>
CMD ["node", "dist/main"]
```

### Frontend (Nuxt 3)

```dockerfile
# apps/showcase-app/Dockerfile

FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.output ./.output
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
```

---

## docker-compose.yml completo (referência)

```yaml
name: high-ticket-showcase

networks:
  showcase-network:
    driver: bridge

volumes:
  mysql_data:
  postgres_data:
  minio_data:
  redis_data:

services:

  # ── Infraestrutura ──────────────────────────────────────────

  mysql:
    image: mysql:8
    networks: [showcase-network]
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_ROOT_PASSWORD}
    volumes:
      - mysql_data:/var/lib/mysql
      - ./services/auth-service/init.sql:/docker-entrypoint-initdb.d/01-auth.sql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost", "-uroot", "-p${DB_ROOT_PASSWORD}"]
      interval: 10s
      timeout: 5s
      retries: 5

  postgres:
    image: postgres:16-alpine
    networks: [showcase-network]
    environment:
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./infra/postgres/init.sql:/docker-entrypoint-initdb.d/init.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  minio:
    image: minio/minio
    networks: [showcase-network]
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: ${MINIO_USER}
      MINIO_ROOT_PASSWORD: ${MINIO_PASSWORD}
    volumes:
      - minio_data:/data
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9000/minio/health/live"]
      interval: 30s
      timeout: 10s
      retries: 3

  redis:
    image: redis:7-alpine
    networks: [showcase-network]
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  # ── Aplicações ──────────────────────────────────────────────

  auth-service:
    build: ./services/auth-service
    networks: [showcase-network]
    environment:
      DB_HOST: mysql
      DB_PORT: 3306
      DB_USER: root
      DB_PASSWORD: ${DB_ROOT_PASSWORD}
      DB_NAME: auth_db
      JWT_SECRET: ${JWT_SECRET}
      JWT_REFRESH_SECRET: ${JWT_REFRESH_SECRET}
      PORT: 3001
    depends_on:
      mysql:
        condition: service_healthy

  user-service:
    build: ./services/user-service
    networks: [showcase-network]
    environment:
      DATABASE_URL: postgresql://postgres:${DB_PASSWORD}@postgres:5432/users_db
      AUTH_SERVICE_URL: http://auth-service:3001
      PORT: 3002
    depends_on:
      postgres:
        condition: service_healthy
      auth-service:
        condition: service_started

  payment-service:
    build: ./services/payment-service
    networks: [showcase-network]
    environment:
      DATABASE_URL: postgresql://postgres:${DB_PASSWORD}@postgres:5432/payment_db
      AUTH_SERVICE_URL: http://auth-service:3001
      STRIPE_SECRET_KEY: ${STRIPE_SECRET_KEY}
      STRIPE_WEBHOOK_SECRET: ${STRIPE_WEBHOOK_SECRET}
      REDIS_URL: redis://redis:6379
      PORT: 3003
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy

  store-service:
    build: ./services/store-service
    networks: [showcase-network]
    environment:
      DATABASE_URL: postgresql://postgres:${DB_PASSWORD}@postgres:5432/store_db
      AUTH_SERVICE_URL: http://auth-service:3001
      USER_SERVICE_URL: http://user-service:3002
      PAYMENT_SERVICE_URL: http://payment-service:3003
      MINIO_ENDPOINT: minio
      MINIO_PORT: 9000
      MINIO_ACCESS_KEY: ${MINIO_USER}
      MINIO_SECRET_KEY: ${MINIO_PASSWORD}
      REDIS_URL: redis://redis:6379
      PORT: 3004
    depends_on:
      postgres:
        condition: service_healthy
      minio:
        condition: service_healthy
      redis:
        condition: service_healthy

  bff:
    build: ./apps/showcase-app
    networks: [showcase-network]
    environment:
      AUTH_SERVICE_URL: http://auth-service:3001
      USER_SERVICE_URL: http://user-service:3002
      PAYMENT_SERVICE_URL: http://payment-service:3003
      STORE_SERVICE_URL: http://store-service:3004
      NUXT_SECRET: ${NUXT_SECRET}
      PORT: 3000
    depends_on:
      - auth-service
      - user-service
      - payment-service
      - store-service

  nginx:
    image: nginx:alpine
    networks: [showcase-network]
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./infra/nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./infra/nginx/certs:/etc/nginx/certs:ro
    depends_on:
      - bff
```

---

## Configuração do Nginx

```nginx
# infra/nginx/nginx.conf

events { worker_connections 1024; }

http {
  upstream bff        { server bff:3000; }
  upstream auth       { server auth-service:3001; }

  server {
    listen 80;
    server_name _;
    return 301 https://$host$request_uri;
  }

  server {
    listen 443 ssl;
    server_name _;

    ssl_certificate     /etc/nginx/certs/cert.pem;
    ssl_certificate_key /etc/nginx/certs/key.pem;

    # Todo o tráfego vai para o BFF
    location / {
      proxy_pass http://bff;
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
    }

    # Rota direta ao auth-service para webhooks internos (não exposta ao público)
    # Demais rotas /api/* são gerenciadas pelo BFF
  }
}
```

---

## Fluxo de Build e Deploy

```
# Desenvolvimento
docker compose up --build

# Produção
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Rebuild de um serviço específico
docker compose up --build store-service

# Logs
docker compose logs -f store-service

# Migrations (Prisma)
docker compose exec store-service npx prisma migrate deploy
```

---

## Banco de Dados por Serviço

| Serviço | Engine | Database | Isolamento |
|---|---|---|---|
| auth-service | MySQL 8 | `auth_db` | Contêiner dedicado |
| user-service | PostgreSQL 16 | `users_db` | Schema isolado no mesmo contêiner |
| payment-service | PostgreSQL 16 | `payment_db` | Schema isolado no mesmo contêiner |
| store-service | PostgreSQL 16 | `store_db` | Schema isolado no mesmo contêiner |

> O PostgreSQL usa um único contêiner com múltiplos databases. Isso é aceitável para desenvolvimento e projetos de médio porte. Em produção com alta carga, cada serviço pode ter seu próprio contêiner PostgreSQL.
