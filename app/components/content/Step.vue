<script setup lang="ts">
/**
 * Step: Individual step within a StepGuide.
 * Usage in markdown:
 *   :::step{title="Step Title" n="1"}
 *   Step description content.
 *   :::
 */
const props = withDefaults(defineProps<{
  title: string
  n?: string | number
}>(), {
  n: '',
})
</script>

<template>
  <div class="relative mb-8 last:mb-0">
    <div
      class="absolute -left-8 -translate-x-1/2 flex items-center justify-center w-7 h-7 rounded-full bg-primary text-white text-xs font-bold z-10"
    >
      {{ props.n }}
    </div>
    <div class="pt-0.5">
      <div class="text-lg font-semibold text-default mb-1">
        {{ props.title }}
      </div>
      <div class="text-muted">
        <slot />
      </div>
    </div>
  </div>
</template>
