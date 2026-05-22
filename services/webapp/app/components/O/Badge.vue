<template>
  <span :class="['o-badge', `o-badge--${category}`]">
    <slot />
  </span>
</template>

<script setup lang="ts">
defineProps<{
  category: 'automovel' | 'imovel' | 'nautico' | 'aviacao'
}>()
</script>

<style scoped>
.o-badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: var(--radius-full);
  font-size: 10px;
  font-weight: var(--weight-medium);
  letter-spacing: 0.07em;
  text-transform: uppercase;
}

.o-badge--automovel {
  background: #1E2430;
  color: #8A9BB8;
}

.o-badge--imovel {
  background: #1A2219;
  color: #7A9B72;
}

.o-badge--nautico {
  background: #0F1E24;
  color: #6A9BAA;
}

.o-badge--aviacao {
  background: #1E1A2A;
  color: #9B8AB8;
}
</style>
