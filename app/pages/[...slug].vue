<script setup lang="ts">
/**
 * Catch-all docs page using Nuxt UI v4 content components.
 * Renders markdown with ContentRenderer, UContentToc for
 * table of contents, and UContentSurround for prev/next.
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
</script>

<template>
  <UPage v-if="page">
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
      />
    </template>
  </UPage>
</template>
