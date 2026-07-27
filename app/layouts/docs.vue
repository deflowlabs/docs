<script setup lang="ts">
/**
 * Docs layout: custom header with section tabs,
 * filtered sidebar, search with content indexing, and color mode.
 */
const route = useRoute()

const { data: navigation } = await useAsyncData(
  'docs-navigation',
  () => queryCollectionNavigation('content'),
)

/**
 * Fetch all content search sections for the search modal.
 */
const { data: files } = await useAsyncData(
  'docs-search-sections',
  () => queryCollectionSearchSections('content').catch(() => []),
  { default: () => [] },
)

/**
 * Root '/' belongs to the Getting Started section.
 */
const activeSection = computed(() => {
  const path = route.path
  if (path === '/' || path === '' || path.startsWith('/getting-started')) return 'getting-started'
  if (path.startsWith('/user-guide')) return 'user-guide'
  if (path.startsWith('/developer-docs')) return 'developer-docs'
  return 'getting-started'
})

const isWelcomePage = computed(() => route.path === '/' || route.path === '')

const sections = [
  { label: 'Getting Started', to: '/getting-started/what-is-deflow', key: 'getting-started', icon: 'i-lucide-rocket' },
  { label: 'User Guide', to: '/user-guide/trading/otc-deal-lifecycle', key: 'user-guide', icon: 'i-lucide-book-open' },
  { label: 'Developer Guide', to: '/developer-docs', key: 'developer-docs', icon: 'i-lucide-code', badge: 'Soon', disabled: true },
]

/**
 * Filters navigation to only the active section's CHILDREN (no heading).
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
  const section = navigation.value.find((item: any) => item.path === prefix)
  return section?.children || []
})

/**
 * Show Welcome link only in Getting Started section.
 */
const showWelcomeLink = computed(() => activeSection.value === 'getting-started')

/**
 * Mobile navigation menu toggle.
 */
const mobileMenuOpen = ref(false)
</script>

<template>
  <!-- Custom header -->
  <header class="sticky top-0 z-50 border-b border-[var(--ui-border)] bg-[var(--ui-bg)]/80 backdrop-blur-lg">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center h-16 gap-4">
        <!-- Mobile menu button -->
        <button
          class="md:hidden p-1.5 rounded-md text-[var(--ui-text-muted)] hover:text-[var(--ui-text)] hover:bg-[var(--ui-bg-elevated)] transition-colors"
          aria-label="Toggle menu"
          @click="mobileMenuOpen = !mobileMenuOpen"
        >
          <UIcon :name="mobileMenuOpen ? 'i-lucide-x' : 'i-lucide-menu'" class="size-5" />
        </button>

        <!-- Logo + Title -->
        <NuxtLink to="/" class="flex items-center gap-2 shrink-0">
          <UIcon name="i-lucide-hexagon" class="size-6 text-primary" />
          <span class="text-lg font-bold text-[var(--ui-text)]">DeFlow Docs</span>
        </NuxtLink>

        <!-- Section tabs (desktop) -->
        <nav class="hidden md:flex items-center gap-1 ml-4">
          <template v-for="section in sections" :key="section.key">
            <span v-if="section.disabled"
              class="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md whitespace-nowrap opacity-40 cursor-not-allowed">
              <UIcon :name="section.icon" class="size-4" />
              {{ section.label }}
              <UBadge v-if="section.badge" :label="section.badge" size="xs" color="neutral" variant="subtle" />
            </span>
            <NuxtLink v-else :to="section.to"
              class="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap"
              :class="[
                activeSection === section.key
                  ? 'text-primary bg-primary/10'
                  : 'text-[var(--ui-text-muted)] hover:text-[var(--ui-text)] hover:bg-[var(--ui-bg-elevated)]',
              ]">
              <UIcon :name="section.icon" class="size-4" />
              {{ section.label }}
            </NuxtLink>
          </template>
        </nav>

        <!-- Spacer -->
        <div class="flex-1" />

        <!-- Inline search (full on desktop, collapsed icon on mobile) -->
        <UContentSearchButton :collapsed="false" class="hidden sm:flex w-48 lg:w-64" />
        <UContentSearchButton :collapsed="true" class="sm:hidden" />

        <!-- Right: GitHub + Color mode -->
        <div class="flex items-center gap-1 shrink-0">
          <UButton icon="i-lucide-github" color="neutral" variant="ghost" to="https://github.com/DeFlowLabs"
            target="_blank" aria-label="GitHub" />
          <UColorModeButton />
        </div>
      </div>
    </div>

    <!-- Mobile dropdown menu -->
    <div v-if="mobileMenuOpen" class="md:hidden border-t border-[var(--ui-border)] bg-[var(--ui-bg)]">
      <nav class="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-1">
        <template v-for="section in sections" :key="section.key">
          <span v-if="section.disabled"
            class="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md opacity-40 cursor-not-allowed">
            <UIcon :name="section.icon" class="size-4" />
            {{ section.label }}
            <UBadge v-if="section.badge" :label="section.badge" size="xs" color="neutral" variant="subtle" />
          </span>
          <NuxtLink v-else :to="section.to"
            class="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors"
            :class="[
              activeSection === section.key
                ? 'text-primary bg-primary/10'
                : 'text-[var(--ui-text-muted)] hover:text-[var(--ui-text)] hover:bg-[var(--ui-bg-elevated)]',
            ]"
            @click="mobileMenuOpen = false">
            <UIcon :name="section.icon" class="size-4" />
            {{ section.label }}
          </NuxtLink>
        </template>
      </nav>
    </div>
  </header>

  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <UPage>
      <template #left>
        <UPageAside>
          <!-- Welcome link — only in Getting Started section -->
          <NuxtLink v-if="showWelcomeLink" to="/"
            class="flex items-center gap-2 pr-2.5 py-1.5 mb-4 pb-4 text-sm rounded-md transition-colors border-b border-[var(--ui-border)]"
            :class="[
              isWelcomePage
                ? 'text-primary font-medium'
                : 'text-[var(--ui-text-muted)] hover:text-[var(--ui-text)]',
            ]">
            Welcome to DeFlow
          </NuxtLink>

          <!-- Section child pages (all expanded by default when defaultOpen is undefined) -->
          <UContentNavigation :navigation="filteredNavigation" highlight />
        </UPageAside>
      </template>

      <slot />
    </UPage>
  </div>


  <UContentSearch :navigation="navigation" :files="files" :color-mode="false" />
</template>
