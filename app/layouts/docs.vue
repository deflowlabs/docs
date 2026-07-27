<script setup lang="ts">
/**
 * Docs layout with section tabs in the header row,
 * filtered sidebar, inline search bar, and color mode dropdown.
 */
const route = useRoute()
const colorMode = useColorMode()
const searchOpen = ref(false)

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
 * Color mode dropdown items.
 */
const colorModeItems = [[
  {
    label: 'System',
    icon: 'i-lucide-monitor',
    click: () => { colorMode.preference = 'system' },
  },
  {
    label: 'Light',
    icon: 'i-lucide-sun',
    click: () => { colorMode.preference = 'light' },
  },
  {
    label: 'Dark',
    icon: 'i-lucide-moon',
    click: () => { colorMode.preference = 'dark' },
  },
]]

/**
 * Icon for the current color mode state.
 */
const colorModeIcon = computed(() => {
  if (colorMode.preference === 'system') return 'i-lucide-monitor'
  if (colorMode.preference === 'light') return 'i-lucide-sun'
  return 'i-lucide-moon'
})

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

// Ctrl+K / Cmd+K keyboard shortcut to open search
defineShortcuts({
  meta_k: () => { searchOpen.value = true },
})
</script>

<template>
  <!-- Single-row header -->
  <header class="sticky top-0 z-50 border-b border-default bg-default/80 backdrop-blur-lg">
    <UContainer>
      <div class="flex items-center h-14 gap-6">
        <!-- Logo / Home -->
        <NuxtLink to="/" class="text-lg font-bold text-default shrink-0">
          DeFlow Docs
        </NuxtLink>

        <!-- Section tabs (center) -->
        <nav class="hidden md:flex items-center gap-1 flex-1">
          <template v-for="section in sections" :key="section.key">
            <!-- Disabled tab (Coming Soon) -->
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
            <!-- Active tab -->
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

        <!-- Right: search bar + color mode dropdown -->
        <div class="flex items-center gap-2 shrink-0">
          <!-- Inline search bar trigger -->
          <button
            class="hidden sm:flex items-center gap-2 px-3 py-1.5 w-56 text-sm text-muted rounded-lg border border-default bg-elevated hover:bg-accented transition-colors cursor-text"
            @click="searchOpen = true"
          >
            <UIcon name="i-lucide-search" class="size-4 shrink-0" />
            <span class="flex-1 text-left">Search...</span>
            <kbd class="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono font-medium text-muted bg-default border border-default rounded">
              Ctrl K
            </kbd>
          </button>

          <!-- Color mode dropdown -->
          <UDropdownMenu :items="colorModeItems">
            <UButton
              :icon="colorModeIcon"
              color="neutral"
              variant="ghost"
              aria-label="Color mode"
            />
          </UDropdownMenu>
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

  <!-- Search modal controlled by v-model -->
  <UContentSearch v-model="searchOpen" />
</template>
