<template>
  <div>

    <!-- ── Hero ─────────────────────────────────────────────────── -->
    <section class="hero" aria-labelledby="hero-title">
      <div class="container hero__inner">
        <p class="hero__overline">Plataforma premium de ativos</p>

        <h1 class="hero__title" id="hero-title">
          Ativos que<br>
          <em>poucos alcançam.</em>
        </h1>

        <p class="hero__sub">
          Automóveis, imóveis e outros ativos de alto padrão — curados para quem busca o excepcional. A negociação começa aqui, mas se conclui pessoalmente.
        </p>

        <div class="hero__actions">
          <OButton tag="a" href="#listing" variant="primary">Explorar ativos</OButton>
          <OButton tag="a" href="#how"     variant="ghost">Como funciona →</OButton>
        </div>

        <div class="hero__stats" aria-label="Números da plataforma">
          <div v-for="stat in stats" :key="stat.label" class="hero__stat">
            <span class="hero__stat-value">{{ stat.value }}</span>
            <span class="hero__stat-label">{{ stat.label }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- ── Categorias ────────────────────────────────────────────── -->
    <section class="categories" id="categories" aria-labelledby="categories-title">
      <div class="container">
        <header class="section-header">
          <span class="section-label">O que você encontra</span>
          <h2 class="section-title" id="categories-title">Categorias disponíveis</h2>
        </header>

        <div class="categories__grid" role="list">
          <article
            v-for="cat in categories"
            :key="cat.id"
            class="cat-card"
            role="listitem"
            tabindex="0"
          >
            <div class="cat-card__icon" aria-hidden="true" v-html="cat.icon" />
            <div class="cat-card__info">
              <p class="cat-card__name">{{ cat.name }}</p>
              <p class="cat-card__count">{{ cat.count }} ativos disponíveis</p>
            </div>
            <p class="cat-card__arrow" aria-hidden="true">Ver todos →</p>
          </article>
        </div>
      </div>
    </section>

    <!-- ── Listagem ──────────────────────────────────────────────── -->
    <section class="listing" id="listing" aria-labelledby="listing-title">
      <div class="container">
        <header class="section-header">
          <span class="section-label">Destaque da semana</span>
          <h2 class="section-title" id="listing-title">Ativos selecionados</h2>
        </header>

        <div class="listing__filters" role="group" aria-label="Filtrar por categoria">
          <OChip
            v-for="f in filters"
            :key="f.value"
            :active="activeFilter === f.value"
            @click="activeFilter = f.value"
          >
            {{ f.label }}
          </OChip>
        </div>

        <div class="listing__grid">
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
      </div>
    </section>

    <!-- ── Como funciona ─────────────────────────────────────────── -->
    <section class="how" id="how" aria-labelledby="how-title">
      <div class="container">
        <header class="section-header">
          <span class="section-label">Processo</span>
          <h2 class="section-title" id="how-title">Como funciona</h2>
        </header>

        <div class="how__grid" role="list">
          <div
            v-for="step in steps"
            :key="step.number"
            class="how-step"
            role="listitem"
          >
            <div class="how-step__number" aria-hidden="true">{{ step.number }}</div>
            <div class="how-step__content">
              <h3 class="how-step__title">{{ step.title }}</h3>
              <p class="how-step__desc">{{ step.desc }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ── Parceiros ─────────────────────────────────────────────── -->
    <section class="partners" id="partners" aria-labelledby="partners-title">
      <div class="container">
        <header class="section-header">
          <span class="section-label">Quem expõe aqui</span>
          <h2 class="partners__title section-title" id="partners-title">Lojas parceiras</h2>
          <p class="partners__sub">Selecionamos apenas parceiros com histórico comprovado e ativos excepcionais.</p>
        </header>

        <div class="partners__grid" role="list">
          <article
            v-for="partner in partners"
            :key="partner.name"
            class="partner-card"
            role="listitem"
          >
            <p class="partner-card__logo">{{ partner.name }}</p>
            <p class="partner-card__type">{{ partner.type }}</p>
            <span class="partner-card__tag">{{ partner.location }}</span>
          </article>
        </div>
      </div>
    </section>

  </div>
</template>

<script setup lang="ts">
useSeoMeta({
  title: 'Olimpo — Ativos que poucos alcançam.',
  description: 'Plataforma de vitrine para lojas high-ticket: automóveis, imóveis e outros ativos excepcionais.',
})

const activeFilter = ref('all')

const stats = [
  { value: '340+',   label: 'Ativos disponíveis' },
  { value: '12',     label: 'Lojas parceiras' },
  { value: 'R$ 2B+', label: 'Em ativos listados' },
  { value: '98%',    label: 'Negociações concluídas' },
]

const iconCar  = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 17H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1l3-3h8l3 3h1a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-2"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="16.5" cy="17.5" r="2.5"/></svg>`
const iconHome = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`
const iconBoat = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 20h20M4 20V10l8-8 8 8v10"/><path d="M9 20v-5h6v5"/></svg>`
const iconPlane = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21 4 19 4c-1 0-1.5.5-1.5.5L14 8 5.8 6.2c-.5-.1-1 .1-1.3.5l-.8 1.3c-.3.5-.2 1 .2 1.4L8 12l-2 3H4l-1 2 3 1 1 3 2-1v-2l3-2 3.5 3.5c.3.4.9.5 1.4.2l1.3-.8c.4-.3.6-.8.5-1.2z"/></svg>`

const categories = [
  { id: 1, name: 'Automóveis', count: 148, icon: iconCar   },
  { id: 2, name: 'Imóveis',    count: 124, icon: iconHome  },
  { id: 3, name: 'Náutico',    count:  42, icon: iconBoat  },
  { id: 4, name: 'Aviação',    count:  26, icon: iconPlane },
]

const filters = [
  { value: 'all',       label: 'Todos'      },
  { value: 'automovel', label: 'Automóveis' },
  { value: 'imovel',    label: 'Imóveis'    },
  { value: 'nautico',   label: 'Náutico'    },
  { value: 'aviacao',   label: 'Aviação'    },
]

const assets = [
  { id: 1, title: 'BMW M340i xDrive',               specs: '2023 · 14.200 km · 374 cv · Branco Alpino',   price: 'R$ 390.000',   category: 'automovel' as const, categoryLabel: 'Automóvel' },
  { id: 2, title: 'Cobertura Duplex — Itaim Bibi',  specs: '320 m² · 4 suítes · 4 vagas · Vista 360°',   price: 'R$ 4.800.000', category: 'imovel'    as const, categoryLabel: 'Imóvel'    },
  { id: 3, title: 'Porsche Cayenne Coupé',           specs: '2024 · 8.000 km · 340 cv · Preto Sólido',   price: 'R$ 680.000',   category: 'automovel' as const, categoryLabel: 'Automóvel' },
  { id: 4, title: 'Penthouse — Jardins',             specs: '480 m² · 5 suítes · Terraço privativo',      price: 'R$ 9.200.000', category: 'imovel'    as const, categoryLabel: 'Imóvel'    },
  { id: 5, title: 'Mercedes-AMG GT 63 S',            specs: '2023 · 6.400 km · 630 cv · Prata Selenita', price: 'R$ 1.240.000', category: 'automovel' as const, categoryLabel: 'Automóvel' },
  { id: 6, title: 'Casa em Condomínio — Alphaville', specs: '620 m² · 6 suítes · Piscina · 8 vagas',     price: 'R$ 6.500.000', category: 'imovel'    as const, categoryLabel: 'Imóvel'    },
]

const filteredAssets = computed(() =>
  activeFilter.value === 'all'
    ? assets
    : assets.filter(a => a.category === activeFilter.value)
)

const steps = [
  {
    number: '01',
    title: 'Explore os ativos',
    desc: 'Navegue pelo catálogo curado de automóveis, imóveis e outros ativos de alto padrão. Filtre por categoria, faixa de valor ou especificações técnicas.',
  },
  {
    number: '02',
    title: 'Avalie presencialmente',
    desc: 'Encontrou algo de interesse? Agende uma visita ou avaliação presencial diretamente com o parceiro responsável pelo ativo.',
  },
  {
    number: '03',
    title: 'Conclua a negociação',
    desc: 'A negociação final acontece diretamente entre você e o parceiro. Sem intermediários, sem complicações — a Olimpo apenas conecta.',
  },
]

const partners = [
  { name: 'Verona Motors',           type: 'Automóveis de luxo',    location: 'São Paulo · SP'      },
  { name: 'Alto do Ipiranga Realty', type: 'Imóveis premium',       location: 'São Paulo · SP'      },
  { name: 'Riviera Náutica',         type: 'Embarcações',           location: 'Santos · SP'         },
  { name: 'Apex Aviation',           type: 'Aeronaves executivas',  location: 'Campinas · SP'       },
  { name: 'Giulia Automobili',       type: 'Automóveis de coleção', location: 'Curitiba · PR'       },
  { name: 'Mar Azul Imóveis',        type: 'Imóveis litorâneos',    location: 'Florianópolis · SC'  },
  { name: 'Montanha Verde Estates',  type: 'Fazendas e rurais',     location: 'Belo Horizonte · MG' },
  { name: 'Nordeste Premium',        type: 'Imóveis e veículos',    location: 'Recife · PE'         },
]
</script>

<style scoped>
/* ── Hero ───────────────────────────────────────────────────────── */
.hero {
  min-height: 100svh;
  background: var(--color-noir);
  display: flex;
  align-items: center;
  border-bottom: var(--border-default);
  position: relative;
  overflow: hidden;
}

.hero::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(196, 168, 98, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(196, 168, 98, 0.04) 1px, transparent 1px);
  background-size: 60px 60px;
  pointer-events: none;
}

.hero__inner {
  position: relative;
  max-width: 760px;
  padding-block: 120px 80px;
}

.hero__overline {
  font-size: var(--text-label);
  font-weight: var(--weight-medium);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-gold);
  margin-bottom: var(--space-6);
}

