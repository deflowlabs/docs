<script setup lang="ts">
/**
 * DocsLayout: Primary documentation layout with sidebar navigation,
 * table of contents, and responsive header.
 */
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const sidebarOpen = ref(false)
const activeHeading = ref('')

/* ──────────────────────────────
 * Navigation structure
 * ────────────────────────────── */
const navigation = [
  {
    title: 'Getting Started',
    icon: 'lucide:rocket',
    items: [
      { title: 'What is DeFlow?', path: '/getting-started/what-is-deflow' },
      { title: 'Creating Your Account', path: '/getting-started/creating-your-account' },
      { title: 'Identity Verification', path: '/getting-started/identity-verification' },
      { title: 'Platform Walkthrough', path: '/getting-started/platform-walkthrough' },
    ],
  },
  {
    title: 'Trading',
    icon: 'lucide:arrow-right-left',
    items: [
      { title: 'OTC Deal Lifecycle', path: '/trading/otc-deal-lifecycle' },
      { title: 'Creating a Deal', path: '/trading/creating-a-deal' },
      { title: 'Escrow and Funding', path: '/trading/escrow-and-funding' },
      { title: 'Settlement', path: '/trading/settlement' },
    ],
  },
  {
    title: 'Rewards and Growth',
    icon: 'lucide:trophy',
    items: [
      { title: 'VIP Tiers', path: '/rewards/vip-tiers' },
      { title: 'Referral Program', path: '/rewards/referral-program' },
      { title: 'Ranks System', path: '/rewards/ranks-system' },
    ],
  },
  {
    title: 'Security',
    icon: 'lucide:shield-check',
    items: [
      { title: 'Zero-PII Policy', path: '/security/zero-pii-policy' },
      { title: 'Smart Contract Security', path: '/security/smart-contract-security' },
    ],
  },
  {
    title: 'Partners',
    icon: 'lucide:handshake',
    items: [
      { title: 'Partner Program', path: '/partners/partner-program' },
      { title: 'Contact', path: '/partners/contact' },
    ],
  },
  {
    title: 'Support',
    icon: 'lucide:life-buoy',
    items: [
      { title: 'FAQ', path: '/support/faq' },
      { title: 'Glossary', path: '/support/glossary' },
    ],
  },
]

/**
 * Determines whether a given navigation item is the current active page.
 */
function isActive(path: string): boolean {
  return route.path === path || route.path === `${path}/`
}

/**
 * Generates breadcrumb segments from the current route path.
 */
const breadcrumbs = computed(() => {
  const parts = route.path.split('/').filter(Boolean)
  return parts.map((part, i) => ({
    label: part
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase()),
    path: '/' + parts.slice(0, i + 1).join('/'),
    isLast: i === parts.length - 1,
  }))
})

/* ──────────────────────────────
 * Table of Contents tracking
 * ────────────────────────────── */
const tocItems = ref<{ id: string; text: string; depth: number }[]>([])

function buildToc() {
  const headings = document.querySelectorAll('.docs-content h2, .docs-content h3')
  tocItems.value = Array.from(headings).map((el) => ({
    id: el.id,
    text: el.textContent || '',
    depth: el.tagName === 'H2' ? 2 : 3,
  }))
}

let observer: IntersectionObserver | null = null

function setupScrollSpy() {
  if (observer) observer.disconnect()
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          activeHeading.value = entry.target.id
        }
      }
    },
    { rootMargin: '-80px 0px -60% 0px', threshold: 0.1 },
  )
  document.querySelectorAll('.docs-content h2, .docs-content h3').forEach((el) => {
    observer!.observe(el)
  })
}

watch(
  () => route.path,
  () => {
    sidebarOpen.value = false
    setTimeout(() => {
      buildToc()
      setupScrollSpy()
    }, 200)
  },
)

onMounted(() => {
  setTimeout(() => {
    buildToc()
    setupScrollSpy()
  }, 200)
})

onUnmounted(() => {
  if (observer) observer.disconnect()
})
</script>

<template>
  <div class="docs-layout">
    <!-- Header -->
    <header class="docs-header">
      <button
        class="mobile-menu-btn"
        aria-label="Toggle navigation menu"
        @click="sidebarOpen = !sidebarOpen"
      >
        <Icon name="lucide:menu" size="20" />
      </button>

      <NuxtLink to="/" class="docs-header__logo">
        <span class="docs-header__logo-icon">&#9670;</span>
        <span>DeFlow</span>
        <span class="docs-header__badge">Docs</span>
      </NuxtLink>

      <div class="docs-header__actions">
        <NuxtLink
          to="https://deflowlabs.io"
          target="_blank"
          class="docs-header__link"
          aria-label="DeFlow website"
        >
          <Icon name="lucide:globe" size="18" />
        </NuxtLink>
        <NuxtLink
          to="https://github.com/DeFlowLabs"
          target="_blank"
          class="docs-header__link"
          aria-label="GitHub"
        >
          <Icon name="lucide:github" size="18" />
        </NuxtLink>
      </div>
    </header>

    <!-- Sidebar -->
    <aside class="docs-sidebar" :class="{ 'docs-sidebar--open': sidebarOpen }">
      <nav>
        <div v-for="section in navigation" :key="section.title" class="nav-section">
          <div class="nav-section__title">{{ section.title }}</div>
          <NuxtLink
            v-for="item in section.items"
            :key="item.path"
            :to="item.path"
            class="nav-link"
            :class="{ 'nav-link--active': isActive(item.path) }"
          >
            {{ item.title }}
          </NuxtLink>
        </div>
      </nav>
    </aside>

    <!-- Main Content -->
    <main class="docs-main">
      <div class="docs-content">
        <!-- Breadcrumbs -->
        <div v-if="breadcrumbs.length > 0" class="breadcrumbs">
          <NuxtLink to="/">Docs</NuxtLink>
          <template v-for="crumb in breadcrumbs" :key="crumb.path">
            <span class="breadcrumbs__sep">/</span>
            <span v-if="crumb.isLast">{{ crumb.label }}</span>
            <NuxtLink v-else :to="crumb.path">{{ crumb.label }}</NuxtLink>
          </template>
        </div>

        <!-- Page content rendered here -->
        <article class="prose">
          <slot />
        </article>
      </div>
    </main>

    <!-- Table of Contents -->
    <aside v-if="tocItems.length > 0" class="docs-toc">
      <div class="toc__title">On this page</div>
      <a
        v-for="item in tocItems"
        :key="item.id"
        :href="`#${item.id}`"
        class="toc__link"
        :class="{
          'toc__link--active': activeHeading === item.id,
          'toc__link--depth-3': item.depth === 3,
        }"
      >
        {{ item.text }}
      </a>
    </aside>

    <!-- Sidebar overlay for mobile -->
    <div
      v-if="sidebarOpen"
      class="fixed inset-0 bg-black/50 z-10 lg:hidden"
      @click="sidebarOpen = false"
    />
  </div>
</template>
