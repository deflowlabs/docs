<script setup lang="ts">
/** Shared index-safe error page for missing and failed documentation routes. */
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()
const isNotFound = computed(() => props.error.statusCode === 404)

useSeoMeta({
  title: () => isNotFound.value ? 'Page not found — DeFlow Docs' : 'Documentation error — DeFlow Docs',
  description: 'This documentation page is unavailable.',
  robots: 'noindex,nofollow',
})
</script>

<template>
  <div class="min-h-screen bg-(--ui-bg) text-(--ui-text)">
    <header class="border-b border-(--ui-border)">
      <div class="mx-auto flex h-16 max-w-5xl items-center px-4 sm:px-6">
        <NuxtLink to="/" class="rounded-sm text-lg font-bold focus-visible:outline-3">DeFlow Docs</NuxtLink>
      </div>
    </header>
    <main id="main-content" class="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
      <p class="text-sm font-semibold text-primary">{{ error.statusCode }}</p>
      <h1 class="mt-3 text-4xl font-bold text-(--ui-text-highlighted)">
        {{ isNotFound ? 'Page not found' : 'Something went wrong' }}
      </h1>
      <p class="mt-4 text-(--ui-text-muted)">
        {{ isNotFound ? 'This page is not part of the current public documentation.' : 'The documentation could not be displayed.' }}
      </p>
      <UButton to="/" class="mt-8" icon="i-lucide-house">Return to documentation</UButton>
    </main>
  </div>
</template>
