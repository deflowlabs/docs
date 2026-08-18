<script setup lang="ts">
/** Renders every canonical capability as a status-labelled summary card. */
const { data: facts } = await useAsyncData('product-availability', () => queryCollection('productFacts').first())
</script>

<template>
  <div v-if="facts" class="my-6 grid gap-3 sm:grid-cols-2">
    <article v-for="feature in facts.features" :key="feature.id" class="rounded-lg border border-(--ui-border) bg-(--ui-bg-elevated) p-4">
      <div class="mb-2 flex items-start justify-between gap-3">
        <h3 class="m-0 text-base font-semibold">{{ feature.label }}</h3>
        <AvailabilityBadge :status="feature.availability" />
      </div>
      <p class="m-0 text-sm text-(--ui-text-muted)">{{ feature.note }}</p>
    </article>
  </div>
</template>
