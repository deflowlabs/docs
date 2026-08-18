import { access, readFile } from 'node:fs/promises'
import { join, relative, resolve } from 'node:path'
import { readdir } from 'node:fs/promises'

const contentRoot = resolve('content')
const outputRoot = resolve('.output/public')

async function markdownFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  return (await Promise.all(entries.map(entry => {
    const path = join(directory, entry.name)
    return entry.isDirectory() ? markdownFiles(path) : entry.name.endsWith('.md') ? [path] : []
  }))).flat()
}

const routes = (await markdownFiles(contentRoot)).map(file => {
  const segments = relative(contentRoot, file).replace(/\\/g, '/').replace(/\.md$/, '').split('/')
    .map(segment => segment.replace(/^\d+\./, ''))
  if (segments.at(-1) === 'index') segments.pop()
  return { path: `/${segments.join('/')}`.replace(/\/$/, '') || '/' }
})

const sitemap = await readFile(join(outputRoot, 'sitemap.xml'), 'utf8')
const failures = []
const notFound = await readFile(join(outputRoot, '404.html'), 'utf8')
if (!/name="robots" content="noindex,\s*nofollow"/.test(notFound)) failures.push('404 page is not explicitly noindex,nofollow')
const titles = new Set()
const descriptions = new Set()
for (const { path: route } of routes) {
  const file = route === '/' ? join(outputRoot, 'index.html') : join(outputRoot, route.slice(1), 'index.html')
  try {
    await access(file)
    const html = await readFile(file, 'utf8')
    const canonical = `href="https://docs.deflowlabs.io${route === '/' ? '' : route}"`
    if (!html.includes(canonical)) failures.push(`${route}: missing canonical URL`)
    if (!html.includes('application/ld+json')) failures.push(`${route}: missing article structured data`)
    if (!html.includes('property="og:image"')) failures.push(`${route}: missing Open Graph image`)
    if (!html.includes('name="twitter:card" content="summary_large_image"')) failures.push(`${route}: missing large Twitter card`)
    if (!html.includes('property="og:locale" content="en_GB"')) failures.push(`${route}: missing Open Graph locale`)

    const title = html.match(/<title>(.*?)<\/title>/)?.[1]
    const description = html.match(/<meta name="description" content="(.*?)">/)?.[1]
    if (!title) failures.push(`${route}: missing title`)
    else if (titles.has(title)) failures.push(`${route}: duplicate title`)
    else titles.add(title)
    if (!description) failures.push(`${route}: missing description`)
    else if (descriptions.has(description)) failures.push(`${route}: duplicate description`)
    else descriptions.add(description)

  } catch {
    failures.push(`${route}: static page was not generated`)
  }
  const loc = `<loc>https://docs.deflowlabs.io${route}</loc>`
  if (!sitemap.includes(loc)) failures.push(`${route}: missing from sitemap`)
}

if (/developer-guide|developer-docs|_studio/i.test(sitemap)) failures.push('Sitemap exposes a noindex developer or Studio route')
for (const retiredRoute of ['developer-guide/coming-soon', 'developer-docs']) {
  try {
    await access(join(outputRoot, retiredRoute, 'index.html'))
    failures.push(`/${retiredRoute}: disabled developer route was generated`)
  } catch {
    // Expected: the disabled navigation label has no corresponding content route.
  }
}
const robots = await readFile(join(outputRoot, 'robots.txt'), 'utf8')
if (!robots.includes('Sitemap: https://docs.deflowlabs.io/sitemap.xml')) failures.push('robots.txt does not advertise the canonical sitemap')
const outputFiles = await readdir(outputRoot, { recursive: true })
for (const name of outputFiles.filter(name => /\.(?:html|css|xml)$/.test(name))) {
  const body = await readFile(join(outputRoot, name), 'utf8')
  if (/fonts\.googleapis|fonts\.bunny|api\.fontsource/i.test(body)) failures.push(`${name}: external font provider reference`)
}

if (failures.length) {
  console.error(failures.join('\n'))
  process.exit(1)
}
console.log(`Verified ${routes.length} static routes, unique search/social metadata, structured data, sitemap policy and local fonts.`)
