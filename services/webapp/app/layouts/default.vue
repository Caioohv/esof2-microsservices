<template>
  <div class="layout">
    <header class="layout__header">
      <div class="container layout__header-inner">
        <NuxtLink to="/" class="layout__logo">
          <span class="layout__logo-symbol" aria-hidden="true">▲</span>
          <span class="layout__logo-name">Olimpo</span>
        </NuxtLink>

        <nav class="layout__nav" aria-label="Navegação principal">
          <NuxtLink to="/listing" class="layout__nav-link">Ativos</NuxtLink>
          <NuxtLink to="/about" class="layout__nav-link">Sobre</NuxtLink>
          <NuxtLink to="/contact" class="layout__nav-link">Contato</NuxtLink>
        </nav>
      </div>
    </header>

    <main class="layout__main">
      <slot />
    </main>

    <footer class="layout__footer">
      <div class="container layout__footer-inner">
        <span class="text-caption text-muted">© {{ year }} Olimpo — Ativos que poucos alcançam.</span>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
const year = new Date().getFullYear()
</script>

<style scoped>
.layout {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
}

.layout__header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--color-noir);
  border-bottom: var(--border-default);
}

.layout__header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
}

.layout__logo {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.layout__logo-symbol {
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

.layout__nav {
  display: flex;
  align-items: center;
  gap: var(--space-6);
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

.layout__main {
  flex: 1;
}

.layout__footer {
  border-top: var(--border-default);
  background: var(--color-noir);
}

.layout__footer-inner {
  height: 56px;
  display: flex;
  align-items: center;
}
</style>
