<template>
  <div class="o-metric-card">
    <span class="o-metric-card__value">{{ value }}</span>
    <span class="o-metric-card__label text-label text-muted">{{ label }}</span>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  value: string | number
  label: string
}>()
</script>

<style scoped>
.o-metric-card {
  background: var(--color-linen);
  border-radius: var(--radius-md);
  padding: 14px var(--space-4);
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.o-metric-card__value {
  font-size: 22px;
  font-weight: var(--weight-medium);
  color: var(--color-gold);
}

.o-metric-card__label {
  letter-spacing: 0.04em;
}
</style>
