<script setup lang="ts">
/**
 * Docs layout with 3-section sub-navigation bar.
 * Each section has its own filtered sidebar with a section title.
 * Sections: Getting Started, User Guide, Developer Docs.
 */
const route = useRoute()

const { data: navigation } = await useAsyncData(
  'docs-navigation',
  () => queryCollectionNavigation('content'),
)

/**
 * Determines the active documentation section from the route path.
 */
const activeSection = computed(() => {
  const path = route.path
  if (path.startsWith('/getting-started')) return 'getting-started'
  if (path.startsWith('/user-guide')) return 'user-guide'
  if (path.startsWith('/developer-docs')) return 'developer-docs'
  return 'getting-started'
})

/**
 * Header section tabs — 3 documentation sections.
 */
const sections = [
  { label: 'Getting Started', to: '/getting-started/what-is-deflow', key: 'getting-started', icon: 'i-lucide-rocket' },
  { label: 'User Guide', to: '/user-guide/trading/otc-deal-lifecycle', key: 'user-guide', icon: 'i-lucide-book-open' },
  { label: 'Developer Docs', to: '/developer-docs', key: 'developer-docs', icon: 'i-lucide-code', badge: 'Soon' },
]

/**
 * Filters navigation to show only the active section's children.
 * Returns the section itself (with title) so the sidebar has a heading.
 */
const filteredNavigation = computed(() => {
  if (!navigation.value) return []

  const pathMap: Record<string, string> = {
    'getting-started': '/getting-started',
    'user-guide': '/user-guide',
    'developer-docs': '/developer-docs',
  }

  const prefix = pathMap[activeSection.value]
  if (!prefix) return []

  const section = navigation.value.find(
    (item: any) => item.path === prefix,
  )

  // Return the section as an array so UContentNavigation shows
  // the section title as a top-level heading with children beneath it
  return section ? [section] : []
})
</script>

<template>
  <!-- Main header bar -->
  <UHeader title="DeFlow Docs" to="/">
    <template #right>
      <UContentSearchButton label="Search..." />
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

  <!-- Section sub-navigation bar -->
  <nav class="border-b border-default bg-default/50 backdrop-blur-sm sticky top-[var(--ui-header-height)] z-40">
    <UContainer>
      <div class="flex items-center gap-1 py-2 overflow-x-auto">
        <NuxtLink
          v-for="section in sections"
          :key="section.key"
          :to="section.to"
          class="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
          :class="[
            activeSection === section.key
              ? 'text-primary bg-primary/10'
              : 'text-muted hover:text-default hover:bg-elevated',
          ]"
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
        </NuxtLink>
      </div>
    </UContainer>
  </nav>

  <UContainer>
    <UPage>
      <template #left>
        <UPageAside>
          <UContentNavigation
            :navigation="filteredNavigation"
          />
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
