<script setup lang="ts">
/**
 * MermaidDiagram: Client-side Mermaid diagram renderer with zoom/pan.
 * Renders mermaid source as SVG with DeFlow dark theme.
 * Includes fullscreen toggle and mouse wheel zoom for large diagrams.
 */
import { ref, onMounted, watch, onUnmounted, computed, nextTick } from 'vue'

const props = defineProps<{
  code: string
}>()

const svgContent = ref('')
const isFullscreen = ref(false)
const scale = ref(1)
const translateX = ref(0)
const translateY = ref(0)
const renderError = ref('')
let isDragging = false
let dragStartX = 0
let dragStartY = 0
let startTranslateX = 0
let startTranslateY = 0
let renderCount = 0

/**
 * Renders the Mermaid diagram with DeFlow-branded dark theme.
 * Uses a unique ID per render call to avoid mermaid ID collisions.
 */
async function renderDiagram() {
  if (!props.code) {
    renderError.value = 'No diagram code provided'
    return
  }

  renderCount++
  const id = `mermaid-${Date.now()}-${renderCount}`

  try {
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

    const { svg } = await mermaid.render(id, props.code)
    svgContent.value = svg
    renderError.value = ''
  } catch (e: any) {
    console.warn('[MermaidDiagram] Render failed:', e)
    renderError.value = e?.message || 'Failed to render diagram'
    svgContent.value = ''
  }
}

function handleWheel(e: WheelEvent) {
  e.preventDefault()
  const delta = e.deltaY > 0 ? -0.1 : 0.1
  scale.value = Math.max(0.3, Math.min(3, scale.value + delta))
}

function handleMouseDown(e: MouseEvent) {
  isDragging = true
  dragStartX = e.clientX
  dragStartY = e.clientY
  startTranslateX = translateX.value
  startTranslateY = translateY.value
}

function handleMouseMove(e: MouseEvent) {
  if (!isDragging) return
  translateX.value = startTranslateX + (e.clientX - dragStartX)
  translateY.value = startTranslateY + (e.clientY - dragStartY)
}

function handleMouseUp() {
  isDragging = false
}

function toggleFullscreen() {
  isFullscreen.value = !isFullscreen.value
  if (isFullscreen.value) {
    scale.value = 1
    translateX.value = 0
    translateY.value = 0
  }
}

function resetView() {
  scale.value = 1
  translateX.value = 0
  translateY.value = 0
}

function zoomIn() {
  scale.value = Math.min(3, scale.value + 0.2)
}

function zoomOut() {
  scale.value = Math.max(0.3, scale.value - 0.2)
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && isFullscreen.value) {
    isFullscreen.value = false
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
  nextTick(() => renderDiagram())
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})

watch(() => props.code, () => nextTick(() => renderDiagram()))

const transformStyle = computed(() => ({
  transform: `translate(${translateX.value}px, ${translateY.value}px) scale(${scale.value})`,
  cursor: isDragging ? 'grabbing' : 'grab',
}))
</script>

<template>
  <div class="mermaid-wrapper my-6 relative group">
    <div class="rounded-lg bg-[#0f172a] border border-default overflow-hidden">
      <!-- Toolbar -->
      <div class="flex items-center justify-between px-3 py-1.5 border-b border-white/10 bg-[#1e293b]">
        <span class="text-xs text-slate-400 font-medium">Diagram</span>
        <div class="flex items-center gap-0.5">
          <!-- Zoom out -->
          <button
            class="p-1.5 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            title="Zoom out"
            @click="zoomOut"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/><line x1="8" x2="14" y1="11" y2="11"/></svg>
          </button>
          <!-- Zoom level -->
          <span class="text-[10px] text-slate-500 w-8 text-center tabular-nums">{{ Math.round(scale * 100) }}%</span>
          <!-- Zoom in -->
          <button
            class="p-1.5 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            title="Zoom in"
            @click="zoomIn"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/><line x1="11" x2="11" y1="8" y2="14"/><line x1="8" x2="14" y1="11" y2="11"/></svg>
          </button>
          <!-- Separator -->
          <div class="w-px h-4 bg-white/10 mx-1" />
          <!-- Reset view -->
          <button
            class="p-1.5 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            title="Reset view"
            @click="resetView"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" x2="14" y1="3" y2="10"/><line x1="3" x2="10" y1="21" y2="14"/></svg>
          </button>
          <!-- Fullscreen -->
          <button
            class="p-1.5 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            title="Fullscreen (Esc to close)"
            @click="toggleFullscreen"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><polyline points="21 15 21 21 15 21"/><polyline points="3 9 3 3 9 3"/></svg>
          </button>
        </div>
      </div>

      <!-- Diagram content -->
      <div
        class="p-4 overflow-auto max-h-125 flex justify-center"
        @wheel.prevent="handleWheel"
        @mousedown="handleMouseDown"
        @mousemove="handleMouseMove"
        @mouseup="handleMouseUp"
        @mouseleave="handleMouseUp"
      >
        <div v-if="svgContent" :style="transformStyle" class="transition-transform duration-100 origin-center" v-html="svgContent" />
        <div v-else-if="renderError" class="text-red-400/70 text-sm py-8">{{ renderError }}</div>
        <div v-else class="text-muted text-sm py-8 animate-pulse">Rendering diagram...</div>
      </div>

      <!-- Zoom hint (only show when diagram loaded) -->
      <div v-if="svgContent" class="px-3 py-1 text-[10px] text-slate-500 text-center border-t border-white/10">
        Scroll or use +/− to zoom · Drag to pan
      </div>
    </div>

    <!-- Fullscreen overlay (inline, no Teleport to avoid fragment root) -->
    <div
      v-if="isFullscreen"
      class="fixed inset-0 z-100 bg-[#0a0a0f]/95 backdrop-blur-sm flex flex-col"
    >
      <div class="flex items-center justify-between px-6 py-3 border-b border-default">
        <span class="text-sm font-medium text-default">Diagram — Fullscreen</span>
        <div class="flex items-center gap-2">
          <button
            class="px-2 py-1 rounded text-xs text-muted hover:text-default hover:bg-elevated transition-colors"
            @click="resetView"
          >
            Reset
          </button>
          <button
            class="px-2 py-1 rounded text-xs text-muted hover:text-default hover:bg-elevated transition-colors"
            @click="toggleFullscreen"
          >
            Close (Esc)
          </button>
        </div>
      </div>

      <div
        class="flex-1 overflow-hidden flex items-center justify-center"
        @wheel.prevent="handleWheel"
        @mousedown="handleMouseDown"
        @mousemove="handleMouseMove"
        @mouseup="handleMouseUp"
        @mouseleave="handleMouseUp"
      >
        <div v-if="svgContent" :style="transformStyle" class="transition-transform duration-100 origin-center" v-html="svgContent" />
      </div>

      <div class="px-6 py-2 text-xs text-muted text-center border-t border-default">
        Scroll to zoom · Drag to pan · {{ Math.round(scale * 100) }}%
      </div>
    </div>
  </div>
</template>

<style>
.mermaid-wrapper svg {
  max-width: 100%;
  height: auto;
}
</style>
