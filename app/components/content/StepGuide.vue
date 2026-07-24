<script setup lang="ts">
/**
 * StepGuide: MDC component for numbered procedural steps.
 * Usage in markdown:
 *   ::step-guide
 *     :::step{title="Connect your wallet"}
 *     Visit the platform and click Connect Wallet.
 *     :::
 *     :::step{title="Complete verification"}
 *     Follow the KYC prompts.
 *     :::
 *   ::
 */
</script>

<template>
  <div class="step-guide">
    <slot />
  </div>
</template>
