<script setup lang="ts">
/**
 * Callout: MDC component for highlighted information blocks.
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

const iconMap: Record<string, string> = {
  note: 'lucide:info',
  tip: 'lucide:lightbulb',
  warning: 'lucide:triangle-alert',
  danger: 'lucide:shield-alert',
}
</script>

<template>
  <div :class="`callout callout--${props.type}`" role="alert">
    <Icon :name="iconMap[props.type]" size="18" class="callout__icon" />
    <div class="callout__content">
      <slot />
    </div>
  </div>
</template>
