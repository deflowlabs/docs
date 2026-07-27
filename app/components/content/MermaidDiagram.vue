<script setup lang="ts">
/**
 * MermaidDiagram: Client-side Mermaid diagram renderer.
 * Receives raw mermaid source code and renders it as SVG.
 * Uses DeFlow dark theme for institutional-grade visuals.
 */
import { ref, onMounted, watch } from 'vue'

const props = defineProps<{
  code: string
}>()

const container = ref<HTMLDivElement>()
const svgContent = ref('')
const diagramId = `mermaid-${Math.random().toString(36).substring(2, 9)}`

/**
 * Renders the Mermaid diagram with DeFlow-branded dark theme.
 * Runs client-side only since mermaid requires DOM access.
 */
async function renderDiagram() {
  if (!props.code || !container.value) return

  const { default: mermaid } = await import('mermaid')

  mermaid.initialize({
    startOnLoad: false,
    theme: 'dark',
    darkMode: true,
    fontFamily: 'Inter, system-ui, sans-serif',
    themeVariables: {
      primaryColor: '#0ea5e9',
      primaryTextColor: '#e2e8f0',
      primaryBorderColor: '#334155',
      secondaryColor: '#1e293b',
      secondaryTextColor: '#cbd5e1',
      tertiaryColor: '#0f172a',
      lineColor: '#475569',
      textColor: '#e2e8f0',
      mainBkg: '#1e293b',
      nodeBorder: '#334155',
      clusterBkg: '#0f172a',
      clusterBorder: '#334155',
      titleColor: '#e2e8f0',
      edgeLabelBackground: '#1e293b',
      nodeTextColor: '#e2e8f0',
    },
  })

  try {
    const { svg } = await mermaid.render(diagramId, props.code)
    svgContent.value = svg
  } catch (e) {
    console.warn('[MermaidDiagram] Render failed:', e)
    svgContent.value = ''
  }
}

onMounted(renderDiagram)
watch(() => props.code, renderDiagram)
</script>

<template>
  <div
    ref="container"
    class="mermaid-diagram my-6 flex justify-center rounded-lg bg-[#0f172a] border border-default p-6 overflow-x-auto"
  >
    <div v-if="svgContent" v-html="svgContent" />
    <div v-else class="text-muted text-sm">Loading diagram...</div>
  </div>
</template>

<style>
/* Ensure Mermaid SVGs are responsive */
.mermaid-diagram svg {
  max-width: 100%;
  height: auto;
}
</style>
