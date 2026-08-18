<script setup lang="ts">
/**
 * Shared public-documentation shell.
 *
 * Navigation is sourced from Nuxt Content, while the page table of contents is
 * queried by route so client-side navigation never reuses the previous page's
 * headings.
 */
const route = useRoute()
const currentPath = computed(() => route.path)
const mobileMenuOpen = ref(false)
const menuButton = ref<HTMLButtonElement | null>(null)

const { data: navigation } = await useAsyncData('docs-navigation', () => queryCollectionNavigation('docs'))
const { data: files } = await useAsyncData(
  'docs-search-sections',
  () => queryCollectionSearchSections('docs').catch(() => []),
  { default: () => [] },
)
const { data: currentPage } = await useAsyncData(
  () => `docs-layout-page:${currentPath.value}`,
  () => queryCollection('docs').path(currentPath.value).first(),
  { watch: [currentPath] },
)

const activeSection = computed(() => {
  if (route.path.startsWith('/user-guide')) return 'user-guide'
  return 'getting-started'
})
const sections = [
  { label: 'Getting Started', to: '/getting-started/what-is-deflow', key: 'getting-started', icon: 'i-lucide-rocket' },
  { label: 'User Guide', to: '/user-guide/overview', key: 'user-guide', icon: 'i-lucide-book-open' },
  // Deliberately render this product signal without a route until a supported
  // public API or SDK exists. `aria-disabled` communicates the same boundary
  // to assistive technology as the visual muted treatment.
  { label: 'Developer Guide', key: 'developer-guide', icon: 'i-lucide-code-xml', badge: 'Coming soon', disabled: true },
]
const userGuideOrder = [
  '/user-guide/overview',
  '/user-guide/trading',
  '/user-guide/syndicates',
  '/user-guide/rewards',
  '/user-guide/security',
  '/user-guide/partners',
  '/user-guide/support',
]
const orderedNavigation = computed(() => (navigation.value || []).map((item) => {
  if (item.path !== '/user-guide' || !item.children) return item

  return {
    ...item,
    children: [...item.children].sort((left, right) => {
      const leftIndex = userGuideOrder.indexOf(left.path)
      const rightIndex = userGuideOrder.indexOf(right.path)
      return (leftIndex === -1 ? Number.MAX_SAFE_INTEGER : leftIndex)
        - (rightIndex === -1 ? Number.MAX_SAFE_INTEGER : rightIndex)
    }),
  }
}))
const filteredNavigation = computed(() => {
  const prefix = `/${activeSection.value}`
  return orderedNavigation.value.find(item => item.path === prefix)?.children || []
})

/** Close the small-screen menu and optionally return focus to its trigger. */
function closeMobileMenu(restoreFocus = false) {
  mobileMenuOpen.value = false
  if (restoreFocus) nextTick(() => menuButton.value?.focus())
}

/** Provide the standard Escape interaction while the mobile menu is open. */
function handleMenuKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && mobileMenuOpen.value) closeMobileMenu(true)
}
watch(() => route.path, () => closeMobileMenu())
onMounted(() => document.addEventListener('keydown', handleMenuKeydown))
onUnmounted(() => document.removeEventListener('keydown', handleMenuKeydown))
</script>

