<script setup lang="ts">
/**
 * ProsePre: Override for Nuxt Content's default <pre> rendering.
 * Intercepts ```mermaid code blocks and renders them as diagrams.
 * In Nuxt Content v3 / MDC, the code text comes via the default slot,
 * not a `code` prop. We extract raw text from slot vnodes.
 */
import { useSlots, computed } from 'vue'

const props = defineProps<{
  code?: string
  language?: string
  filename?: string
  highlights?: number[]
  meta?: string
}>()

const slots = useSlots()

/**
 * Extracts raw text from slot vnodes recursively.
 * MDC renders code as nested vnodes; we need plain text for mermaid.
 */
function extractText(vnodes: any[]): string {
  let text = ''
  for (const vnode of vnodes) {
    if (typeof vnode === 'string') {
      text += vnode
    } else if (vnode?.children) {
      if (typeof vnode.children === 'string') {
        text += vnode.children
      } else if (Array.isArray(vnode.children)) {
        text += extractText(vnode.children)
      }
    }
  }
  return text
}

/**
 * The mermaid source code, extracted from either
 * the `code` prop (if available) or the default slot vnodes.
 */
const mermaidCode = computed(() => {
  if (props.code) return props.code
  const defaultSlot = slots.default?.()
  if (defaultSlot) return extractText(defaultSlot).trim()
  return ''
})
</script>

<template>
  <ClientOnly v-if="language === 'mermaid'">
    <MermaidDiagram :code="mermaidCode" />
    <template #fallback>
      <div class="my-6 flex justify-center rounded-lg bg-[#0f172a] border border-default p-6">
        <div class="text-muted text-sm">Loading diagram...</div>
      </div>
    </template>
  </ClientOnly>
  <pre v-else :class="`language-${language}`"><slot /></pre>
</template>
