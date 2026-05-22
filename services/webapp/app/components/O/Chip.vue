<template>
  <button
    type="button"
    :class="['o-chip', { 'o-chip--active': active }]"
    @click="$emit('click')"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
defineProps<{ active?: boolean }>()
defineEmits<{ click: [] }>()
</script>

<style scoped>
.o-chip {
  display: inline-flex;
  align-items: center;
  padding: 5px 14px;
  border-radius: var(--radius-full);
  font-family: var(--font-sans);
  font-size: var(--text-caption);
  font-weight: var(--weight-regular);
  background: transparent;
  color: var(--color-driftwood);
  border: 0.5px solid var(--color-sand);
  transition: border-color var(--transition-base), color var(--transition-base), background var(--transition-base);
}

.o-chip:hover {
  border-color: var(--color-gold);
  color: var(--color-gold);
}

.o-chip--active {
  background: var(--color-gold);
  color: var(--color-noir);
  border: none;
}

.o-chip--active:hover {
  background: #b89a55;
  color: var(--color-noir);
}
</style>
