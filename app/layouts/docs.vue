<script setup lang="ts">
/**
 * Docs layout using Nuxt UI v4 components.
 * Provides header with search, sidebar navigation,
 * color mode toggle, and footer.
 */
const { data: navigation } = await useAsyncData(
  'docs-navigation',
  () => queryCollectionNavigation('content'),
)
</script>

<template>
  <UHeader title="DeFlow" to="/">
    <template #left>
      <span class="text-sm font-medium text-muted ml-2">Docs</span>
    </template>

    <template #right>
      <UContentSearchButton />
      <UColorModeButton />
      <UButton
        icon="i-lucide-globe"
        color="neutral"
        variant="ghost"
        to="https://deflowlabs.io"
        target="_blank"
        aria-label="DeFlow Website"
      />
      <UButton
        icon="i-lucide-github"
        color="neutral"
        variant="ghost"
        to="https://github.com/DeFlowLabs"
        target="_blank"
        aria-label="GitHub"
      />
    </template>
  </UHeader>

  <UContainer>
    <UPage>
      <template #left>
        <UPageAside>
          <UContentNavigation :navigation="navigation" />
        </UPageAside>
      </template>

      <slot />
    </UPage>
  </UContainer>

  <UFooter>
    <template #left>
      <span class="text-sm text-muted">
        © {{ new Date().getFullYear() }} DeFlow Labs. All rights reserved.
      </span>
    </template>

    <template #right>
      <UButton
        icon="i-lucide-linkedin"
        color="neutral"
        variant="ghost"
        to="https://linkedin.com/company/deflowlabs"
        target="_blank"
        aria-label="LinkedIn"
      />
      <UButton
        icon="i-lucide-github"
        color="neutral"
        variant="ghost"
        to="https://github.com/DeFlowLabs"
        target="_blank"
        aria-label="GitHub"
      />
    </template>
  </UFooter>

  <UContentSearch />
</template>
