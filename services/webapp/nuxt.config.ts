// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  runtimeConfig: {
    // Private keys (server-only)
    authServiceUrl: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
    storeServiceUrl: process.env.STORE_SERVICE_URL || 'http://localhost:3004',

    public: {
      // Points to the Nuxt backend gateway
      authApiBase: '/api/auth',
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
