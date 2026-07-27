<script setup lang="ts">
/**
 * ProsePre: Override for Nuxt Content's default <pre> rendering.
 * Intercepts ```mermaid code blocks and renders them as diagrams.
 * All other code blocks render with the default syntax highlighting.
 */
const props = defineProps<{
  code?: string
  language?: string
  filename?: string
  highlights?: number[]
  meta?: string
}>()
</script>

<template>
  <ClientOnly v-if="language === 'mermaid'">
    <MermaidDiagram :code="code || ''" />
    <template #fallback>
      <div class="my-6 flex justify-center rounded-lg bg-[#0f172a] border border-default p-6">
        <div class="text-muted text-sm">Loading diagram...</div>
      </div>
    </template>
  </ClientOnly>
  <pre v-else :class="`language-${language}`"><slot /></pre>
</template>
