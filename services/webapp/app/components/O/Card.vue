<template>
  <article class="o-card">
    <div class="o-card__image">
      <NuxtImg
        v-if="image"
        :src="image"
        :alt="imageAlt"
        class="o-card__img"
        width="400"
        height="200"
      />
      <div v-else class="o-card__img-placeholder" aria-hidden="true" />
      <OBadge v-if="category" :category="category" class="o-card__badge">
        {{ categoryLabel }}
      </OBadge>
    </div>

    <div class="o-card__body">
      <h3 class="o-card__title">{{ title }}</h3>
      <p v-if="specs" class="o-card__specs text-caption">{{ specs }}</p>

      <div class="o-card__price-block">
        <span class="o-card__price-label">Valor</span>
        <span class="o-card__price">{{ price }}</span>
      </div>

      <div class="o-card__actions">
        <OButton variant="primary" @click="$emit('detail')">Ver detalhes</OButton>
        <OButton variant="secondary" @click="$emit('save')">Salvar</OButton>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  specs?: string
  price: string
  image?: string
  imageAlt?: string
  category?: 'automovel' | 'imovel' | 'nautico' | 'aviacao'
  categoryLabel?: string
}>()

defineEmits<{ detail: []; save: [] }>()
</script>

<style scoped>
.o-card {
  background: #ffffff;
  border: 0.5px solid var(--color-sand);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: border-color var(--transition-base);
}

.o-card:hover {
  border-color: var(--color-gold);
}

/* Image area */
.o-card__image {
  position: relative;
  height: 200px;
  background: var(--color-slate);
}

.o-card__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.o-card__img-placeholder {
  width: 100%;
  height: 100%;
  background: var(--color-slate);
}

.o-card__badge {
  position: absolute;
  top: var(--space-3);
  left: var(--space-3);
}

/* Body */
.o-card__body {
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.o-card__title {
  font-size: var(--text-h3);
  font-weight: var(--weight-medium);
  color: var(--color-ink);
  line-height: 1.3;
}

.o-card__specs {
  font-size: var(--text-caption);
  color: var(--color-driftwood);
}

.o-card__price-label {
  font-size: var(--text-label);
  font-weight: var(--weight-medium);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-mist);
}

.o-card__price-block {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.o-card__price {
  font-size: 20px;
  font-weight: var(--weight-medium);
  color: var(--color-ink);
}

.o-card__actions {
  display: flex;
  gap: var(--space-2);
}
</style>
