<script setup lang="ts">
/**
 * Callout: MDC component for highlighted information blocks.
 * Maps to Nuxt UI's UAlert component for native styling.
 * Usage in markdown:
 *   ::callout{type="tip"}
 *   Your tip content here.
 *   ::
 */
const props = withDefaults(defineProps<{
  type?: 'note' | 'tip' | 'warning' | 'danger'
}>(), {
  type: 'note',
})

const colorMap: Record<string, string> = {
  note: 'info',
  tip: 'success',
  warning: 'warning',
  danger: 'error',
}

const iconMap: Record<string, string> = {
  note: 'i-lucide-info',
  tip: 'i-lucide-lightbulb',
  warning: 'i-lucide-triangle-alert',
  danger: 'i-lucide-shield-alert',
}

const titleMap: Record<string, string> = {
  note: 'Note',
  tip: 'Tip',
  warning: 'Warning',
  danger: 'Danger',
}
</script>

<template>
  <UAlert
    :color="colorMap[props.type] as any"
    :icon="iconMap[props.type]"
    :title="titleMap[props.type]"
    variant="subtle"
    class="my-6"
  >
    <template #description>
      <slot />
    </template>
  </UAlert>
</template>