<template>
  <a href="#main-content" class="skip-link">Skip to main content</a>
  <header class="sticky top-0 z-50 border-b border-(--ui-border) bg-(--ui-bg)/90 backdrop-blur-lg">
    <div class="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
      <button
        ref="menuButton"
        type="button"
        class="rounded-md p-2 text-(--ui-text-muted) transition-colors hover:bg-(--ui-bg-elevated) hover:text-(--ui-text) lg:hidden"
        :aria-label="mobileMenuOpen ? 'Close documentation navigation' : 'Open documentation navigation'"
        aria-controls="mobile-navigation"
        :aria-expanded="mobileMenuOpen"
        @click="mobileMenuOpen = !mobileMenuOpen"
      >
        <UIcon :name="mobileMenuOpen ? 'i-lucide-x' : 'i-lucide-menu'" class="size-5" />
      </button>

      <NuxtLink to="/" class="flex shrink-0 items-center gap-2 rounded-sm" aria-label="DeFlow documentation home">
        <UIcon name="i-lucide-hexagon" class="size-6 text-primary" />
        <span class="text-lg font-bold text-(--ui-text)">DeFlow Docs</span>
      </NuxtLink>

      <nav class="ml-4 hidden items-center gap-1 lg:flex" aria-label="Documentation sections">
        <template
          v-for="section in sections"
          :key="section.key"
        >
          <span
            v-if="section.disabled"
            class="flex cursor-not-allowed items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-(--ui-text-dimmed)"
            aria-disabled="true"
            title="Developer Guide — coming soon"
          >
            <UIcon :name="section.icon" class="size-4" />
            <span>{{ section.label }}</span>
            <UBadge :label="section.badge" color="neutral" variant="subtle" size="xs" />
          </span>
          <NuxtLink
            v-else
            :to="section.to"
            class="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
            :class="activeSection === section.key ? 'bg-primary/10 text-primary' : 'text-(--ui-text-muted) hover:bg-(--ui-bg-elevated) hover:text-(--ui-text)'"
          >
            <UIcon :name="section.icon" class="size-4" />
            <span>{{ section.label }}</span>
          </NuxtLink>
        </template>
      </nav>

      <div class="flex-1" />
      <UContentSearchButton :collapsed="false" class="hidden w-64 xl:flex" />
      <UContentSearchButton :collapsed="true" class="xl:hidden" />
      <UButton icon="i-lucide-globe" color="neutral" variant="ghost" to="https://deflowlabs.io" target="_blank" aria-label="Visit DeFlow Labs website" />
      <UColorModeButton />
    </div>

    <div v-if="mobileMenuOpen" id="mobile-navigation" class="border-t border-(--ui-border) bg-(--ui-bg) lg:hidden">
      <nav class="mx-auto max-h-[calc(100vh-7rem)] max-w-7xl overflow-y-auto px-4 py-4" aria-label="Mobile documentation navigation">
        <div class="mb-4 grid gap-2">
          <template
            v-for="section in sections"
            :key="section.key"
          >
            <span
              v-if="section.disabled"
              class="cursor-not-allowed rounded-md bg-(--ui-bg-elevated) px-3 py-2 text-sm font-medium text-(--ui-text-dimmed)"
              aria-disabled="true"
              title="Developer Guide — coming soon"
            >
              {{ section.label }} <span class="ml-1 text-xs">({{ section.badge }})</span>
            </span>
            <NuxtLink
              v-else
              :to="section.to"
              class="rounded-md px-3 py-2 text-sm font-medium"
              :class="activeSection === section.key ? 'bg-primary/10 text-primary' : 'bg-(--ui-bg-elevated) text-(--ui-text-muted)'"
            >
              {{ section.label }}
            </NuxtLink>
          </template>
        </div>
        <UContentNavigation :navigation="orderedNavigation" highlight />
      </nav>
    </div>
  </header>

  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <UPage>
      <template #left>
        <UPageAside>
          <NuxtLink v-if="activeSection === 'getting-started'" to="/" class="mb-4 block border-b border-(--ui-border) pb-4 text-sm font-medium text-(--ui-text-muted) hover:text-primary">Welcome to DeFlow</NuxtLink>
          <UContentNavigation :navigation="filteredNavigation" highlight />
        </UPageAside>
      </template>
      <main id="main-content" tabindex="-1"><slot /></main>
      <template #right>
        <aside
          v-if="currentPage?.body?.toc?.links?.length"
          :key="currentPath"
          data-testid="page-toc"
          aria-label="Page table of contents"
        >
          <UContentToc
            :links="currentPage.body.toc.links"
            title="On this page"
            highlight
          />
        </aside>
      </template>
    </UPage>
  </div>

  <UContentSearch
    :navigation="orderedNavigation"
    :files="files"
    :color-mode="false"
    title="Search DeFlow documentation"
    description="Search DeFlow product guidance, availability, workflows, fees, security, and support."
  />
</template>
