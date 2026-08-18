/**
 * Publish the public-safe subset of the internal product ledger to Nuxt Content.
 *
 * The core ledger also contains issue-triage and delivery-history metadata. That
 * material is intentionally omitted from the public build even when individual
 * issue records are public-safe: GitHub remains the roadmap interface and the
 * documentation site only needs verified product facts.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { parse, stringify } from 'yaml'

const source = resolve(process.cwd(), '../core/docs/PRODUCT_FACTS.yaml')
const destination = resolve(process.cwd(), 'content/data/product-facts.yaml')
const checkOnly = process.argv.includes('--check')

const sourceFacts = parse(await readFile(source, 'utf8'))
const publicFacts = {
  schemaVersion: sourceFacts.schemaVersion,
  product: sourceFacts.product,
  owner: sourceFacts.owner,
  lastVerified: sourceFacts.lastVerified,
  classification: sourceFacts.classification,
  sourcePrecedence: sourceFacts.sourcePrecedence,
  factRecords: sourceFacts.factRecords?.filter(record => record.classification === 'public-safe'),
  release: sourceFacts.release,
  network: sourceFacts.network,
  features: sourceFacts.features,
  fees: sourceFacts.fees,
  vip: sourceFacts.vip,
  contracts: sourceFacts.contracts,
  assurance: sourceFacts.assurance,
  sources: sourceFacts.sources,
}
const generated = `# Generated from ../core/docs/PRODUCT_FACTS.yaml. Do not edit manually.\n${stringify(publicFacts, { lineWidth: 120 })}`

if (checkOnly) {
  const destinationContent = await readFile(destination, 'utf8')
  if (generated !== destinationContent) {
    console.error('Product facts are out of date. Run npm run facts:sync from /docs.')
    process.exit(1)
  }
  console.log('Public product facts snapshot matches the canonical core ledger.')
} else {
  await mkdir(dirname(destination), { recursive: true })
  await writeFile(destination, generated)
  console.log('Synced the public-safe core product facts into Nuxt Content.')
}
