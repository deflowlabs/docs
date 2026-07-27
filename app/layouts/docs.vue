<script setup lang="ts">
/**
 * Docs layout with section tabs in the header row,
 * filtered sidebar, and Nuxt UI search/color mode components.
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
 * 3 documentation section tabs displayed in the header.
 */
const sections = [
  { label: 'Getting Started', to: '/getting-started/what-is-deflow', key: 'getting-started', icon: 'i-lucide-rocket' },
  { label: 'User Guide', to: '/user-guide/trading/otc-deal-lifecycle', key: 'user-guide', icon: 'i-lucide-book-open' },
  { label: 'Developer Docs', to: '/developer-docs', key: 'developer-docs', icon: 'i-lucide-code', badge: 'Soon', disabled: true },
]

/**
 * Filters navigation to the active section (with title heading).
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

  return section ? [section] : []
})
</script>

<template>
  <!-- Header using UHeader for proper hydration -->
  <UHeader title="DeFlow Docs" to="/">
    <template #left>
      <nav class="hidden md:flex items-center gap-1 ml-4">
        <template v-for="section in sections" :key="section.key">
          <span
            v-if="section.disabled"
            class="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md whitespace-nowrap text-muted/50 cursor-not-allowed opacity-50"
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
                : 'text-muted hover:text-default hover:bg-elevated',
            ]"
          >
            <UIcon :name="section.icon" class="size-4" />
            {{ section.label }}
          </NuxtLink>
        </template>
      </nav>
    </template>

    <template #right>
      <UContentSearchButton label="Search..." />
      <UColorModeButton />
    </template>
  </UHeader>

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
        icon="i-lucide-globe"
        color="neutral"
        variant="ghost"
        to="https://deflowlabs.io"
        target="_blank"
        aria-label="DeFlow Website"
      />
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
