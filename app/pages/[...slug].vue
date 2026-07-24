<script setup lang="ts">
/**
 * Catch-all page that renders Nuxt Content v3 markdown pages
 * inside the docs layout with prose styling.
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

useHead({
  title: page.value.title ? `${page.value.title} — DeFlow Docs` : 'DeFlow Documentation',
  meta: [
    { name: 'description', content: page.value.description || '' },
  ],
})
</script>

<template>
  <ContentRenderer v-if="page" :value="page" />
</template>
