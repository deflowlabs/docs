<script setup lang="ts">
/**
 * Accessible Mermaid renderer used by Markdown code fences.
 *
 * The rendered SVG is visual content only: the human-readable fence label is
 * exposed as its accessible name. Raw Mermaid syntax is deliberately not shown
 * to readers because it is implementation detail rather than user guidance.
 */
const props = withDefaults(defineProps<{ code: string, label?: string }>(), { label: 'Process diagram' })
const colorMode = useColorMode()
const componentId = useId()
const captionId = `${componentId}-caption`
const descriptionId = `${componentId}-description`
const svgContent = ref('')
const renderError = ref('')
const isFullscreen = ref(false)
const scale = ref(1)
const translateX = ref(0)
const translateY = ref(0)
const dialog = ref<HTMLElement | null>(null)
let previousFocus: HTMLElement | null = null
let isDragging = false
let dragStartX = 0
let dragStartY = 0
let startTranslateX = 0
let startTranslateY = 0
let renderCount = 0

async function renderDiagram() {
  if (!props.code) return
  try {
    const { default: mermaid } = await import('mermaid')
    const dark = colorMode.value === 'dark'
    mermaid.initialize({
      startOnLoad: false,
      theme: dark ? 'dark' : 'neutral',
      darkMode: dark,
      securityLevel: 'strict',
      fontFamily: 'Geist, Inter, system-ui, sans-serif',
    })
    const { svg } = await mermaid.render(`mermaid-${Date.now()}-${++renderCount}`, props.code)
    svgContent.value = svg
    renderError.value = ''
  } catch (error: any) {
    renderError.value = error?.message || 'The diagram could not be rendered.'
    svgContent.value = ''
  }
}

/** Restore the diagram to its initial pan and zoom position. */
function resetView() {
  scale.value = 1
  translateX.value = 0
  translateY.value = 0
}

/** Apply a bounded zoom increment so the diagram cannot disappear or overflow excessively. */
function zoom(delta: number) {
  scale.value = Math.max(0.4, Math.min(3, scale.value + delta))
}

/** Translate a wheel gesture into the same bounded zoom behaviour as the buttons. */
function handleWheel(event: WheelEvent) {
  zoom(event.deltaY > 0 ? -0.1 : 0.1)
}

/** Start pointer-based panning while retaining the previous translation. */
function handleMouseDown(event: MouseEvent) {
  isDragging = true
  dragStartX = event.clientX
  dragStartY = event.clientY
  startTranslateX = translateX.value
  startTranslateY = translateY.value
}

/** Move the diagram only while a pointer drag is active. */
function handleMouseMove(event: MouseEvent) {
  if (!isDragging) return
  translateX.value = startTranslateX + event.clientX - dragStartX
  translateY.value = startTranslateY + event.clientY - dragStartY
}

/** End pointer panning when the pointer is released or leaves the viewport. */
function stopDragging() {
  isDragging = false
}

/** Open the modal view and remember where keyboard focus must return. */
function openFullscreen() {
  previousFocus = document.activeElement as HTMLElement
  resetView()
  isFullscreen.value = true
}

/** Close the modal view and restore focus to its launch control. */
function closeFullscreen() {
  isFullscreen.value = false
  nextTick(() => previousFocus?.focus())
}

/** Support Escape, keyboard zoom and a contained Tab sequence in the modal. */
function handleKeydown(event: KeyboardEvent) {
  if (!isFullscreen.value) return
  if (event.key === 'Escape') {
    event.preventDefault()
    closeFullscreen()
    return
  }
  if (event.key === '+' || event.key === '=') zoom(0.2)
  if (event.key === '-') zoom(-0.2)
  if (event.key === '0') resetView()
  if (event.key !== 'Tab' || !dialog.value) return
  const focusable = [...dialog.value.querySelectorAll<HTMLElement>('button, [href], [tabindex]:not([tabindex="-1"])')].filter(element => !element.hasAttribute('disabled'))
  const first = focusable[0]
  const last = focusable.at(-1)
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
  if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
}

const transformStyle = computed(() => ({
  transform: `translate(${translateX.value}px, ${translateY.value}px) scale(${scale.value})`,
  cursor: isDragging ? 'grabbing' : 'grab',
}))

watch(() => props.code, renderDiagram)
watch(() => colorMode.value, renderDiagram)
watch(isFullscreen, async open => {
  document.body.style.overflow = open ? 'hidden' : ''
  if (open) {
    await nextTick()
    dialog.value?.querySelector<HTMLElement>('[aria-label="Close fullscreen diagram"]')?.focus()
  }
})
onMounted(() => { document.addEventListener('keydown', handleKeydown); renderDiagram() })
onUnmounted(() => { document.removeEventListener('keydown', handleKeydown); document.body.style.overflow = '' })
</script>

