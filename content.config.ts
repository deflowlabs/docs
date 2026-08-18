import { defineContentConfig, defineCollection, z } from '@nuxt/content'

/**
 * Nuxt Content contracts for public pages and the generated product-facts
 * snapshot. Validation here provides generated types and prevents incomplete
 * editorial records from reaching a build.
 */
export default defineContentConfig({
  collections: {
    // Public and planned documentation pages. Data files and the retired
    // developer-docs directory never enter navigation or search.
    docs: defineCollection({
      type: 'page',
      source: {
        include: '**/*.md',
        exclude: ['data/**', 'developer-docs/**'],
      },
      schema: z.object({
        audience: z.array(z.enum(['users', 'partners', 'support', 'risk-reviewers'])),
        availability: z.enum(['private-beta', 'limited-beta', 'planned', 'internal']),
        lastVerified: z.string(),
        sourceRefs: z.array(z.string()),
        robots: z.enum(['index,follow', 'noindex,nofollow']).default('index,follow'),
      }),
    }),
    // Read-only mirror of core/docs/PRODUCT_FACTS.yaml. Update it through the
    // facts sync script so public numeric and availability claims cannot drift.
    productFacts: defineCollection({
      type: 'data',
      source: 'data/product-facts.yaml',
      schema: z.object({
        schemaVersion: z.number(),
        product: z.string(),
        owner: z.string(),
        lastVerified: z.string(),
        classification: z.enum(['public-safe', 'internal', 'restricted']),
        sourcePrecedence: z.array(z.string()).min(1),
        factRecords: z.array(z.object({
          paths: z.array(z.string()).min(1),
          owner: z.string(),
          lastVerified: z.string(),
          classification: z.enum(['public-safe', 'internal', 'restricted']),
          sourceRevision: z.string().regex(/^[0-9a-f]{40}$/),
          sourceRefs: z.array(z.string()).min(1),
        })).min(1),
        release: z.object({
          stage: z.enum(['private-beta', 'limited-beta', 'production']),
          publicLabel: z.string(),
          productionReady: z.boolean(),
          mainnetLive: z.boolean(),
          notice: z.string(),
        }),
        network: z.object({
          name: z.string(),
          chainId: z.number().int().positive(),
          settlementAsset: z.object({
            name: z.string(),
            symbol: z.string(),
            address: z.string(),
            hasMonetaryValue: z.boolean(),
          }),
          gasAsset: z.object({ name: z.string(), hasMonetaryValue: z.boolean() }),
        }),
        features: z.array(z.object({
          id: z.string(),
          label: z.string(),
          availability: z.enum(['private-beta', 'limited-beta', 'planned', 'internal']),
          note: z.string(),
        })),
        fees: z.object({
          commercialSchedule: z.object({
            minimumEffectiveRatePercent: z.number(),
            tiers: z.array(z.object({
              rank: z.number(),
              upperBoundExclusiveUsd: z.number().nullable(),
              ratePercent: z.number(),
            })),
          }),
          sepoliaDeploymentGlobalFeeBps: z.number(),
          note: z.string(),
        }),
        vip: z.object({
          basis: z.string(),
          economicControlsAvailability: z.enum(['private-beta', 'limited-beta', 'planned', 'internal']),
          benefitCatalogueStatus: z.string(),
          benefitAvailabilityRule: z.string(),
          benefitAvailabilityByRank: z.record(
            z.string(),
            z.enum(['private-beta', 'limited-beta', 'planned', 'internal']),
          ),
          ranks: z.array(z.object({
            rank: z.number(),
            label: z.string(),
            thresholdUsd: z.number(),
            feeDiscountPercent: z.number(),
            maxActiveDeals: z.union([z.number(), z.literal('unlimited')]),
            referralCommissionPercent: z.number(),
            creditSplitPercent: z.number(),
            cashSplitPercent: z.number(),
            monthlyReferralCapUsd: z.number(),
            benefit: z.string(),
          })),
          benefitDescriptions: z.record(z.string(), z.string()),
        }),
        contracts: z.object({
          escrow: z.object({
            deployment: z.string(),
            upgradeable: z.boolean(),
            governanceCapabilities: z.array(z.string()),
          }),
          escrowFactory: z.object({
            address: z.string(),
            upgradeable: z.boolean(),
            governanceCapabilities: z.array(z.string()),
          }),
          feeRouter: z.object({
            implementationAddress: z.string(),
            proxyAddress: z.string(),
            upgradeability: z.string(),
          }),
          referralVault: z.object({ address: z.string(), upgradeable: z.boolean() }),
          governance: z.object({
            address: z.string(),
            control: z.string(),
            multisig: z.boolean(),
            timelock: z.boolean(),
          }),
        }),
        assurance: z.object({
          externalContractAudit: z.object({
            status: z.string(),
            publicClaimAllowed: z.boolean(),
            source: z.string(),
          }),
          legalReview: z.object({
            status: z.string(),
            publicComplianceClaimAllowed: z.boolean(),
            source: z.string(),
          }),
          terminology: z.object({
            nonCustodial: z.object({ status: z.string(), requiredQualification: z.string() }),
          }),
        }),
        sources: z.object({
          vip: z.string(),
          fees: z.string(),
          escrow: z.string(),
          escrowFactory: z.string(),
          feeRouter: z.string(),
          deployment: z.string(),
          betaBehaviour: z.string(),
          syndicates: z.string(),
          audit: z.string(),
          legal: z.string(),
        }),
      }),
    }),
  },
})