.hero__title {
  font-family: 'Playfair Display', serif;
  font-size: clamp(40px, 6vw, 72px);
  font-weight: var(--weight-medium);
  line-height: 1.08;
  color: var(--color-linen);
  margin-bottom: var(--space-6);
}

.hero__title em {
  font-style: italic;
  color: var(--color-gold);
}

.hero__sub {
  font-size: 17px;
  color: var(--color-mist);
  line-height: var(--leading-normal);
  max-width: 520px;
  margin-bottom: var(--space-10);
}

.hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  margin-bottom: var(--space-16);
}

.hero__stats {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-8);
  padding-top: var(--space-10);
  border-top: 0.5px solid rgba(224, 216, 204, 0.2);
}

.hero__stat-value {
  font-size: 22px;
  font-weight: var(--weight-medium);
  color: var(--color-gold);
  display: block;
}

.hero__stat-label {
  font-size: var(--text-label);
  font-weight: var(--weight-medium);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-mist);
}

/* ── Shared section styles ───────────────────────────────────────── */
.section-header {
  margin-bottom: var(--space-10);
}

.section-label {
  display: block;
  font-size: var(--text-label);
  font-weight: var(--weight-medium);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-gold);
  margin-bottom: 10px;
}

.section-title {
  font-size: 32px;
  font-weight: var(--weight-medium);
  color: var(--color-ink);
  line-height: 1.2;
}

