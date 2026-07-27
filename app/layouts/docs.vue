<script setup lang="ts">
/**
 * Docs layout with section tabs in the header row,
 * filtered sidebar, and inline search bar.
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
  { label: 'Developer Docs', to: '/developer-docs', key: 'developer-docs', icon: 'i-lucide-code', badge: 'Soon' },
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
  <!-- Single-row header with logo, section tabs, and search -->
  <header class="sticky top-0 z-50 border-b border-default bg-default/80 backdrop-blur-lg">
    <UContainer>
      <div class="flex items-center h-14 gap-6">
        <!-- Logo / Home -->
        <NuxtLink to="/" class="text-lg font-bold text-default shrink-0">
          DeFlow Docs
        </NuxtLink>

        <!-- Section tabs (center) -->
        <nav class="hidden md:flex items-center gap-1 flex-1">
          <NuxtLink
            v-for="section in sections"
            :key="section.key"
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
            <UBadge
              v-if="section.badge"
              :label="section.badge"
              size="xs"
              color="neutral"
              variant="subtle"
            />
          </NuxtLink>
        </nav>

        <!-- Right: inline search bar + icons -->
        <div class="flex items-center gap-2 shrink-0">
          <!-- Inline search trigger styled as input -->
          <button
            class="hidden sm:flex items-center gap-2 px-3 py-1.5 w-56 text-sm text-muted rounded-lg border border-default bg-elevated hover:bg-accented transition-colors"
            @click="$event.preventDefault(); (document.querySelector('[data-content-search-button]') as HTMLElement)?.click()"
          >
            <UIcon name="i-lucide-search" class="size-4 shrink-0" />
            <span class="flex-1 text-left">Search...</span>
            <kbd class="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono font-medium text-muted bg-default border border-default rounded">
              Ctrl K
            </kbd>
          </button>

          <!-- Hidden actual search button for programmatic click -->
          <UContentSearchButton data-content-search-button class="sr-only" />

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
        </div>
      </div>
    </UContainer>
  </header>

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
