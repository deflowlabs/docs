/**
 * DeFlow Labs Documentation Site
 * Nuxt 4 + Nuxt Content v3 + Nuxt Studio
 * Dark "Atmospheric Institutional" design system.
 */
import tailwindcss from '@tailwindcss/vite'

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
        { name: 'theme-color', content: '#0B0B14' },
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'DeFlow Docs' },
        { property: 'og:title', content: 'DeFlow Documentation' },
        {
          property: 'og:description',
          content: 'Official documentation for the DeFlow settlement platform.',
        },
        { property: 'og:image', content: 'https://docs.deflowlabs.io/og-image.png' },
        { name: 'twitter:card', content: 'summary_large_image' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      ],
    },
  },

  css: ['~/assets/css/main.css'],

  modules: [
    '@nuxt/content',
    'nuxt-studio',
    '@nuxt/icon',
    '@nuxt/image',
    '@nuxt/fonts',
    '@nuxtjs/sitemap',
  ],

  // Nuxt Studio — visual content editor (self-hosted)
  studio: {
    enabled: true,
    repository: {
      provider: 'github',
      owner: 'DeFlowLabs',
      repo: 'docs',
      branch: 'main',
    },
  },

  // Site URL for sitemap and SEO modules
  site: {
    url: 'https://docs.deflowlabs.io',
  },

  // Nuxt Content v3 configuration
  content: {
    build: {
      markdown: {
        highlight: {
          theme: 'vitesse-dark',
          langs: [
            'typescript',
            'javascript',
            'json',
            'bash',
            'solidity',
            'sql',
            'yaml',
            'markdown',
            'vue',
            'css',
            'html',
            'mermaid',
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

  // Font configuration — Geist (primary) + Geist Mono (code)
  fonts: {
    families: [
      { name: 'Geist', provider: 'google', weights: [400, 500, 600, 700] },
      { name: 'Geist Mono', provider: 'google', weights: [400, 500, 600] },
    ],
  },

  // Sitemap
  sitemap: {
    siteUrl: 'https://docs.deflowlabs.io',
  },

  // ISR route rules for Vercel
  routeRules: {
    '/**': { isr: 3600 },
  },

  // Vite configuration — Tailwind v4 plugin
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },

  // Nitro server configuration
  nitro: {
    preset: 'vercel',
  },

})
