# Setup inicial da VPS

Passos a executar **uma única vez** antes do primeiro deploy automático.

## 1. Clonar o repositório

```bash
git clone https://github.com/SEU_USUARIO/esof2-microsservices.git /opt/esof2
cd /opt/esof2
```

## 2. Criar o arquivo `.env`

```bash
cp .env.example .env
nano .env
```

Preencha todos os valores (veja [README.md](README.md#variáveis-de-ambiente-na-vps)).

## 3. Garantir que a rede `caddy_net` existe

```bash
docker network ls | grep caddy_net
# Se não existir:
docker network create caddy_net
```

Se o Caddy já está rodando (`infra/proxy`), a rede já existe.

## 4. Autenticar no ghcr.io

Crie um Personal Access Token (PAT) no GitHub com escopo `read:packages` (veja [SECRETS.md](SECRETS.md)).

```bash
echo "SEU_PAT" | docker login ghcr.io -u SEU_USUARIO --password-stdin
```

## 5. Primeiro deploy manual

```bash
cd /opt/esof2
GHCR_OWNER=SEU_USUARIO IMAGE_TAG=latest docker compose -f docker-compose.prod.yml pull
GHCR_OWNER=SEU_USUARIO IMAGE_TAG=latest docker compose -f docker-compose.prod.yml up -d
```

Verifique se os containers subiram:

```bash
docker compose -f docker-compose.prod.yml ps
docker logs esof2_auth
docker logs esof2_store
```

## 6. Adicionar entradas no Caddyfile

Siga as instruções em [README.md](README.md#caddyfile--entradas-a-adicionar) e recarregue o Caddy.

## 7. Configurar o usuário de deploy no GitHub Actions

O workflow faz SSH na VPS usando a chave `VPS_SSH_KEY`. Gere uma chave dedicada:

```bash
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/deploy_esof2
cat ~/.ssh/deploy_esof2.pub >> ~/.ssh/authorized_keys
```

A chave privada (`~/.ssh/deploy_esof2`) vai para o secret `VPS_SSH_KEY` no GitHub.

## Atualização manual (bypass do CI)

```bash
cd /opt/esof2
git pull origin master
GHCR_OWNER=SEU_USUARIO IMAGE_TAG=latest docker compose -f docker-compose.prod.yml pull
GHCR_OWNER=SEU_USUARIO IMAGE_TAG=latest docker compose -f docker-compose.prod.yml up -d --remove-orphans
```
