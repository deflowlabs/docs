<script setup lang="ts">
/**
 * Static-first Mermaid renderer used by Markdown code fences.
 *
 * Mermaid produces an inline SVG rather than an iframe. The standard reading
 * view deliberately avoids custom zoom and pan controls: the SVG uses the
 * available content width, while narrow screens can scroll the diagram canvas
 * without creating document-level overflow. Nuxt UI supplies the accessible
 * fullscreen dialog, including focus trapping, Escape handling and focus
 * restoration.
 */
const props = withDefaults(defineProps<{ code: string, label?: string }>(), { label: 'Process diagram' })
const colorMode = useColorMode()
const componentId = useId()
const captionId = `${componentId}-caption`
const descriptionId = `${componentId}-description`
const svgContent = ref('')
const renderError = ref('')
const isFullscreen = ref(false)
let renderCount = 0

/** Render trusted, repository-authored Mermaid source with Mermaid's strict mode. */
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
      flowchart: { useMaxWidth: true, htmlLabels: true },
      sequence: { useMaxWidth: true },
    })

    const { svg } = await mermaid.render(`mermaid-${Date.now()}-${++renderCount}`, props.code)
    // The labelled wrapper is the single accessible graphic. Hiding Mermaid's
    // internal SVG avoids duplicate or implementation-derived announcements.
    svgContent.value = svg.replace('<svg ', '<svg aria-hidden="true" focusable="false" ')
    renderError.value = ''
  } catch (error: unknown) {
    renderError.value = error instanceof Error ? error.message : 'The diagram could not be rendered.'
    svgContent.value = ''
  }
}

watch(() => props.code, renderDiagram)
watch(() => colorMode.value, renderDiagram)
onMounted(renderDiagram)
</script>

<template>
  <figure class="mermaid-diagram not-prose my-6 overflow-hidden rounded-xl border border-(--ui-border) bg-(--ui-bg-elevated)">
    <div class="flex items-center justify-between gap-3 px-4 pt-3 sm:px-5 sm:pt-4">
      <figcaption :id="captionId" class="text-sm font-medium text-(--ui-text-muted)">
        {{ props.label }}
      </figcaption>

      <UModal
        v-model:open="isFullscreen"
        :title="props.label"
        description="Expanded diagram view. Scroll horizontally on a narrow screen."
        fullscreen
        :ui="{
          content: 'flex min-h-0 flex-col bg-(--ui-bg)',
          body: 'min-h-0 flex-1 overflow-auto p-4 sm:p-6',
        }"
      >
        <UButton
          type="button"
          icon="i-lucide-maximize-2"
          label="Expand"
          color="neutral"
          variant="ghost"
          size="sm"
          aria-label="Expand diagram"
        />

        <template #close>
          <UButton
            type="button"
            icon="i-lucide-x"
            color="neutral"
            variant="ghost"
            aria-label="Close fullscreen diagram"
          />
        </template>

        <template #body>
          <div
            class="mermaid-canvas mermaid-canvas--fullscreen"
            role="img"
            :aria-label="props.label"
            tabindex="0"
          >
            <div v-if="svgContent" class="mermaid-svg" v-html="svgContent" />
            <p v-else-if="renderError" class="py-8 text-sm text-error">
              {{ renderError }}
            </p>
            <p v-else class="py-8 text-sm text-(--ui-text-muted)" role="status">
              Rendering diagram…
            </p>
          </div>
        </template>
      </UModal>
    </div>

    <p :id="descriptionId" class="sr-only">
      Process diagram. On a narrow screen, focus this diagram and scroll horizontally. Use the Expand button to open a larger view.
    </p>
    <div
      class="mermaid-canvas px-4 pb-4 pt-3 sm:px-5 sm:pb-5"
      role="img"
      :aria-labelledby="captionId"
      :aria-describedby="descriptionId"
      :aria-busy="!svgContent && !renderError"
      tabindex="0"
    >
      <div v-if="svgContent && !isFullscreen" class="mermaid-svg" v-html="svgContent" />
      <p v-else-if="renderError" class="py-8 text-sm text-error">
        {{ renderError }}
      </p>
      <p v-else-if="!isFullscreen" class="py-8 text-sm text-(--ui-text-muted)" role="status">
        Rendering diagram…
      </p>
    </div>
  </figure>
</template>

<style scoped>
.mermaid-canvas {
  max-width: 100%;
  overflow-x: auto;
  scrollbar-gutter: stable;
}

.mermaid-svg :deep(svg) {
  display: block;
  width: 100% !important;
  max-width: none !important;
  height: auto !important;
  margin-inline: auto;
}

/* Keep labels readable on small screens without widening the document. */
@media (max-width: 639px) {
  .mermaid-svg {
    min-width: 40rem;
  }
}

/* Mermaid's default dark edge labels narrowly miss WCAG AA at normal text size. */
:global(.dark .mermaid-canvas .labelBkg),
:global(.dark .mermaid-canvas .edgeLabel),
:global(.dark .mermaid-canvas .edgeLabel p) {
  background-color: #1e293b !important;
  color: #f8fafc !important;
}
</style>
