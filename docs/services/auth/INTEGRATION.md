# Auth Service - Guia de Integração

Instruções para integrar o Auth Service em outros microserviços.

## Índice

1. [Overview](#overview)
2. [Setup Inicial](#setup-inicial)
3. [Integração no Frontend](#integração-no-frontend)
4. [Integração em Serviços Backend](#integração-em-serviços-backend)
5. [Middleware de Autenticação](#middleware-de-autenticação)
6. [Tratamento de Erros](#tratamento-de-erros)
7. [Boas Práticas](#boas-práticas)
8. [Troubleshooting](#troubleshooting)

---

## Overview

O Auth Service fornece autenticação baseada em JWT com dois níveis de tokens:

- **Access Token**: De curta duração (15 min), usado para autenticar requisições
- **Refresh Token**: De longa duração (7 dias), usado para renovar access tokens

```
┌──────────────┐
│ Cliente/     │
│ Serviço      │
└──────┬───────┘
       │
       ├─ POST /login → Recebe access_token + refresh_token
       │
       ├─ POST /verify (com access_token) → Valida o token
       │
       └─ POST /refresh (com refresh_token) → Renova access_token
```

---

## Setup Inicial

### 1. Verificar Conectividade

Confirme que o Auth Service está rodando:

```bash
curl http://localhost:3001/verify
# Deve retornar erro 401 (esperado, sem token)
```

### 2. Variáveis de Ambiente

Adicione ao seu `.env`:

```
AUTH_SERVICE_URL=http://localhost:3001
# ou em produção:
AUTH_SERVICE_URL=https://auth.seu-dominio.com
```

### 3. Dependências

Se integrar em um serviço Node.js:

```bash
npm install axios jwt-decode
```

---

## Integração no Frontend

### Configuração Básica

```javascript
// auth.service.js
const AUTH_SERVICE_URL = process.env.REACT_APP_AUTH_SERVICE_URL || 'http://localhost:3001';

const authService = {
  // Login
  async login(email, password) {
    const response = await fetch(`${AUTH_SERVICE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const { access_token, refresh_token } = await response.json();
    
    // Armazenar tokens
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('refresh_token', refresh_token);
    
    return { access_token, refresh_token };
  },

  // Obter access token
  getAccessToken() {
    return localStorage.getItem('access_token');
  },

  // Verificar se está autenticado
  isAuthenticated() {
    return !!this.getAccessToken();
  },

  // Logout
  async logout() {
    const refreshToken = localStorage.getItem('refresh_token');
    
    if (refreshToken) {
      await fetch(`${AUTH_SERVICE_URL}/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken })
      });
    }

    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },

  // Renovar token
  async refreshAccessToken() {
    const refreshToken = localStorage.getItem('refresh_token');
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch(`${AUTH_SERVICE_URL}/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken })
    });

    if (!response.ok) {
      this.logout();
      throw new Error('Token refresh failed');
    }

    const { access_token } = await response.json();
    localStorage.setItem('access_token', access_token);
    return access_token;
  }
};

export default authService;
```

### React Hook para Autenticação

```javascript
// useAuth.js
import { useEffect, useState } from 'react';
import authService from './auth.service';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = authService.getAccessToken();
      
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // Verificar token com o backend
        const response = await fetch(`${AUTH_SERVICE_URL}/verify`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const { user } = await response.json();
          setUser(user);
        } else {
          // Token expirou, tentar renovar
          try {
            await authService.refreshAccessToken();
            const response = await fetch(`${AUTH_SERVICE_URL}/verify`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${authService.getAccessToken()}`
              }
            });
            const { user } = await response.json();
            setUser(user);
          } catch {
            authService.logout();
          }
        }
      } catch (err) {
        console.error('Auth check failed:', err);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  return { user, loading, isAuthenticated: !!user };
}
```

### Interceptador de Requisições (Axios)

```javascript
// axiosClient.js
import axios from 'axios';
import authService from './auth.service';

const axiosClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000'
});

// Request interceptor - adicionar token a todas as requisições
axiosClient.interceptors.request.use(
  config => {
    const token = authService.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Response interceptor - renovar token se expirou
axiosClient.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        await authService.refreshAccessToken();
        const token = authService.getAccessToken();
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return axiosClient(originalRequest);
      } catch (refreshError) {
        authService.logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
```

### Componente de Login

```javascript
// LoginForm.js
import { useState } from 'react';
import authService from './auth.service';

export function LoginForm({ onSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authService.login(email, password);
      onSuccess?.();
    } catch (err) {
      setError('Email ou senha incorretos');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        placeholder="Senha"
        required
      />
      {error && <p className="error">{error}</p>}
      <button type="submit" disabled={loading}>
        {loading ? 'Entrando...' : 'Entrar'}
      </button>
    </form>
  );
}
```

---

## Integração em Serviços Backend

### Node.js/Express

```javascript
// authMiddleware.js
const axios = require('axios');

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';

async function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'token required' });
  }

  try {
    const response = await axios.post(
      `${AUTH_SERVICE_URL}/verify`,
      {},
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );

    // Adicionar informações do usuário ao request
    req.user = response.data.user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'invalid or expired token' });
  }
}

module.exports = authMiddleware;
```

### Uso em Rotas Protegidas

```javascript
// userRoutes.js
const express = require('express');
const authMiddleware = require('./authMiddleware');

const router = express.Router();

// Rota protegida
router.get('/profile', authMiddleware, (req, res) => {
  res.json({
    message: 'Perfil do usuário',
    user: req.user
  });
});

// Rota publica
router.get('/public-data', (req, res) => {
  res.json({ message: 'Dados públicos' });
});

module.exports = router;
```

### Verificação Manual de Token

```javascript
const axios = require('axios');

async function verifyToken(token) {
  try {
    const response = await axios.post(
      `${process.env.AUTH_SERVICE_URL}/verify`,
      {},
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );
    return response.data;
  } catch (error) {
    throw new Error('Token verification failed');
  }
}
```

### Python/Flask

```python
# auth_middleware.py
import requests
from functools import wraps
from flask import request, jsonify

AUTH_SERVICE_URL = os.getenv('AUTH_SERVICE_URL', 'http://localhost:3001')

def require_auth(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        
        if not auth_header:
            return jsonify({'error': 'token required'}), 401
        
        try:
            token = auth_header.split(' ')[1]
        except IndexError:
            return jsonify({'error': 'invalid authorization header'}), 401
        
        try:
            response = requests.post(
                f'{AUTH_SERVICE_URL}/verify',
                headers={'Authorization': f'Bearer {token}'}
            )
            response.raise_for_status()
            user = response.json()['user']
            request.user = user
        except requests.RequestException:
            return jsonify({'error': 'invalid or expired token'}), 401
        
        return f(*args, **kwargs)
    
    return decorated_function

# Usar em rotas
@app.route('/api/profile')
@require_auth
def get_profile():
    return jsonify({'user': request.user})
```

### Go

```go
// authMiddleware.go
package middleware

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strings"
)

type User struct {
	ID    string `json:"id"`
	Email string `json:"email"`
}

type VerifyResponse struct {
	Valid bool `json:"valid"`
	User  User `json:"user"`
}

func AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			http.Error(w, `{"error": "token required"}`, http.StatusUnauthorized)
			return
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			http.Error(w, `{"error": "invalid authorization header"}`, http.StatusUnauthorized)
			return
		}

		token := parts[1]
		authServiceURL := os.Getenv("AUTH_SERVICE_URL")
		if authServiceURL == "" {
			authServiceURL = "http://localhost:3001"
		}

		// Verificar token
		req, _ := http.NewRequest("POST", fmt.Sprintf("%s/verify", authServiceURL), nil)
		req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", token))

		client := &http.Client{}
		resp, err := client.Do(req)
		if err != nil || resp.StatusCode != http.StatusOK {
			http.Error(w, `{"error": "invalid or expired token"}`, http.StatusUnauthorized)
			return
		}

		var verifyResp VerifyResponse
		json.NewDecoder(resp.Body).Decode(&verifyResp)

		// Armazenar usuário no contexto (opcional)
		r.Header.Set("X-User-ID", verifyResp.User.ID)
		r.Header.Set("X-User-Email", verifyResp.User.Email)

		next.ServeHTTP(w, r)
	})
}
```

---

## Middleware de Autenticação

### Express.js - Middleware Completo

```javascript
// authenticate.js
const axios = require('axios');

const authenticate = async (req, res, next) => {
  try {
    const token = extractToken(req);
    
    if (!token) {
      return res.status(401).json({ error: 'no token provided' });
    }

    const user = await verifyToken(token);
    req.user = user;
    next();
  } catch (error) {
    // Tentar renovar se access token expirou
    const refreshToken = req.headers['x-refresh-token'];
    if (refreshToken) {
      try {
        const newToken = await refreshAccessToken(refreshToken);
        res.setHeader('X-New-Token', newToken);
        const user = await verifyToken(newToken);
        req.user = user;
        next();
      } catch {
        res.status(401).json({ error: 'token refresh failed' });
      }
    } else {
      res.status(401).json({ error: 'invalid token' });
    }
  }
};

function extractToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  
  const [scheme, token] = authHeader.split(' ');
  return scheme === 'Bearer' ? token : null;
}

async function verifyToken(token) {
  const response = await axios.post(
    `${process.env.AUTH_SERVICE_URL}/verify`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data.user;
}

async function refreshAccessToken(refreshToken) {
  const response = await axios.post(
    `${process.env.AUTH_SERVICE_URL}/refresh`,
    { refresh_token: refreshToken }
  );
  return response.data.access_token;
}

module.exports = authenticate;
```

### Middleware Opcional (Sem Erro)

```javascript
// optionalAuth.js
const optionalAuth = async (req, res, next) => {
  try {
    const token = extractToken(req);
    if (token) {
      const user = await verifyToken(token);
      req.user = user;
    }
  } catch {
    // Ignorar erros, usuario não autenticado
  }
  next();
};

module.exports = optionalAuth;
```

---

## Tratamento de Erros

### Códigos de Erro Comuns

```javascript
const AUTH_ERRORS = {
  INVALID_CREDENTIALS: 401,        // Email/senha incorretos
  TOKEN_EXPIRED: 401,              // Access token expirou
  INVALID_TOKEN: 401,              // Token inválido/corrompido
  TOKEN_REQUIRED: 401,             // Sem token no header
  REFRESH_REVOKED: 401,            // Refresh token revogado
  EMAIL_DUPLICATE: 409,            // Email já cadastrado
  MISSING_FIELDS: 400,             // Campo obrigatório faltando
  INTERNAL_ERROR: 500              // Erro do servidor
};
```

### Estratégia de Retry com Backoff

```javascript
async function makeAuthenticatedRequest(url, options = {}, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const token = authService.getAccessToken();
      const response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        return response;
      }

      if (response.status === 401 && i < retries - 1) {
        // Tentar renovar token
        try {
          await authService.refreshAccessToken();
          continue; // Repetir requisição
        } catch {
          authService.logout();
          throw new Error('Authentication failed');
        }
      }

      return response;
    } catch (error) {
      if (i === retries - 1) throw error;
      
      // Esperar antes de retry (backoff exponencial)
      await new Promise(resolve => 
        setTimeout(resolve, Math.pow(2, i) * 1000)
      );
    }
  }
}
```

---

## Boas Práticas

### Faça

1. **Armazenar tokens com cuidado**
   ```javascript
   // Bom: localStorage
   localStorage.setItem('access_token', token);
   
   // Melhor: sessionStorage (expires com a aba)
   sessionStorage.setItem('access_token', token);
   ```

2. **Renovar tokens antes de expirar**
   ```javascript
   // Bom: Verificar tempo restante
   function isTokenExpiringSoon(token) {
     const decoded = jwt_decode(token);
     const expiresIn = decoded.exp * 1000 - Date.now();
     return expiresIn < 60000; // 1 minuto
   }
   
   // Renovar se necessário
   if (isTokenExpiringSoon(token)) {
     await authService.refreshAccessToken();
   }
   ```

3. **Logout ao sair**
   ```javascript
   window.addEventListener('beforeunload', () => {
     authService.logout();
   });
   ```

### Evite

1. **Armazenar tokens em cookies sem flags de segurança**
   ```javascript
   // Ruim: Cookie sem proteção
   document.cookie = `token=${token}`;
   
   // Bom: Cookie seguro (se usar)
   // Configure no backend com httpOnly, Secure, SameSite
   ```

2. **Expor tokens em logs ou erro messages**
   ```javascript
   // Ruim
   console.log('Token:', token);
   alert(`Login failed: ${error.message}`);
   
   // Bom
   console.error('Authentication failed'); // sem detalhes
   showGenericError('Email ou senha incorretos');
   ```

3. **Confiar apenas no frontend para autorização**
   ```javascript
   // Ruim: Apenas verificar no frontend
   if (user.role === 'admin') { ... }
   
   // Bom: Sempre verificar no backend
   // Backend valida permissões com o token JWT
   ```

4. **Armazenar dados sensíveis no token**
   ```javascript
   // Ruim
   const payload = { user_id, email, password_hash, credit_card };
   
   // Bom
   const payload = { sub: user_id, email };
   // Dados sensíveis permanecem apenas no servidor
   ```

---

## Troubleshooting

### Token sempre expira rapidamente

**Problema**: Access token expira em 15 minutos
**Solução**: Use o `/refresh` endpoint para renovar antes da expiração

```javascript
// Renovar a cada 10 minutos
setInterval(async () => {
  try {
    await authService.refreshAccessToken();
  } catch {
    authService.logout();
  }
}, 10 * 60 * 1000);
```

### "Invalid credentials" mesmo com email/senha corretos

**Problema**: Credenciais não registradas
**Solução**: 

1. Verificar se usuário foi criado no User Service
2. Confirmar que o Auth Service foi chamado para registrar credenciais
3. Verificar se há mismatch entre os serviços (ex: casos diferentes)

```bash
# Debug: verificar diretamente no DB
mysql -u root -p auth_db
SELECT * FROM credentials WHERE email = 'seu-email@example.com';
```

### Refresh token inválido

**Problema**: Erro ao tentar renovar token
**Possíveis causas**:

1. Refresh token expirou (7 dias)
   → **Solução**: Fazer login novamente

2. Refresh token foi revogado (logout feito)
   → **Solução**: Fazer login novamente

3. Refresh token corrompido
   → **Solução**: Limpar storage e fazer login novamente

```javascript
// Debug
async function debugToken(refreshToken) {
  try {
    const response = await fetch('http://localhost:3001/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken })
    });
    
    console.log('Status:', response.status);
    console.log('Response:', await response.json());
  } catch (e) {
    console.error('Error:', e);
  }
}
```

### Erro CORS ao fazer requisições do frontend

**Problema**: "Access to XMLHttpRequest blocked by CORS policy"
**Solução**: Verificar se o Auth Service está configurado para aceitar requisições cross-origin

```javascript
// Auth Service precisa de CORS habilitado (pode adicionar)
const cors = require('cors');
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
```

### Token não é reconhecido por outro serviço

**Problema**: Outro serviço retorna "invalid token" mesmo com token válido
**Possíveis causas**:

1. JWT_SECRET diferente entre serviços
   → **Solução**: Usar a mesma chave secreta em todos os serviços

2. Serviço está usando chave de refresh em vez de access
   → **Solução**: Verificar qual secret está sendo usado

3. Token era de refresh, não access
   → **Solução**: Verificar qual tipo de token está sendo enviado

```javascript
// Verificar qual tipo é qual
const jwt = require('jsonwebtoken');

function inspectToken(token) {
  try {
    const decoded = jwt.decode(token, { complete: true });
    console.log('Header:', decoded.header);
    console.log('Payload:', decoded.payload);
    console.log('Type detected:', decoded.payload.iat && 'JWT');
  } catch {
    console.log('Token inválido');
  }
}
```

---

## Recursos Adicionais

- [JWT.io](https://jwt.io/) - Decodificar e entender JWTs
- [RFC 7519 - JWT](https://tools.ietf.org/html/rfc7519) - Especificação completa
- [OWASP - Authentication](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html) - Boas práticas de segurança
