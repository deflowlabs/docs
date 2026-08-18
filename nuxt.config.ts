/**
 * DeFlow public documentation and its separate visual-authoring deployment.
 * Public builds are static. Set NUXT_STUDIO_ENABLED=true only on the secured
 * authoring deployment, which requires GitHub OAuth and an SSR-capable preset.
 */
const isAuthoring = process.env.NUXT_STUDIO_ENABLED === 'true'

if (isAuthoring && process.env.NODE_ENV === 'production') {
  const required = ['STUDIO_GITHUB_CLIENT_ID', 'STUDIO_GITHUB_CLIENT_SECRET']
  const missing = required.filter(key => !process.env[key])
  if (missing.length) throw new Error(`Authoring deployment is missing: ${missing.join(', ')}`)
}

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: process.env.NODE_ENV !== 'production' },
  future: { compatibilityVersion: 4 },

  app: {
    head: {
      htmlAttrs: { lang: 'en-GB' },
      title: 'DeFlow Documentation',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'theme-color', content: '#0b0b14' },
        { name: 'description', content: 'Institutional product documentation for DeFlow OTC settlement, syndicates, rewards, security and partner operations.' },
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'DeFlow Docs' },
        { name: 'twitter:card', content: 'summary_large_image' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'sitemap', type: 'application/xml', href: '/sitemap.xml' },
      ],
    },
  },

  modules: [
    '@nuxt/ui',
    '@nuxt/content',
    ...(isAuthoring ? ['nuxt-studio'] : []),
    '@nuxt/image',
    '@nuxtjs/sitemap',
  ],
  css: ['~/assets/css/main.css'],
  // Brand fonts are committed under /public/fonts and declared in main.css.
  // Disabling Nuxt UI font discovery prevents build-time calls to third-party
  // catalogues while preserving the approved Geist/Geist Mono stack.
  ui: { fonts: false },
  colorMode: { preference: 'system', fallback: 'dark' },

  // @ts-expect-error Nuxt Studio augments this key only when its conditional module is loaded.
  studio: isAuthoring ? {
    route: '/_studio',
    repository: {
      provider: 'github',
      owner: 'DeFlowLabs',
      repo: 'docs',
      branch: process.env.NUXT_STUDIO_BRANCH || 'content-editor',
      private: true,
    },
    auth: {
      github: {
        clientId: process.env.STUDIO_GITHUB_CLIENT_ID,
        clientSecret: process.env.STUDIO_GITHUB_CLIENT_SECRET,
      },
    },
  } : undefined,

  site: { url: 'https://docs.deflowlabs.io' },
  content: {
    build: {
      markdown: {
        highlight: {
          theme: { default: 'vitesse-light', dark: 'vitesse-dark' },
          langs: ['typescript', 'javascript', 'json', 'bash', 'solidity', 'sql', 'yaml', 'markdown', 'vue', 'css', 'html', 'mermaid'],
        },
        toc: { depth: 3, searchDepth: 3 },
      },
    },
    preview: { api: 'https://api.nuxt.studio' },
  },
  icon: {
    collections: ['lucide'],
    provider: 'none',
    serverBundle: false,
    clientBundle: { scan: true, sizeLimitKb: 64 },
  },

  routeRules: {
    '/getting-started/beta-availability': {
      redirect: { to: '/getting-started/product-availability', statusCode: 301 },
    },
    '/**': {
      prerender: true,
      headers: {
        'Content-Security-Policy': "default-src 'self'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; connect-src 'self' https://api.nuxt.studio; font-src 'self' data:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
      },
    },
  },
  nitro: {
    preset: isAuthoring ? 'vercel' : 'static',
    prerender: { routes: ['/'], crawlLinks: true },
    hooks: {
      'prerender:generate': (route) => {
        if (route.route !== '/404.html' || !route.contents) return

        route.contents = route.contents.replace(
          '</head>',
          '<meta name="robots" content="noindex, nofollow"><meta name="googlebot" content="noindex, nofollow"></head>',
        )
      },
    },
  },
  // The disabled Developer Guide navigation label has no content route. Keep a
  // defensive sitemap exclusion so a future draft cannot leak by accident.
  sitemap: {
    zeroRuntime: !isAuthoring,
    exclude: ['/developer-guide/**'],
  },
})
