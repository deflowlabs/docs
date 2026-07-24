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
  <div class="step">
    <div class="step__indicator">{{ props.n }}</div>
    <div class="step__line" />
    <div class="step__content">
      <div class="step__title">{{ props.title }}</div>
      <div class="step__body">
        <slot />
      </div>
    </div>
  </div>
</template>
