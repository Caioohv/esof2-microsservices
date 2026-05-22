<template>
  <div class="o-input-wrapper">
    <label v-if="label" :for="id" class="o-input-label">{{ label }}</label>
    <input
      :id="id"
      v-bind="$attrs"
      :class="['o-input', { 'o-input--error': error }]"
      :value="modelValue"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
    <span v-if="error" class="o-input-error">{{ error }}</span>
  </div>
</template>

<script setup lang="ts">
defineOptions({ inheritAttrs: false })

withDefaults(defineProps<{
  id: string
  label?: string
  modelValue?: string
  error?: string
}>(), {
  modelValue: '',
})

defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<style scoped>
.o-input-wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.o-input-label {
  font-size: var(--text-label);
  font-weight: var(--weight-medium);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-driftwood);
}

.o-input {
  height: 40px;
  padding: 9px 13px;
  border: 0.5px solid var(--color-sand);
  border-radius: var(--radius-md);
  font-family: var(--font-sans);
  font-size: 14px;
  background: #ffffff;
  color: var(--color-ink);
  transition: border-color var(--transition-base);
}

.o-input:focus {
  outline: none;
  border-color: var(--color-gold);
}

.o-input--error {
  border-color: var(--color-error);
}

.o-input-error {
  font-size: var(--text-caption);
  color: var(--color-error);
}
</style>
