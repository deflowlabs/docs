/**
 * DeFlow Docs — App Configuration
 *
 * Configures Nuxt UI theme, navigation structure,
 * SEO metadata, and Table of Contents settings.
 * Uses the "Atmospheric Institutional" dark palette
 * with a clean light mode alternative.
 */
export default defineAppConfig({
  ui: {
    colors: {
      primary: 'sky',
      neutral: 'slate',
    },
  },

  // Site-wide metadata used by Nuxt UI docs layout
  seo: {
    siteName: 'DeFlow Docs',
  },

  // Header configuration
  header: {
    title: 'DeFlow',
    to: '/',
    links: [
      {
        icon: 'i-lucide-globe',
        to: 'https://deflowlabs.io',
        target: '_blank',
        label: 'Website',
      },
      {
        icon: 'i-lucide-github',
        to: 'https://github.com/DeFlowLabs',
        target: '_blank',
        label: 'GitHub',
      },
    ],
  },

  // Table of Contents
  toc: {
    title: 'On This Page',
    bottom: {
      title: 'Community',
      edit: 'https://github.com/DeFlowLabs/docs/edit/content-editor/content',
      links: [
        {
          icon: 'i-lucide-message-square',
          label: 'Contact Support',
          to: 'mailto:support@deflowlabs.io',
          target: '_blank',
        },
      ],
    },
  },
})