/* ── Categorias ─────────────────────────────────────────────────── */
.categories {
  padding-block: var(--space-16);
  background: var(--color-linen);
  border-bottom: var(--border-default);
}

.categories__grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-4);
}

@media (min-width: 768px) {
  .categories__grid { grid-template-columns: repeat(4, 1fr); }
}

.cat-card {
  background: #fff;
  border: var(--border-default);
  border-radius: var(--radius-lg);
  padding: 28px var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  transition: border-color var(--transition-base);
  cursor: pointer;
}

.cat-card:hover { border-color: var(--color-gold); }

.cat-card__icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  background: var(--color-linen);
  color: var(--color-gold);
}

.cat-card__icon :deep(svg) {
  width: 20px;
  height: 20px;
}

.cat-card__name  { font-size: 16px; font-weight: var(--weight-medium); color: var(--color-ink); }
.cat-card__count { font-size: 12px; color: var(--color-mist); }
.cat-card__arrow { margin-top: auto; font-size: 13px; color: var(--color-gold); font-weight: var(--weight-medium); }

/* ── Listagem ───────────────────────────────────────────────────── */
.listing {
  padding-block: var(--space-16);
  background: var(--color-linen);
  border-bottom: var(--border-default);
}

.listing__filters {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-bottom: var(--space-10);
}

