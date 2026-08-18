<script setup lang="ts">
/**
 * ProsePre: Override for Nuxt Content / MDC default <pre> rendering.
 * Intercepts ```mermaid code blocks and renders them as diagrams.
 *
 * MDC passes code blocks with props: { language, code, filename, ... }
 * The `code` prop contains the raw source text.
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
 * Recursively extracts raw text content from VNode trees.
 */
function extractText(nodes: any): string {
  if (!nodes) return ''
  if (typeof nodes === 'string') return nodes
  if (Array.isArray(nodes)) return nodes.map(extractText).join('')
  if (nodes?.children != null) {
    if (typeof nodes.children === 'string') return nodes.children
    if (Array.isArray(nodes.children)) return extractText(nodes.children)
    if (typeof nodes.children === 'object' && nodes.children.default) {
      return extractText(nodes.children.default())
    }
  }
  if (typeof nodes?.type === 'symbol' || nodes?.type === 3) {
    return String(nodes?.children || '')
  }
  return ''
}

/**
 * Raw code text: prefer `code` prop, fallback to slot extraction.
 */
const mermaidCode = computed(() => {
  if (props.code) return props.code.trim()
  const defaultSlot = slots.default?.()
  if (defaultSlot) {
    const text = extractText(defaultSlot)
    if (text.trim()) return text.trim()
  }
  return ''
})

const isMermaid = computed(() => props.language === 'mermaid')
</script>

<template>
  <ClientOnly v-if="isMermaid && mermaidCode">
    <MermaidDiagram :code="mermaidCode" :label="filename || 'Process diagram'" />
    <template #fallback>
      <div class="my-6 flex justify-center rounded-lg bg-[#0f172a] border border-default p-8">
        <div class="text-muted text-sm animate-pulse">Rendering diagram...</div>
      </div>
    </template>
  </ClientOnly>
  <div v-else-if="isMermaid" class="my-6 flex justify-center rounded-lg bg-[#0f172a] border border-default p-8">
    <div class="text-muted text-sm">Diagram unavailable</div>
  </div>
  <pre v-else :class="`language-${language}`"><slot /></pre>
</template>
