# 12 — Webapp: conectar autenticação à API (login, registro, /me)

**Serviço:** webapp  
**Responsável:**  
**Data limite:**  

## Descrição

O webapp já tem a página de login completamente estilizada (`/login`) e a página inicial com design system. O que falta é conectar a UI à API real: submeter o formulário de login, armazenar token, criar a página de registro e proteger rotas que exigem autenticação.

## O que implementar

### 1. Composable `useAuth`

Criar `app/composables/useAuth.ts` — estado global de autenticação:

```ts
export const useAuth = () => {
  const user = useState<User | null>('auth.user', () => null)
  const token = useState<string | null>('auth.token', () => null)

  async function login(email: string, password: string) {
    const data = await $fetch('/api/auth/login', {
      method: 'POST',
      body: { email, password },
    })
    token.value = data.access_token
    user.value = await $fetch('/api/users/me', {
      headers: { Authorization: `Bearer ${token.value}` },
    })
    navigateTo('/')
  }

  async function register(name: string, email: string, password: string) {
    await $fetch('/api/users', { method: 'POST', body: { name, email, password } })
    await login(email, password)
  }

  async function logout() {
    await $fetch('/api/auth/logout', { method: 'POST' })
    token.value = null
    user.value = null
    navigateTo('/login')
  }

  return { user, token, login, logout, register }
}
```

### 2. Server routes BFF

Criar as rotas que proxiam para os microserviços:

```
server/api/auth/login.post.ts   → POST http://auth-service:3001/auth/login
server/api/auth/logout.post.ts  → POST http://auth-service:3001/auth/logout
server/api/users/index.post.ts  → POST http://user-service:3002/users
server/api/users/me.get.ts      → GET  http://user-service:3002/users/me (repassa Authorization)
```

Exemplo:
```ts
// server/api/auth/login.post.ts
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  return $fetch(`${process.env.AUTH_SERVICE_URL}/auth/login`, {
    method: 'POST',
    body,
  })
})
```

Adicionar ao `nuxt.config.ts`:
```ts
runtimeConfig: {
  authServiceUrl: process.env.AUTH_SERVICE_URL || 'http://auth-service:3001',
  userServiceUrl: process.env.USER_SERVICE_URL || 'http://user-service:3002',
}
```

### 3. Conectar a página `/login`

Editar `app/pages/login.vue` — o form já existe, basta adicionar o `v-model` e o handler:

```ts
const { login } = useAuth()
const email = ref('')
const password = ref('')
const error = ref('')

async function handleSubmit() {
  try {
    await login(email.value, password.value)
  } catch {
    error.value = 'Credenciais inválidas'
  }
}
```

Conectar o `OInput` com `v-model` e o form com `@submit.prevent="handleSubmit"`.

### 4. Criar página `/register`

Criar `app/pages/register.vue` — mesma estrutura visual do login com campos nome + email + senha. O link "Criar conta" já existe no `/login` apontando para `/register`.

### 5. Middleware de rota protegida

Criar `app/middleware/auth.ts`:
```ts
export default defineNuxtRouteMiddleware(() => {
  const { user } = useAuth()
  if (!user.value) return navigateTo('/login')
})
```

Usar em páginas protegidas:
```ts
definePageMeta({ middleware: 'auth' })
```

## Acceptance criteria

- [ ] Formulário de login faz POST real ao auth-service e armazena token
- [ ] Usuário logado é redirecionado de `/login` para `/`
- [ ] Página `/register` criada e funcional — cria usuário e faz login automático
- [ ] Token é repassado nas chamadas subsequentes
- [ ] Rota protegida redireciona para `/login` se não autenticado
- [ ] Header do layout exibe nome do usuário quando logado e botão "Entrar" quando não
