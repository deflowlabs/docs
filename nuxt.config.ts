/**
 * DeFlow Labs Documentation Site
 * Nuxt 4 + Nuxt Content v3 + Nuxt UI v4 + Nuxt Studio
 */
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',

  devtools: { enabled: true },

  future: {
    compatibilityVersion: 4,
  },

  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      title: 'DeFlow Documentation',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content: 'Official documentation for the DeFlow settlement platform. Guides, tutorials, and reference material for institutional digital asset dealflows.',
        },
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'DeFlow Docs' },
        { property: 'og:title', content: 'DeFlow Documentation' },
        {
          property: 'og:description',
          content: 'Official documentation for the DeFlow settlement platform.',
        },
        { name: 'twitter:card', content: 'summary' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      ],
    },
  },

  modules: [
    '@nuxt/ui',
    '@nuxt/content',
    'nuxt-studio',
    '@nuxt/image',
    '@nuxtjs/sitemap',
  ],

  css: ['~/assets/css/main.css'],

  // Nuxt UI — system color mode by default
  colorMode: {
    preference: 'system',
    fallback: 'dark',
  },

  // Nuxt Studio — visual content editor (self-hosted)
  studio: {
    repository: {
      provider: 'github',
      owner: 'DeFlowLabs',
      repo: 'docs',
      branch: 'main',
    },
  },

  // Site URL for sitemap and SEO
  site: {
    url: 'https://docs.deflowlabs.io',
  },

  // Nuxt Content v3 configuration
  content: {
    build: {
      markdown: {
        highlight: {
          theme: {
            default: 'vitesse-light',
            dark: 'vitesse-dark',
          },
          langs: [
            'typescript', 'javascript', 'json', 'bash',
            'solidity', 'sql', 'yaml', 'markdown',
            'vue', 'css', 'html', 'mermaid',
          ],
        },
        toc: {
          depth: 3,
          searchDepth: 3,
        },
      },
    },
    preview: {
      api: 'https://api.nuxt.studio',
    },
  },

  // Icon configuration
  icon: {
    serverBundle: 'local',
    collections: ['lucide'],
  },



  // Route rules — prerender all content pages for Vercel
  routeRules: {
    '/api/**': { isr: false },
    '/**': { prerender: true },
  },

  // Nitro server configuration
  nitro: {
    preset: 'vercel',
    prerender: {
      routes: ['/'],
      crawlLinks: true,
    },
  },
})
