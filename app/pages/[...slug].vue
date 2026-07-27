<script setup lang="ts">
/**
 * Catch-all docs page with breadcrumbs, content rendering,
 * table of contents, and prev/next navigation.
 */
definePageMeta({
  layout: 'docs',
})

const route = useRoute()

const { data: page } = await useAsyncData(
  `content-${route.path}`,
  () => queryCollection('content').path(route.path).first(),
)

if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found' })
}

const { data: surround } = await useAsyncData(
  `surround-${route.path}`,
  () => queryCollectionItemSurroundings('content', route.path),
)

useHead({
  title: page.value.title ? `${page.value.title} — DeFlow Docs` : 'DeFlow Documentation',
  meta: [
    { name: 'description', content: page.value.description || '' },
  ],
})

useSeoMeta({
  ogTitle: page.value.title,
  ogDescription: page.value.description,
})

/**
 * Builds breadcrumb items from the current route path.
 * Converts URL segments into human-readable labels.
 */
const breadcrumbItems = computed(() => {
  const segments = route.path.split('/').filter(Boolean)
  const items: Array<{ label: string; to?: string; icon?: string }> = [
    { label: '', to: '/', icon: 'i-lucide-house' },
  ]

  let currentPath = ''
  for (let i = 0; i < segments.length; i++) {
    currentPath += `/${segments[i]}`
    const label = segments[i]
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase())

    if (i === segments.length - 1) {
      items.push({ label: page.value?.title || label })
    } else {
      items.push({ label, to: currentPath })
    }
  }

  return items
})
</script>

<template>
  <UPage v-if="page">
    <UBreadcrumb :items="breadcrumbItems" class="mb-3" />

    <UPageHeader
      :title="page.title"
      :description="page.description"
    />

    <UPageBody>
      <ContentRenderer :value="page" />

      <USeparator class="my-10" />

      <UContentSurround :surround="surround" />
    </UPageBody>

    <template #right>
      <UContentToc
        :links="page.body?.toc?.links || []"
        title="On This Page"
        highlight
      />
    </template>
  </UPage>
</template>
