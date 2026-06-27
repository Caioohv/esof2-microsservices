// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  runtimeConfig: {
    public: {
      // URL pública do auth-service. Sobrescrita em produção por
      // NUXT_PUBLIC_AUTH_API_BASE (ex: https://auth.olimposhowcase.com.br).
      authApiBase: 'http://localhost:3001',
    },
  },

  modules: [
    '@nuxt/eslint',
    '@nuxt/fonts',
    '@nuxt/hints',
    '@nuxt/icon',
    '@nuxt/image',
  ],

  css: ['~/assets/css/main.css'],

  fonts: {
    families: [
      { name: 'Inter', weights: [400, 500] },
      { name: 'Playfair Display', weights: [500] },
    ],
  },

  icon: {},
})
