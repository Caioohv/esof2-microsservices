# Auth Service — Implementação Completa

**Serviço:** auth-service  
**Responsável:** Caio Vieira  
**PR:** #3 (merged)  
**Status:** ✅ Concluído

## O que foi feito

Implementação completa do serviço de autenticação JWT, incluindo:

- `POST /auth/register` — registro de usuário com hash PBKDF2 (100k iterações + SHA-512)
- `POST /auth/login` — login com emissão de access token (15min) e refresh token (7 dias)
- `POST /auth/refresh` — renovação de tokens via refresh token
- `POST /auth/logout` — revogação de refresh token
- `POST /auth/verify` — endpoint interno para outros serviços validarem JWT sem compartilhar segredo

**Padrão técnico estabelecido:**
- Camadas: `routes → controller → business → repository`
- Testes unitários com `node:test` nativo (sem Jest), cobertura completa dos fluxos
- Prisma 7 + MySQL
- Dockerfile de produção (`npm ci --omit=dev`, imagem Alpine)
- Health check no docker-compose com `condition: service_healthy`
- Refresh tokens armazenados como hash SHA-256 (nunca em texto claro)
- Dois secrets JWT independentes (access e refresh)
