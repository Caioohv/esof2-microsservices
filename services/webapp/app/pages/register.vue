<template>
  <div class="register-page">
    <div class="register-card">

      <div class="register-card__header">
        <NuxtLink to="/" class="register-card__logo">
          <span class="register-card__logo-mark" aria-hidden="true">▲</span>
          Olimpo
        </NuxtLink>
        <h1 class="register-card__title">Criar conta</h1>
        <p class="register-card__sub">Cadastre-se para acessar a plataforma.</p>
      </div>

      <form class="register-card__form" @submit.prevent="onSubmit">
        <OInput
          id="email"
          v-model="email"
          label="E-mail"
          type="email"
          placeholder="seu@email.com"
          autocomplete="email"
        />
        <OInput
          id="password"
          v-model="password"
          label="Senha"
          type="password"
          placeholder="••••••••"
          autocomplete="new-password"
        />
        <OInput
          id="confirm"
          v-model="confirm"
          label="Confirmar senha"
          type="password"
          placeholder="••••••••"
          autocomplete="new-password"
        />

        <div class="register-card__roles" role="group" aria-label="Tipo de conta">
          <span class="register-card__roles-label">Tipo de conta</span>
          <div class="register-card__roles-options">
            <button
              v-for="r in roles"
              :key="r.value"
              type="button"
              :class="['register-card__role', { 'register-card__role--active': role === r.value }]"
              @click="role = r.value"
            >
              {{ r.label }}
            </button>
          </div>
        </div>

        <p v-if="error" class="register-card__error" role="alert">{{ error }}</p>
        <p v-if="success" class="register-card__success" role="status">{{ success }}</p>

        <OButton variant="primary" :full="true" type="submit" :disabled="loading">
          {{ loading ? 'Criando…' : 'Criar conta' }}
        </OButton>
      </form>

      <p class="register-card__login">
        Já tem uma conta?
        <NuxtLink to="/login" class="register-card__link">Entrar</NuxtLink>
      </p>

    </div>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({ title: 'Criar conta — Olimpo' })

const config = useRuntimeConfig()
const router = useRouter()

const roles = [
  { value: 'CLIENTE', label: 'Cliente' },
  { value: 'LOJISTA', label: 'Lojista' },
]

const email = ref('')
const password = ref('')
const confirm = ref('')
const role = ref('CLIENTE')
const loading = ref(false)
const error = ref('')
const success = ref('')

function logEvent(event: string, level: string, data: Record<string, unknown>) {
  $fetch('/api/events', { method: 'POST', body: { event, level, data } }).catch(() => {})
}

async function onSubmit() {
  error.value = ''
  success.value = ''

  if (!email.value || !password.value) {
    logEvent('client_validation_error', 'warn', { page: 'register', reason: 'missing_fields' })
    error.value = 'Preencha e-mail e senha.'
    return
  }
  if (password.value.length < 8) {
    logEvent('client_validation_error', 'warn', { page: 'register', reason: 'password_too_short' })
    error.value = 'A senha deve ter ao menos 8 caracteres.'
    return
  }
  if (password.value !== confirm.value) {
    logEvent('client_validation_error', 'warn', { page: 'register', reason: 'password_mismatch' })
    error.value = 'As senhas não conferem.'
    return
  }

  loading.value = true
  try {
    await $fetch(`${config.public.authApiBase}/register`, {
      method: 'POST',
      body: { email: email.value, password: password.value, role: role.value },
    })
    logEvent('register_success', 'info', { email: email.value, role: role.value })
    success.value = 'Conta criada! Redirecionando para o login…'
    setTimeout(() => router.push('/login'), 1200)
  } catch (err: any) {
    const reason = err?.data?.error ?? 'unknown'
    logEvent('register_failure', 'warn', { email: email.value, role: role.value, reason })
    error.value = reason || 'Não foi possível criar a conta. Tente novamente.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register-page {
  min-height: 100svh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: calc(64px + var(--space-6)) var(--space-6) var(--space-6);
  background-color: var(--color-noir);
  background-image:
    linear-gradient(rgba(196, 168, 98, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(196, 168, 98, 0.04) 1px, transparent 1px);
  background-size: 60px 60px;
}

.register-card {
  width: 100%;
  max-width: 420px;
  background: #fff;
  border: var(--border-default);
  border-radius: var(--radius-xl);
  padding: var(--space-10);
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.register-card__header {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.register-card__logo {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  font-size: 16px;
  font-weight: var(--weight-medium);
  color: var(--color-ink);
  margin-bottom: var(--space-2);
}

.register-card__logo-mark {
  color: var(--color-gold);
}

.register-card__title {
  font-size: var(--text-h2);
  font-weight: var(--weight-medium);
  color: var(--color-ink);
}

.register-card__sub {
  font-size: 14px;
  color: var(--color-mist);
}

.register-card__form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.register-card__roles {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.register-card__roles-label {
  font-size: var(--text-label);
  font-weight: var(--weight-medium);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-driftwood);
}

.register-card__roles-options {
  display: flex;
  gap: var(--space-2);
}

.register-card__role {
  flex: 1;
  height: 40px;
  border: 0.5px solid var(--color-sand);
  border-radius: var(--radius-md);
  background: #fff;
  font-size: 14px;
  font-weight: var(--weight-medium);
  color: var(--color-ash);
  cursor: pointer;
  transition: border-color var(--transition-base), color var(--transition-base);
}

.register-card__role--active {
  border-color: var(--color-gold);
  color: var(--color-gold);
}

.register-card__error {
  font-size: 13px;
  color: var(--color-error);
}

.register-card__success {
  font-size: 13px;
  color: var(--color-gold);
}

.register-card__login {
  font-size: 13px;
  color: var(--color-mist);
  text-align: center;
}

.register-card__link {
  font-size: 13px;
  color: var(--color-gold);
  font-weight: var(--weight-medium);
  transition: opacity var(--transition-base);
}

.register-card__link:hover { opacity: 0.75; }
</style>