<template>
  <figure class="mermaid-diagram my-6 overflow-hidden rounded-lg border border-(--ui-border) bg-(--ui-bg-elevated)">
    <div class="flex items-center justify-between border-b border-(--ui-border) px-3 py-2">
      <figcaption :id="captionId" class="text-xs font-medium text-(--ui-text-muted)">{{ props.label }}</figcaption>
      <div class="flex items-center gap-1" role="toolbar" aria-label="Diagram controls">
        <UButton type="button" icon="i-lucide-zoom-out" color="neutral" variant="ghost" size="xs" aria-label="Zoom diagram out" @click="zoom(-0.2)" />
        <span class="w-10 text-center text-xs tabular-nums text-(--ui-text-dimmed)" aria-live="polite">{{ Math.round(scale * 100) }}%</span>
        <UButton type="button" icon="i-lucide-zoom-in" color="neutral" variant="ghost" size="xs" aria-label="Zoom diagram in" @click="zoom(0.2)" />
        <UButton type="button" icon="i-lucide-rotate-ccw" color="neutral" variant="ghost" size="xs" aria-label="Reset diagram view" @click="resetView" />
        <UButton type="button" icon="i-lucide-maximize-2" color="neutral" variant="ghost" size="xs" aria-label="Open diagram in fullscreen" @click="openFullscreen" />
      </div>
    </div>

    <p :id="descriptionId" class="sr-only">Interactive process diagram. Use the labelled controls to zoom, reset, or open a larger view.</p>
    <div class="flex max-h-125 justify-center overflow-auto p-4" role="img" :aria-labelledby="captionId" :aria-describedby="descriptionId" tabindex="0" @wheel.prevent="handleWheel" @mousedown="handleMouseDown" @mousemove="handleMouseMove" @mouseup="stopDragging" @mouseleave="stopDragging">
      <div v-if="svgContent" :style="transformStyle" class="origin-center motion-safe:transition-transform" v-html="svgContent" />
      <p v-else-if="renderError" class="py-8 text-sm text-error">{{ renderError }}</p>
      <p v-else class="py-8 text-sm text-(--ui-text-muted)" role="status">Rendering diagram…</p>
    </div>
  </figure>

  <Teleport to="body">
    <div v-if="isFullscreen" ref="dialog" role="dialog" aria-modal="true" :aria-label="`${props.label} fullscreen view`" class="mermaid-diagram fixed inset-0 z-100 flex flex-col bg-(--ui-bg)/98 backdrop-blur-sm">
      <div class="flex items-center justify-between border-b border-(--ui-border) px-4 py-3">
        <h2 class="text-base font-semibold">{{ props.label }}</h2>
        <div class="flex items-center gap-1">
          <UButton type="button" icon="i-lucide-zoom-out" color="neutral" variant="ghost" aria-label="Zoom diagram out" @click="zoom(-0.2)" />
          <UButton type="button" icon="i-lucide-zoom-in" color="neutral" variant="ghost" aria-label="Zoom diagram in" @click="zoom(0.2)" />
          <UButton type="button" icon="i-lucide-rotate-ccw" color="neutral" variant="ghost" aria-label="Reset diagram view" @click="resetView" />
          <UButton type="button" icon="i-lucide-x" color="neutral" variant="ghost" aria-label="Close fullscreen diagram" @click="closeFullscreen" />
        </div>
      </div>
      <div class="flex flex-1 items-center justify-center overflow-hidden" tabindex="0" @wheel.prevent="handleWheel" @mousedown="handleMouseDown" @mousemove="handleMouseMove" @mouseup="stopDragging" @mouseleave="stopDragging">
        <div v-if="svgContent" :style="transformStyle" class="origin-center motion-safe:transition-transform" v-html="svgContent" />
      </div>
      <p class="border-t border-(--ui-border) px-4 py-2 text-center text-xs text-(--ui-text-muted)">Use +, −, or 0 to adjust the view. Press Escape to close.</p>
    </div>
  </Teleport>
</template>

<style>
.mermaid-wrapper svg, figure svg { max-width: 100%; height: auto; }

/* Mermaid's default dark edge labels narrowly miss WCAG AA at normal text size. */
.dark .mermaid-diagram .edgeLabel,
.dark .mermaid-diagram .edgeLabel p {
  background-color: #1e293b !important;
  color: #f8fafc !important;
}
</style>
