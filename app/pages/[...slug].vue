<script setup lang="ts">
/**
 * Route-level documentation renderer.
 *
 * Each route resolves its own typed Nuxt Content record, surrounding pages,
 * search metadata and JSON-LD graph. All values are reactive so client-side
 * navigation updates metadata as reliably as a full page load.
 */
definePageMeta({ layout: 'docs' })
const route = useRoute()
const siteUrl = 'https://docs.deflowlabs.io'
const socialImage = 'https://deflowlabs.io/og-image.png'
const currentPath = computed(() => route.path)

const { data: page } = await useAsyncData(
  () => `content:${currentPath.value}`,
  () => queryCollection('docs').path(currentPath.value).first(),
  { watch: [currentPath] },
)
if (!page.value) throw createError({ statusCode: 404, statusMessage: 'Page not found' })
const { data: surround } = await useAsyncData(
  () => `surround:${currentPath.value}`,
  () => queryCollectionItemSurroundings('docs', currentPath.value),
  { watch: [currentPath] },
)

/** URL segments represented by navigation groups rather than public pages. */
const skipSegments = new Set(['getting-started', 'user-guide', 'trading', 'syndicates', 'rewards', 'security', 'partners', 'support'])
const breadcrumbItems = computed(() => {
  const segments = route.path.split('/').filter(Boolean)
  const items: Array<{ label: string; to?: string; icon?: string }> = [{ label: 'Home', to: '/', icon: 'i-lucide-house' }]
  let path = ''
  for (let index = 0; index < segments.length; index++) {
    path += `/${segments[index]}`
    if (skipSegments.has(segments[index]!)) continue
    const label = segments[index]!.replace(/-/g, ' ').replace(/\b\w/g, char => char.toUpperCase())
    items.push(index === segments.length - 1 ? { label: page.value?.title || label } : { label, to: path })
  }
  return items
})

const canonical = computed(() => `${siteUrl}${currentPath.value === '/' ? '' : currentPath.value}`)
const title = computed(() => `${page.value?.title || 'Documentation'} — DeFlow Docs`)
const section = computed(() => {
  if (currentPath.value.startsWith('/user-guide')) return 'User Guide'
  return 'Getting Started'
})
const structuredData = computed(() => ({
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': currentPath.value === '/' ? 'WebPage' : 'TechArticle',
      '@id': `${canonical.value}#page`,
      headline: page.value?.title,
      name: page.value?.title,
      description: page.value?.description,
      url: canonical.value,
      mainEntityOfPage: canonical.value,
      dateModified: page.value?.lastVerified,
      inLanguage: 'en-GB',
      articleSection: section.value,
      image: socialImage,
      author: { '@id': 'https://deflowlabs.io/#organization' },
      publisher: { '@id': 'https://deflowlabs.io/#organization' },
      isPartOf: { '@id': `${siteUrl}/#website` },
      breadcrumb: { '@id': `${canonical.value}#breadcrumb` },
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${canonical.value}#breadcrumb`,
      itemListElement: breadcrumbItems.value.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.label,
        item: item.to ? `${siteUrl}${item.to === '/' ? '' : item.to}` : canonical.value,
      })),
    },
    {
      '@type': 'WebSite',
      '@id': `${siteUrl}/#website`,
      name: 'DeFlow Docs',
      url: `${siteUrl}/`,
      inLanguage: 'en-GB',
      publisher: { '@id': 'https://deflowlabs.io/#organization' },
    },
    {
      '@type': 'Organization',
      '@id': 'https://deflowlabs.io/#organization',
      name: 'DeFlow Labs',
      url: 'https://deflowlabs.io/',
      logo: { '@type': 'ImageObject', url: socialImage },
    },
  ],
}))

useSeoMeta({
  title: () => title.value,
  description: () => page.value?.description,
  robots: () => page.value?.robots,
  ogType: () => currentPath.value === '/' ? 'website' : 'article',
  ogLocale: 'en_GB',
  ogSiteName: 'DeFlow Docs',
  ogTitle: () => title.value,
  ogDescription: () => page.value?.description,
  ogUrl: () => canonical.value,
  ogImage: socialImage,
  ogImageAlt: 'DeFlow Labs documentation',
  articleModifiedTime: () => page.value?.lastVerified,
  articleSection: () => section.value,
  twitterCard: 'summary_large_image',
  twitterTitle: () => title.value,
  twitterDescription: () => page.value?.description,
  twitterImage: socialImage,
  twitterImageAlt: 'DeFlow Labs documentation',
})
useHead(() => ({
  link: [{ rel: 'canonical', href: canonical.value }],
  script: [{
    key: 'documentation-structured-data',
    type: 'application/ld+json',
    textContent: JSON.stringify(structuredData.value).replace(/</g, '\\u003c'),
  }],
}))
</script>

<template>
  <UPageBody v-if="page">
    <UBreadcrumb :items="breadcrumbItems" class="mb-5" />
    <header class="mb-8">
      <div class="mb-3 flex flex-wrap items-center gap-2">
        <AvailabilityBadge :status="page.availability" />
        <span class="text-xs text-dimmed">Verified {{ page.lastVerified }}</span>
      </div>
      <h1 class="text-3xl font-bold tracking-tight text-highlighted sm:text-4xl">{{ page.title }}</h1>
      <p class="mt-3 max-w-3xl text-lg text-muted">{{ page.description }}</p>
    </header>
    <USeparator class="mb-8" />
    <ContentRenderer :value="page" />
    <USeparator class="my-10" />
    <UContentSurround :surround="surround" />
  </UPageBody>
</template>
