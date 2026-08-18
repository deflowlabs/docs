<script setup lang="ts">
/** Renders the commercial fee tiers from the generated product-facts snapshot. */
const { data: facts } = await useAsyncData('fee-schedule', () => queryCollection('productFacts').first())
const money = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

/** Convert adjacent upper bounds into a reader-friendly notional range. */
function rangeLabel(tier: { upperBoundExclusiveUsd: number | null }, index: number) {
  const previous = index === 0 ? 0 : (facts.value?.fees.commercialSchedule.tiers[index - 1]?.upperBoundExclusiveUsd ?? 0)
  if (tier.upperBoundExclusiveUsd == null) return `${money.format(previous)}+`
  return `${money.format(previous)}–${money.format(tier.upperBoundExclusiveUsd)}`
}
</script>

<template>
  <div v-if="facts" class="my-6 overflow-x-auto rounded-lg border border-(--ui-border)" role="region" aria-label="Commercial fee schedule" tabindex="0">
    <table class="w-full min-w-128 text-sm">
      <thead class="bg-(--ui-bg-elevated)"><tr><th scope="col" class="p-3 text-left">Deal notional</th><th scope="col" class="p-3 text-right">Base rate</th></tr></thead>
      <tbody>
        <tr v-for="(tier, index) in facts.fees.commercialSchedule.tiers" :key="tier.rank" class="border-t border-(--ui-border)">
          <td class="p-3">{{ rangeLabel(tier, index) }}</td><td class="p-3 text-right font-medium">{{ tier.ratePercent.toFixed(2) }}%</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
