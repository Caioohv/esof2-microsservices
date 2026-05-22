<template>
  <component
    :is="tag"
    :class="['o-button', `o-button--${variant}`, { 'o-button--full': full }]"
    v-bind="$attrs"
  >
    <slot />
  </component>
</template>

<script setup lang="ts">
defineOptions({ inheritAttrs: false })

withDefaults(defineProps<{
  variant?: 'primary' | 'secondary' | 'ghost'
  tag?: string
  full?: boolean
}>(), {
  variant: 'primary',
  tag: 'button',
  full: false,
})
</script>

<style scoped>
.o-button {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: 10px 22px;
  border-radius: var(--radius-md);
  font-family: var(--font-sans);
  font-size: 14px;
  font-weight: var(--weight-medium);
  line-height: 1;
  transition: background var(--transition-fast), border-color var(--transition-base);
  white-space: nowrap;
}

.o-button--full {
  width: 100%;
  justify-content: center;
}

/* Primary */
.o-button--primary {
  background: var(--color-gold);
  color: var(--color-noir);
  border: none;
}
.o-button--primary:hover {
  background: #b89a55;
}

/* Secondary */
.o-button--secondary {
  background: transparent;
  color: var(--color-ink);
  border: var(--border-default);
}
.o-button--secondary:hover {
  border-color: var(--color-gold);
  color: var(--color-gold);
}

/* Ghost */
.o-button--ghost {
  background: transparent;
  color: var(--color-gold);
  border: none;
  padding-inline: 0;
}
.o-button--ghost:hover {
  opacity: 0.8;
}
</style>
