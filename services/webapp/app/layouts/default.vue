<template>
  <div class="layout">
    <header class="layout__header" :class="{ 'layout__header--scrolled': scrolled }">
      <div class="container layout__header-inner">

        <NuxtLink to="/" class="layout__logo" aria-label="Olimpo — página inicial">
          <span class="layout__logo-mark" aria-hidden="true">▲</span>
          <span class="layout__logo-name">Olimpo</span>
        </NuxtLink>

        <nav class="layout__nav" aria-label="Navegação principal">
          <NuxtLink to="/#categories" class="layout__nav-link">Categorias</NuxtLink>
          <NuxtLink to="/#listing"    class="layout__nav-link">Ativos</NuxtLink>
          <NuxtLink to="/#how"        class="layout__nav-link">Como funciona</NuxtLink>
          <NuxtLink to="/#partners"   class="layout__nav-link">Parceiros</NuxtLink>
        </nav>

        <div class="layout__actions">
          <OButton tag="a" href="/login" variant="primary">Acessar plataforma</OButton>
        </div>

      </div>
    </header>

    <main class="layout__main">
      <slot />
    </main>

    <footer class="layout__footer">
      <div class="container layout__footer-top">

        <div>
          <p class="layout__footer-logo">
            <span aria-hidden="true">▲</span> Olimpo
          </p>
          <p class="layout__footer-desc">
            Plataforma de vitrine para lojas high-ticket. Conectamos compradores sérios a ativos excepcionais.
          </p>
        </div>

        <nav aria-label="Plataforma">
          <p class="layout__footer-col-title">Plataforma</p>
          <ul class="layout__footer-links" role="list">
            <li><NuxtLink to="/#categories">Categorias</NuxtLink></li>
            <li><NuxtLink to="/#listing">Ativos</NuxtLink></li>
            <li><NuxtLink to="/#how">Como funciona</NuxtLink></li>
            <li><NuxtLink to="/#partners">Parceiros</NuxtLink></li>
          </ul>
        </nav>

        <nav aria-label="Categorias">
          <p class="layout__footer-col-title">Categorias</p>
          <ul class="layout__footer-links" role="list">
            <li><a href="#">Automóveis</a></li>
            <li><a href="#">Imóveis</a></li>
            <li><a href="#">Náutico</a></li>
            <li><a href="#">Aviação</a></li>
          </ul>
        </nav>

        <nav aria-label="Empresa">
          <p class="layout__footer-col-title">Empresa</p>
          <ul class="layout__footer-links" role="list">
            <li><a href="#">Sobre</a></li>
            <li><a href="#">Seja parceiro</a></li>
            <li><a href="#">Contato</a></li>
            <li><a href="#">Privacidade</a></li>
          </ul>
        </nav>

      </div>

      <div class="container layout__footer-bottom">
        <span class="layout__footer-copy">© {{ year }} Olimpo. Todos os direitos reservados.</span>
        <span class="layout__footer-tagline">Ativos que poucos alcançam.</span>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
const year = new Date().getFullYear()
const scrolled = ref(false)

onMounted(() => {
  const handler = () => { scrolled.value = window.scrollY > 16 }
  window.addEventListener('scroll', handler, { passive: true })
  onUnmounted(() => window.removeEventListener('scroll', handler))
})
</script>

<style scoped>
.layout {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
}

/* ── Header ─────────────────────────────────────────────────────── */
.layout__header {
  position: fixed;
  inset-block-start: 0;
  inset-inline: 0;
  z-index: 100;
  height: 64px;
  background: transparent;
  border-bottom: 0.5px solid transparent;
  transition:
    background var(--transition-base),
    border-color var(--transition-base),
    backdrop-filter var(--transition-base);
}

.layout__header--scrolled {
  background: rgba(14, 18, 25, 0.85);
  border-color: rgba(224, 216, 204, 0.2);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.layout__header-inner {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-6);
}

/* Logo */
.layout__logo {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-shrink: 0;
}

.layout__logo-mark {
  color: var(--color-gold);
  font-size: 18px;
  line-height: 1;
}

.layout__logo-name {
  font-size: var(--text-h3);
  font-weight: var(--weight-medium);
  color: var(--color-linen);
  letter-spacing: 0.04em;
}

/* Nav */
.layout__nav {
  display: none;
  align-items: center;
  gap: var(--space-6);
}

@media (min-width: 900px) {
  .layout__nav { display: flex; }
}

.layout__nav-link {
  font-size: 14px;
  font-weight: var(--weight-medium);
  color: var(--color-mist);
  transition: color var(--transition-base);
}

.layout__nav-link:hover,
.layout__nav-link.router-link-active {
  color: var(--color-linen);
}

/* Actions */
.layout__actions {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  flex-shrink: 0;
}

.layout__login-link {
  font-size: 14px;
  font-weight: var(--weight-medium);
  color: var(--color-mist);
  transition: color var(--transition-base);
  display: none;
}

.layout__login-link:hover { color: var(--color-linen); }

@media (min-width: 640px) {
  .layout__login-link { display: inline; }
}

/* ── Main: sem padding-top — hero e páginas gerenciam o próprio offset ── */
.layout__main {
  flex: 1;
}

/* ── Footer ─────────────────────────────────────────────────────── */
.layout__footer {
  background: var(--color-noir);
  border-top: 0.5px solid rgba(224, 216, 204, 0.15);
}

.layout__footer-top {
  display: grid;
  gap: 40px;
  padding-block: 48px 40px;
}

@media (min-width: 768px) {
  .layout__footer-top { grid-template-columns: 1.5fr 1fr 1fr 1fr; }
}

.layout__footer-logo {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: 18px;
  font-weight: var(--weight-medium);
  color: var(--color-linen);
  margin-bottom: var(--space-3);
}

.layout__footer-logo span { color: var(--color-gold); }

.layout__footer-desc {
  font-size: 13px;
  color: var(--color-mist);
  line-height: 1.65;
  max-width: 240px;
}

.layout__footer-col-title {
  font-size: 11px;
  font-weight: var(--weight-medium);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-gold);
  margin-bottom: var(--space-4);
}

.layout__footer-links {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.layout__footer-links a {
  font-size: 13px;
  color: var(--color-mist);
  transition: color var(--transition-base);
}

.layout__footer-links a:hover { color: var(--color-linen); }

.layout__footer-bottom {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  align-items: center;
  justify-content: space-between;
  padding-block: 20px 28px;
  border-top: 0.5px solid rgba(224, 216, 204, 0.1);
}

.layout__footer-copy    { font-size: 12px; color: var(--color-mist); }
.layout__footer-tagline { font-size: 12px; color: var(--color-mist); font-style: italic; }
</style>
