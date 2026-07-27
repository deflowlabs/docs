<script setup lang="ts">
/**
 * MermaidDiagram: Client-side Mermaid diagram renderer with zoom/pan.
 * Renders mermaid source as SVG with DeFlow dark theme.
 * Includes fullscreen toggle and mouse wheel zoom for large diagrams.
 */
import { ref, onMounted, watch, onUnmounted } from 'vue'

const props = defineProps<{
  code: string
}>()

const container = ref<HTMLDivElement>()
const svgContent = ref('')
const diagramId = `mermaid-${Math.random().toString(36).substring(2, 9)}`
const isFullscreen = ref(false)
const scale = ref(1)
const translateX = ref(0)
const translateY = ref(0)
let isDragging = false
let dragStartX = 0
let dragStartY = 0
let startTranslateX = 0
let startTranslateY = 0

/**
 * Renders the Mermaid diagram with DeFlow-branded dark theme.
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

/** Zoom with mouse wheel */
function handleWheel(e: WheelEvent) {
  e.preventDefault()
  const delta = e.deltaY > 0 ? -0.1 : 0.1
  scale.value = Math.max(0.3, Math.min(3, scale.value + delta))
}

/** Pan with mouse drag */
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

/** Toggle fullscreen overlay */
function toggleFullscreen() {
  isFullscreen.value = !isFullscreen.value
  if (isFullscreen.value) {
    // Reset transform when entering fullscreen
    scale.value = 1
    translateX.value = 0
    translateY.value = 0
  }
}

/** Reset zoom/pan */
function resetView() {
  scale.value = 1
  translateX.value = 0
  translateY.value = 0
}

/** Close fullscreen on Escape */
function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && isFullscreen.value) {
    isFullscreen.value = false
  }
}

onMounted(() => {
  renderDiagram()
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})

watch(() => props.code, renderDiagram)

const transformStyle = computed(() => ({
  transform: `translate(${translateX.value}px, ${translateY.value}px) scale(${scale.value})`,
  cursor: isDragging ? 'grabbing' : 'grab',
}))
</script>

<template>
  <!-- Inline diagram with expand button -->
  <div class="mermaid-wrapper my-6 relative group">
    <div class="rounded-lg bg-[#0f172a] border border-[var(--ui-border)] overflow-hidden">
      <!-- Toolbar -->
      <div class="flex items-center justify-between px-3 py-1.5 border-b border-[var(--ui-border)] bg-[#0f172a]/80">
        <span class="text-xs text-[var(--ui-text-muted)] font-medium">Diagram</span>
        <div class="flex items-center gap-1">
          <button
            class="p-1 rounded hover:bg-[var(--ui-bg-elevated)] text-[var(--ui-text-muted)] hover:text-[var(--ui-text)] transition-colors"
            title="Reset view"
            @click="resetView"
          >
            <UIcon name="i-lucide-maximize-2" class="size-3.5" />
          </button>
          <button
            class="p-1 rounded hover:bg-[var(--ui-bg-elevated)] text-[var(--ui-text-muted)] hover:text-[var(--ui-text)] transition-colors"
            title="Fullscreen (Esc to close)"
            @click="toggleFullscreen"
          >
            <UIcon name="i-lucide-expand" class="size-3.5" />
          </button>
        </div>
      </div>

      <!-- Diagram content (inline) -->
      <div
        class="p-4 overflow-auto max-h-[500px] flex justify-center"
        @wheel.prevent="handleWheel"
        @mousedown="handleMouseDown"
        @mousemove="handleMouseMove"
        @mouseup="handleMouseUp"
        @mouseleave="handleMouseUp"
      >
        <div v-if="svgContent" :style="transformStyle" class="transition-transform duration-100 origin-center" v-html="svgContent" />
        <div v-else class="text-[var(--ui-text-muted)] text-sm py-8">Loading diagram...</div>
      </div>

      <!-- Zoom hint -->
      <div class="px-3 py-1 text-[10px] text-[var(--ui-text-muted)] text-center border-t border-[var(--ui-border)]">
        Scroll to zoom · Drag to pan · Click expand for fullscreen
      </div>
    </div>
  </div>

  <!-- Fullscreen overlay -->
  <Teleport to="body">
    <div
      v-if="isFullscreen"
      class="fixed inset-0 z-[100] bg-[#0a0a0f]/95 backdrop-blur-sm flex flex-col"
    >
      <!-- Fullscreen toolbar -->
      <div class="flex items-center justify-between px-6 py-3 border-b border-[var(--ui-border)]">
        <span class="text-sm font-medium text-[var(--ui-text)]">Diagram — Fullscreen</span>
        <div class="flex items-center gap-2">
          <button
            class="px-2 py-1 rounded text-xs text-[var(--ui-text-muted)] hover:text-[var(--ui-text)] hover:bg-[var(--ui-bg-elevated)] transition-colors"
            @click="resetView"
          >
            Reset
          </button>
          <button
            class="px-2 py-1 rounded text-xs text-[var(--ui-text-muted)] hover:text-[var(--ui-text)] hover:bg-[var(--ui-bg-elevated)] transition-colors"
            @click="toggleFullscreen"
          >
            Close (Esc)
          </button>
        </div>
      </div>

      <!-- Fullscreen diagram -->
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

      <div class="px-6 py-2 text-xs text-[var(--ui-text-muted)] text-center border-t border-[var(--ui-border)]">
        Scroll to zoom · Drag to pan · {{ Math.round(scale * 100) }}%
      </div>
    </div>
  </Teleport>
</template>

<style>
.mermaid-wrapper svg {
  max-width: 100%;
  height: auto;
}
</style>
