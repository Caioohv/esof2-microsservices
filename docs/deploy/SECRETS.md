# GitHub Secrets

Configure em **Settings → Secrets and variables → Actions** do repositório.

| Secret | Descrição | Como obter |
|---|---|---|
| `VPS_HOST` | IP ou hostname da VPS | Painel do provedor |
| `VPS_USER` | Usuário SSH (ex: `root`, `ubuntu`) | Painel do provedor |
| `VPS_SSH_PORT` | Porta SSH da VPS (padrão 22, aqui **22333**) | Painel do provedor |
| `VPS_SSH_KEY` | Chave privada SSH para o deploy | `cat ~/.ssh/deploy_esof2` (veja VPS.md passo 7) |
| `VPS_DEPLOY_PATH` | Caminho do repo na VPS (ex: `/opt/esof2`) | Onde você clonou o repo |
| `GHCR_TOKEN` | PAT com escopo `read:packages` | GitHub → Settings → Developer settings → Personal access tokens |

## Criar o GHCR_TOKEN (PAT)

1. GitHub → **Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)** 
2. **Generate new token (classic)**
3. Escopo mínimo: `read:packages`
4. Copie e salve como secret `GHCR_TOKEN`

> O `GITHUB_TOKEN` gerado automaticamente pelo Actions tem permissão `write:packages` para push de imagens — não precisa de secret extra para o build.

## Tornar os pacotes públicos (alternativa ao PAT)

Se o repositório for público, você pode tornar os packages do GHCR públicos também:

1. Acesse `https://github.com/users/SEU_USUARIO/packages`
2. Selecione o package → **Package settings** → **Change visibility** → Public

Com packages públicos, o `GHCR_TOKEN` e o `docker login` na VPS não são necessários.
