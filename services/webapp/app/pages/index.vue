<template>
  <div>
    <!-- Hero -->
    <section class="hero">
      <div class="container hero__inner">
        <p class="text-label text-muted hero__overline">Plataforma premium de ativos</p>
        <h1 class="text-display hero__title">Ativos que poucos<br>alcançam.</h1>
        <p class="hero__sub">Automóveis, imóveis e outros ativos de alto padrão — curados para quem busca o excepcional.</p>
        <div class="hero__cta">
          <OButton variant="primary" tag="a" href="/listing">Explorar ativos</OButton>
          <OButton variant="secondary" tag="a" href="/about">Sobre a Olimpo</OButton>
        </div>
      </div>
    </section>

    <!-- Metrics -->
    <section class="metrics">
      <div class="container metrics__grid">
        <OMetricCard value="340+" label="Ativos disponíveis" />
        <OMetricCard value="12" label="Parceiros exclusivos" />
        <OMetricCard value="R$ 2B+" label="Em ativos listados" />
        <OMetricCard value="98%" label="Negociações concluídas" />
      </div>
    </section>

    <!-- Filter chips demo -->
    <section class="categories">
      <div class="container">
        <h2 class="text-h2 categories__title">Categorias</h2>
        <div class="categories__chips">
          <OChip
            v-for="cat in categories"
            :key="cat.value"
            :active="activeCategory === cat.value"
            @click="activeCategory = cat.value"
          >
            {{ cat.label }}
          </OChip>
        </div>
      </div>
    </section>

    <!-- Cards grid demo -->
    <section class="listing">
      <div class="container listing__grid">
        <OCard
          v-for="asset in filteredAssets"
          :key="asset.id"
          :title="asset.title"
          :specs="asset.specs"
          :price="asset.price"
          :category="asset.category"
          :category-label="asset.categoryLabel"
          @detail="() => {}"
          @save="() => {}"
        />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const activeCategory = ref<string>('all')

const categories = [
  { value: 'all', label: 'Todos' },
  { value: 'automovel', label: 'Automóveis' },
  { value: 'imovel', label: 'Imóveis' },
  { value: 'nautico', label: 'Náutico' },
  { value: 'aviacao', label: 'Aviação' },
]

const assets = [
  { id: 1, title: 'BMW M340i xDrive', specs: '2023 · 14.200 km · 374 cv', price: 'R$ 390.000', category: 'automovel' as const, categoryLabel: 'Automóvel' },
  { id: 2, title: 'Cobertura Duplex — Itaim Bibi', specs: '320 m² · 4 suítes · 4 vagas', price: 'R$ 4.800.000', category: 'imovel' as const, categoryLabel: 'Imóvel' },
  { id: 3, title: 'Porsche Cayenne Coupé', specs: '2024 · 8.000 km · 340 cv', price: 'R$ 680.000', category: 'automovel' as const, categoryLabel: 'Automóvel' },
  { id: 4, title: 'Lancha Phantom 303', specs: '2022 · 9,5 m · 300 hp', price: 'R$ 520.000', category: 'nautico' as const, categoryLabel: 'Náutico' },
  { id: 5, title: 'Penthouse — Jardins', specs: '480 m² · 5 suítes · terraço', price: 'R$ 9.200.000', category: 'imovel' as const, categoryLabel: 'Imóvel' },
  { id: 6, title: 'Cessna Citation CJ3+', specs: '2019 · 1.200 h totais', price: 'R$ 12.500.000', category: 'aviacao' as const, categoryLabel: 'Aviação' },
]

const filteredAssets = computed(() =>
  activeCategory.value === 'all'
    ? assets
    : assets.filter(a => a.category === activeCategory.value)
)
</script>

<style scoped>
/* Hero */
.hero {
  background: var(--color-noir);
  padding-block: var(--space-16);
  border-bottom: var(--border-default);
}

.hero__inner {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  max-width: 680px;
}

.hero__overline {
  letter-spacing: 0.1em;
}

.hero__title {
  color: var(--color-linen);
}

.hero__sub {
  font-size: var(--text-body-lg);
  color: var(--color-mist);
  line-height: var(--leading-normal);
}

.hero__cta {
  display: flex;
  gap: var(--space-3);
  flex-wrap: wrap;
}

/* Metrics */
.metrics {
  padding-block: var(--space-10);
  background: var(--color-noir);
  border-bottom: var(--border-default);
}

.metrics__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: var(--space-4);
}

/* Categories */
.categories {
  padding-block: var(--space-8);
}

.categories__title {
  margin-bottom: var(--space-5);
}

.categories__chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

/* Listing */
.listing {
  padding-bottom: var(--space-16);
}

.listing__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--space-5);
}
</style>
