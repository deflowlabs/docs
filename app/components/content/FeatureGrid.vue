<script setup lang="ts">
/** A reusable visual index for product areas and documentation journeys. */
interface FeatureItem {
  title: string
  description: string
  icon?: string
  to: string
  label?: string
}

defineProps<{ items: FeatureItem[] }>()
</script>

<template>
  <ul class="not-prose my-6 grid list-none gap-4 p-0 sm:grid-cols-2" aria-label="Documentation topics">
    <li v-for="item in items" :key="item.to">
      <NuxtLink
        :to="item.to"
        class="group flex h-full flex-col rounded-xl border border-(--ui-border) bg-(--ui-bg-elevated) p-5 transition hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-lg focus-visible:outline-3 motion-reduce:transform-none"
      >
        <div class="mb-4 flex items-start justify-between gap-3">
          <span class="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <UIcon :name="item.icon || 'i-lucide-book-open'" class="size-5" aria-hidden="true" />
          </span>
          <UBadge v-if="item.label" :label="item.label" color="neutral" variant="subtle" size="xs" />
        </div>
        <span class="font-semibold text-(--ui-text-highlighted) group-hover:text-primary">{{ item.title }}</span>
        <span class="mt-2 text-sm leading-6 text-(--ui-text-muted)">{{ item.description }}</span>
        <span class="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
          Open guide <UIcon name="i-lucide-arrow-right" class="size-4" aria-hidden="true" />
        </span>
      </NuxtLink>
    </li>
  </ul>
</template>
