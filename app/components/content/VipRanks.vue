<script setup lang="ts">
/**
 * Renders VIP economics and the approved benefit catalogue from the canonical
 * ledger. Benefit assignment is intentionally shown separately from delivery
 * availability so an editor cannot accidentally turn roadmap intent into an
 * availability claim.
 */
const { data: facts } = await useAsyncData('vip-ranks', () => queryCollection('productFacts').first())
const money = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 })

function formatLimit(value: number | string) {
  return value === 'unlimited' ? 'Unlimited' : value
}

function benefitStatus(rank: number): 'private-beta' | 'limited-beta' | 'planned' | 'internal' {
  return facts.value?.vip.benefitAvailabilityByRank[String(rank)] ?? 'planned'
}
</script>

<template>
  <div v-if="facts" class="my-6 space-y-8">
    <div class="overflow-x-auto rounded-lg border border-(--ui-border)" role="region" aria-label="VIP rank economic controls" tabindex="0">
      <table class="w-full min-w-240 text-sm">
        <thead class="bg-(--ui-bg-elevated)">
          <tr>
            <th scope="col" class="p-3 text-left">Rank</th>
            <th scope="col" class="p-3 text-left">Tier</th>
            <th scope="col" class="p-3 text-right">Lifetime volume</th>
            <th scope="col" class="p-3 text-right">Fee discount</th>
            <th scope="col" class="p-3 text-right">Active deals</th>
            <th scope="col" class="p-3 text-right">Referral rate</th>
            <th scope="col" class="p-3 text-right">Credits : cash</th>
            <th scope="col" class="p-3 text-right">Monthly cap</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="rank in facts.vip.ranks" :key="rank.rank" class="border-t border-(--ui-border)">
            <td class="p-3 text-(--ui-text-muted)">{{ rank.rank }}</td>
            <td class="p-3 font-medium">{{ rank.label }}</td>
            <td class="p-3 text-right">{{ money.format(rank.thresholdUsd) }}</td>
            <td class="p-3 text-right">{{ rank.feeDiscountPercent }}%</td>
            <td class="p-3 text-right">{{ formatLimit(rank.maxActiveDeals) }}</td>
            <td class="p-3 text-right">{{ rank.referralCommissionPercent }}%</td>
            <td class="p-3 text-right">{{ rank.creditSplitPercent }} : {{ rank.cashSplitPercent }}</td>
            <td class="p-3 text-right">{{ money.format(rank.monthlyReferralCapUsd) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div>
      <h2 class="mb-3 text-xl font-semibold">Benefit catalogue</h2>
      <p class="mb-4 text-sm text-(--ui-text-muted)">{{ facts.vip.benefitAvailabilityRule }}</p>
      <div class="grid gap-3 md:grid-cols-2">
        <article v-for="rank in facts.vip.ranks" :key="`benefit-${rank.rank}`" class="rounded-lg border border-(--ui-border) bg-(--ui-bg-elevated) p-4">
          <div class="mb-2 flex items-center justify-between gap-3">
            <h3 class="font-semibold">{{ rank.rank }}. {{ rank.benefit }}</h3>
            <AvailabilityBadge :status="benefitStatus(rank.rank)" />
          </div>
          <p class="text-sm text-(--ui-text-muted)">{{ facts.vip.benefitDescriptions[rank.benefit] }}</p>
        </article>
      </div>
    </div>
  </div>
</template>
