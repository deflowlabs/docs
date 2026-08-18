import { readdir, readFile } from 'node:fs/promises'
import { join, relative, resolve } from 'node:path'

const contentRoot = resolve(process.cwd(), 'content')
// These fields make ownership, release state, evidence and indexability
// explicit for every page rather than relying on directory conventions.
const requiredFields = ['title:', 'description:', 'audience:', 'availability:', 'lastVerified:', 'sourceRefs:', 'robots:']
const forbiddenClaims = [
  /full regulatory compliance/i,
  /eliminates? (?:counterparty )?risk/i,
  /audited smart contracts/i,
  /platform cannot (?:access|redirect|seize)/i,
  /production[- ]ready/i,
  /EIP-1167/i,
  /typically 0\.50%/i,
]

async function markdownFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const nested = await Promise.all(entries.map(async entry => {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) return markdownFiles(path)
    return entry.isFile() && entry.name.endsWith('.md') ? [path] : []
  }))
  return nested.flat()
}

const files = await markdownFiles(contentRoot)
const failures = []
const routes = new Set(files.map(file => {
  const segments = relative(contentRoot, file).replace(/\\/g, '/').replace(/\.md$/, '').split('/')
    .map(segment => segment.replace(/^\d+\./, ''))
  if (segments.at(-1) === 'index') segments.pop()
  return `/${segments.join('/')}`.replace(/\/$/, '') || '/'
}))
for (const file of files) {
  const content = await readFile(file, 'utf8')
  const name = relative(contentRoot, file)
  const frontmatter = content.startsWith('---') ? content.split('---', 3)[1] || '' : ''
  for (const field of requiredFields) {
    if (!frontmatter.includes(field)) failures.push(`${name}: missing ${field}`)
  }

  const description = frontmatter.match(/^description:\s*(.+)$/m)?.[1]?.trim() || ''
  if (description.length < 50 || description.length > 160) failures.push(`${name}: description must be 50–160 characters`)
  for (const pattern of forbiddenClaims) {
    if (pattern.test(content)) failures.push(`${name}: prohibited or stale claim ${pattern}`)
  }

  const headings = [...content.matchAll(/^#{2,6}\s+(.+)$/gm)].map(match => match[1].trim().toLowerCase())
  for (const heading of new Set(headings)) {
    if (headings.filter(value => value === heading).length > 1) failures.push(`${name}: duplicate heading "${heading}"`)
  }

  const links = [...content.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)].map(match => match[1].trim())
  for (const link of new Set(links)) {
    if (links.filter(value => value === link).length > 1) failures.push(`${name}: duplicate link ${link}`)
    if (link.startsWith('/')) {
      const route = link.split(/[?#]/)[0].replace(/\/$/, '') || '/'
      if (!routes.has(route)) failures.push(`${name}: broken internal link ${link}`)
    }
  }

  // A visible fence label becomes the diagram's accessible name and caption.
  // Reject unnamed or empty diagrams before they reach the public build.
  const mermaidFenceCount = [...content.matchAll(/```mermaid\b/g)].length
  const mermaidFences = [...content.matchAll(/```mermaid\s+\[([^\]\r\n]+)\][^\r\n]*\r?\n([\s\S]*?)```/g)]
  if (mermaidFences.length !== mermaidFenceCount) failures.push(`${name}: every Mermaid diagram must have a [meaningful label]`)
  for (const [, label, source] of mermaidFences) {
    if (!label?.trim()) failures.push(`${name}: Mermaid diagram label must not be empty`)
    if (!source?.trim()) failures.push(`${name}: Mermaid diagram source must not be empty`)
  }
}

if (files.some(file => /developer-(?:docs|guide)/.test(file))) failures.push('Developer Guide content must not exist until supported public interfaces are available.')
if (failures.length) {
  console.error(failures.join('\n'))
  process.exit(1)
}
console.log(`Validated ${files.length} documentation pages.`)
