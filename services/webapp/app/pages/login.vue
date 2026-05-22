<template>
  <div class="login-page">
    <div class="login-card">

      <div class="login-card__header">
        <NuxtLink to="/" class="login-card__logo">
          <span class="login-card__logo-mark" aria-hidden="true">▲</span>
          Olimpo
        </NuxtLink>
        <h1 class="login-card__title">Acessar a plataforma</h1>
        <p class="login-card__sub">Entre com suas credenciais para continuar.</p>
      </div>

      <form class="login-card__form" @submit.prevent>
        <OInput id="email"    label="E-mail" type="email"    placeholder="seu@email.com" />
        <OInput id="password" label="Senha"  type="password" placeholder="••••••••"      />

        <div class="login-card__forgot">
          <a href="#" class="login-card__link">Esqueci minha senha</a>
        </div>

        <OButton variant="primary" :full="true" type="submit">Entrar</OButton>
      </form>

      <p class="login-card__register">
        Não tem uma conta?
        <NuxtLink to="/register" class="login-card__link">Criar conta</NuxtLink>
      </p>

    </div>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({ title: 'Entrar — Olimpo' })
</script>

<style scoped>
.login-page {
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

.login-card {
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

.login-card__header {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.login-card__logo {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  font-size: 16px;
  font-weight: var(--weight-medium);
  color: var(--color-ink);
  margin-bottom: var(--space-2);
}

.login-card__logo-mark {
  color: var(--color-gold);
}

.login-card__title {
  font-size: var(--text-h2);
  font-weight: var(--weight-medium);
  color: var(--color-ink);
}

.login-card__sub {
  font-size: 14px;
  color: var(--color-mist);
}

.login-card__form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.login-card__forgot {
  display: flex;
  justify-content: flex-end;
  margin-top: calc(-1 * var(--space-2));
}

.login-card__link {
  font-size: 13px;
  color: var(--color-gold);
  font-weight: var(--weight-medium);
  transition: opacity var(--transition-base);
}

.login-card__link:hover { opacity: 0.75; }

.login-card__register {
  font-size: 13px;
  color: var(--color-mist);
  text-align: center;
}
</style>
