<script setup lang="ts">
/**
 * Docs layout: custom header with section tabs,
 * filtered sidebar, proper search with content indexing, and color mode.
 */
const route = useRoute()

const { data: navigation } = await useAsyncData(
  'docs-navigation',
  () => queryCollectionNavigation('content'),
)

/**
 * Fetch all content search sections for the search modal.
 * queryCollectionSearchSections returns flattened sections
 * that UContentSearch uses for its file-based search index.
 */
const { data: files } = await useAsyncData(
  'docs-search-sections',
  () => queryCollectionSearchSections('content').catch(() => []),
  { default: () => [] },
)

const activeSection = computed(() => {
  const path = route.path
  if (path.startsWith('/getting-started')) return 'getting-started'
  if (path.startsWith('/user-guide')) return 'user-guide'
  if (path.startsWith('/developer-docs')) return 'developer-docs'
  return 'getting-started'
})

const sections = [
  { label: 'Getting Started', to: '/getting-started/what-is-deflow', key: 'getting-started', icon: 'i-lucide-rocket' },
  { label: 'User Guide', to: '/user-guide/trading/otc-deal-lifecycle', key: 'user-guide', icon: 'i-lucide-book-open' },
  { label: 'Developer Docs', to: '/developer-docs', key: 'developer-docs', icon: 'i-lucide-code', badge: 'Soon', disabled: true },
]

const filteredNavigation = computed(() => {
  if (!navigation.value) return []
  const pathMap: Record<string, string> = {
    'getting-started': '/getting-started',
    'user-guide': '/user-guide',
    'developer-docs': '/developer-docs',
  }
  const prefix = pathMap[activeSection.value]
  if (!prefix) return []
  const section = navigation.value.find((item: any) => item.path === prefix)
  return section ? [section] : []
})
</script>

<template>
  <!-- Custom header -->
  <header class="sticky top-0 z-50 border-b border-[var(--ui-border)] bg-[var(--ui-bg)]/80 backdrop-blur-lg">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center h-16 gap-4">
        <!-- Logo + Title -->
        <NuxtLink to="/" class="flex items-center gap-2 shrink-0">
          <UIcon name="i-lucide-hexagon" class="size-6 text-primary" />
          <span class="text-lg font-bold text-[var(--ui-text)]">DeFlow Docs</span>
        </NuxtLink>

        <!-- Section tabs -->
        <nav class="hidden md:flex items-center gap-1 flex-1 ml-4">
          <template v-for="section in sections" :key="section.key">
            <span
              v-if="section.disabled"
              class="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md whitespace-nowrap opacity-40 cursor-not-allowed"
            >
              <UIcon :name="section.icon" class="size-4" />
              {{ section.label }}
              <UBadge
                v-if="section.badge"
                :label="section.badge"
                size="xs"
                color="neutral"
                variant="subtle"
              />
            </span>
            <NuxtLink
              v-else
              :to="section.to"
              class="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap"
              :class="[
                activeSection === section.key
                  ? 'text-primary bg-primary/10'
                  : 'text-[var(--ui-text-muted)] hover:text-[var(--ui-text)] hover:bg-[var(--ui-bg-elevated)]',
              ]"
            >
              <UIcon :name="section.icon" class="size-4" />
              {{ section.label }}
            </NuxtLink>
          </template>
        </nav>

        <!-- Right: Search + Color mode -->
        <div class="flex items-center gap-2 shrink-0">
          <UContentSearchButton label="Search..." />
          <UColorModeButton />
        </div>
      </div>
    </div>
  </header>

  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <UPage>
      <template #left>
        <UPageAside>
          <UContentNavigation :navigation="filteredNavigation" />
        </UPageAside>
      </template>

      <slot />
    </UPage>
  </div>

  <footer class="border-t border-[var(--ui-border)] mt-16">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex items-center justify-between">
      <span class="text-sm text-[var(--ui-text-muted)]">
        © {{ new Date().getFullYear() }} DeFlow Labs. All rights reserved.
      </span>
      <div class="flex items-center gap-2">
        <UButton icon="i-lucide-globe" color="neutral" variant="ghost" to="https://deflowlabs.io" target="_blank" aria-label="DeFlow Website" />
        <UButton icon="i-lucide-linkedin" color="neutral" variant="ghost" to="https://linkedin.com/company/deflowlabs" target="_blank" aria-label="LinkedIn" />
        <UButton icon="i-lucide-github" color="neutral" variant="ghost" to="https://github.com/DeFlowLabs" target="_blank" aria-label="GitHub" />
      </div>
    </div>
  </footer>

  <!-- Pass navigation tree + search sections (files) for full content search -->
  <UContentSearch
    :navigation="navigation"
    :files="files"
    :color-mode="false"
  />
</template>
