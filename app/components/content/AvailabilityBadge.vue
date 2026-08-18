<script setup lang="ts">
/** Maps canonical release states to consistent, accessible Nuxt UI badges. */
const props = defineProps<{ status: 'private-beta' | 'limited-beta' | 'planned' | 'internal' }>()
const config = {
  'private-beta': { label: 'Private beta', color: 'warning' },
  'limited-beta': { label: 'Limited beta', color: 'info' },
  planned: { label: 'Planned', color: 'neutral' },
  internal: { label: 'Internal', color: 'error' },
} as const
</script>

<template>
  <UBadge :label="config[props.status].label" :color="config[props.status].color" variant="subtle" size="sm" />
</template>
