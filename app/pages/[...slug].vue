<script setup lang="ts">
/**
 * Catch-all page that renders Nuxt Content markdown pages
 * inside the docs layout with the prose styling.
 */
definePageMeta({
  layout: 'docs',
})

const route = useRoute()
</script>

<template>
  <ContentRenderer
    :path="route.path === '/' ? '/index' : route.path"
  />
</template>
