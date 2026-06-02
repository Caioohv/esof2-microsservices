# Deploy

## Visão geral

```
GitHub push → CI (testes) → Build Docker → ghcr.io → SSH na VPS → docker compose up
```

Dois ambientes:
| Arquivo | Uso |
|---|---|
| `docker-compose.yml` | Desenvolvimento local (build local, portas expostas) |
| `docker-compose.prod.yml` | Produção (imagens do ghcr.io, rede Caddy) |

---

## Fluxo de CI/CD

### `.github/workflows/ci.yml`
Roda em todo push/PR. Executa os testes unitários do `store-service`.

### `.github/workflows/deploy.yml`
Roda apenas no push para `master`:
1. Testa
2. Faz build das imagens e sobe para `ghcr.io`
3. SSH na VPS → `docker compose pull` + `up`

---

## Redes Docker na VPS

A VPS já tem uma rede externa `caddy_net` gerenciada pelo Caddy (`infra/proxy`).

Os serviços precisam estar nessa rede para o Caddy conseguir fazer proxy. As databases ficam apenas na rede interna `internal`.

```
Internet → Caddy (caddy_net) → esof2_auth (3001)
                             → esof2_store (3004)
                                   ↓
                             internal network
                               ↙        ↘
                           mysql       postgres
```

---

## Caddyfile — entradas a adicionar

No arquivo `/home/viier/vps/infra/proxy/Caddyfile`, adicione:

```caddyfile
# esof2 — auth-service
auth.esof2.SEU_DOMINIO.com.br {
  reverse_proxy esof2_auth:3001
}

# esof2 — store-service
store.esof2.SEU_DOMINIO.com.br {
  reverse_proxy esof2_store:3004
}
```

> Substitua `SEU_DOMINIO.com.br` pelo domínio real. Após editar, rode:
> ```bash
> cd /path/to/vps/infra/proxy
> docker compose exec caddy caddy reload --config /etc/caddy/Caddyfile
> ```

---

## Variáveis de ambiente na VPS

Crie o arquivo `.env` na raiz do projeto clonado na VPS:

```env
# Banco de dados
DB_ROOT_PASSWORD=senha_forte_aqui

# JWT
JWT_SECRET=segredo_jwt_aqui
JWT_REFRESH_SECRET=segredo_refresh_aqui

# Docker registry (seu usuário do GitHub)
GHCR_OWNER=seu_usuario_github
```

O `IMAGE_TAG` é passado em runtime pelo workflow de deploy — não precisa estar no `.env`.

---

## Próximos passos

1. [VPS.md](VPS.md) — setup inicial da VPS (primeiro deploy)
2. [SECRETS.md](SECRETS.md) — secrets a configurar no GitHub
