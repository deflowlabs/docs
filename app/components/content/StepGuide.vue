<script setup lang="ts">
/**
 * StepGuide: MDC component for numbered procedural steps.
 * Usage in markdown:
 *   ::step-guide
 *     :::step{title="Connect your wallet" n="1"}
 *     Visit the platform and click Connect Wallet.
 *     :::
 *   ::
 */
</script>

<template>
  <div class="relative pl-8 my-8 border-l border-default">
    <slot />
  </div>
</template>