.listing__grid {
  display: grid;
  gap: var(--space-5);
  grid-template-columns: 1fr;
}

@media (min-width: 640px) {
  .listing__grid { grid-template-columns: repeat(2, 1fr); }
}

@media (min-width: 1024px) {
  .listing__grid { grid-template-columns: repeat(3, 1fr); }
}

/* ── Como funciona ──────────────────────────────────────────────── */
.how {
  padding-block: var(--space-16);
  background: #fff;
  border-bottom: var(--border-default);
}

.how__grid {
  display: grid;
  gap: var(--space-10);
}

@media (min-width: 768px) {
  .how__grid { grid-template-columns: repeat(3, 1fr); }
}

.how-step {
  display: flex;
  gap: var(--space-5);
}

@media (min-width: 768px) {
  .how-step { flex-direction: column; }
}

.how-step__number {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  border: 0.5px solid var(--color-gold);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: var(--weight-medium);
  color: var(--color-gold);
}

.how-step__title {
  font-size: var(--text-h3);
  font-weight: var(--weight-medium);
  color: var(--color-ink);
  margin-bottom: var(--space-2);
}

.how-step__desc {
  font-size: 14px;
  color: var(--color-ash);
  line-height: var(--leading-normal);
}

/* ── Parceiros ──────────────────────────────────────────────────── */
.partners {
  padding-block: var(--space-16);
  background: var(--color-noir);
  border-bottom: 0.5px solid rgba(224, 216, 204, 0.15);
}

.partners__title { color: var(--color-linen); }

.partners__sub {
  font-size: 15px;
  color: var(--color-mist);
  margin-top: var(--space-3);
  max-width: 480px;
}

.partners__grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-4);
}

@media (min-width: 768px) {
  .partners__grid { grid-template-columns: repeat(4, 1fr); }
}

.partner-card {
  background: var(--color-slate);
  border: 0.5px solid rgba(224, 216, 204, 0.15);
  border-radius: var(--radius-lg);
  padding: 28px var(--space-5);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-3);
  transition: border-color var(--transition-base);
}

.partner-card:hover { border-color: rgba(196, 168, 98, 0.45); }

.partner-card__logo {
  font-size: 15px;
  font-weight: var(--weight-medium);
  color: var(--color-linen);
}

.partner-card__type {
  font-size: 10px;
  font-weight: var(--weight-medium);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-mist);
}

.partner-card__tag {
  margin-top: auto;
  padding: 2px var(--space-2);
  border-radius: var(--radius-full);
  font-size: 10px;
  font-weight: var(--weight-medium);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  background: rgba(196, 168, 98, 0.12);
  color: var(--color-gold);
}
</style>
