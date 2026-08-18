import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { readdir } from 'node:fs/promises'
import { resolve } from 'node:path'

const routes = [
  '/',
  '/getting-started/product-availability',
  '/user-guide/overview',
  '/user-guide/trading/fees-and-supported-assets',
  '/user-guide/syndicates/overview',
  '/user-guide/security/risks-and-assurance',
]

const diagramRoutes = [
  { route: '/getting-started/what-is-deflow', label: 'DeFlow transaction model' },
  { route: '/user-guide/trading/otc-deal-lifecycle', label: 'OTC deal lifecycle' },
  { route: '/user-guide/trading/escrow-and-funding', label: 'Escrow deployment and funding' },
  { route: '/user-guide/rewards/referral-program', label: 'Referral reward flow' },
  { route: '/user-guide/syndicates/overview', label: 'Syndicate lifecycle' },
  { route: '/user-guide/security/data-privacy', label: 'Identity data boundary' },
]

for (const route of routes) {
  test(`${route} has landmarks, metadata and no automated WCAG violations`, async ({ page }) => {
    await page.goto(route)

    await expect(page.locator('main')).toBeVisible()
    await expect(page.getByRole('banner')).toBeVisible()
    await expect(page.getByRole('contentinfo')).toHaveCount(0)
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', new RegExp(`https://docs\\.deflowlabs\\.io${route === '/' ? '/?$' : route}`))
    await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(1)
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /^https:\/\//)
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image')
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)

    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()
    expect(results.violations).toEqual([])
  })
}

test('mobile navigation exposes every documentation section and returns focus on Escape', async ({ page }) => {
  test.skip((page.viewportSize()?.width || 0) >= 768, 'Mobile-only interaction')
  await page.goto('/')

  const toggle = page.getByRole('button', { name: 'Open documentation navigation' })
  await toggle.click()
  const navigation = page.getByRole('navigation', { name: 'Mobile documentation navigation' })
  await expect(navigation).toBeVisible()
  await expect(navigation.getByRole('link', { name: 'Fees and Supported Assets', exact: true })).toBeVisible()
  await expect(navigation.getByRole('link', { name: 'Risk and Assurance Status', exact: true })).toBeVisible()
  const developerGuide = navigation.locator('[aria-disabled="true"]:visible').filter({ hasText: 'Developer Guide' }).first()
  await expect(developerGuide).toBeVisible()
  await expect(developerGuide).toHaveAttribute('aria-disabled', 'true')
  await page.keyboard.press('Escape')
  await expect(toggle).toBeFocused()
  await expect(toggle).toHaveAttribute('aria-expanded', 'false')
})

test('search is named, keyboard-ready and focused when opened', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Search…' }).first().click()

  const dialog = page.getByRole('dialog', { name: 'Search DeFlow documentation' })
  await expect(dialog).toBeVisible()
  await expect(dialog.getByPlaceholder('Type a command or search…')).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
})

test('Nuxt Content serves SQLite WebAssembly with the correct media type', async ({ request }) => {
  const assets = await readdir(resolve('.output/public/_nuxt'))
  const wasmAsset = assets.find(asset => asset.endsWith('.wasm'))
  expect(wasmAsset, 'generated SQLite WebAssembly asset').toBeTruthy()

  const response = await request.get(`/_nuxt/${wasmAsset}`)
  expect(response.ok()).toBe(true)
  expect(response.headers()['content-type']).toMatch(/^application\/wasm(?:;|$)/i)
})

test('table of contents follows client-side page navigation', async ({ page }) => {
  await page.goto('/getting-started/what-is-deflow')

  const toc = page.getByTestId('page-toc')
  await expect(toc).toContainText('Product capabilities')
  await expect(toc).not.toContainText('Current operating environment')

  await page.getByRole('link', { name: 'Product Availability', exact: true }).first().click()
  await expect(page).toHaveURL(/\/getting-started\/product-availability$/)
  await expect(page.getByRole('heading', { level: 1, name: 'Product Availability' })).toBeVisible()
  // The layout resolves its own content record after the route page; allow the
  // reactive query to settle on slower mobile CI workers before asserting.
  await expect(toc).toContainText('Current operating environment', { timeout: 15_000 })
  await expect(toc).toContainText('How availability labels work', { timeout: 15_000 })
  await expect(toc).not.toContainText('Product capabilities')
})

for (const diagram of diagramRoutes) {
  test(`${diagram.label} is a responsive, accessible inline SVG`, async ({ page }) => {
    await page.goto(diagram.route)

    const graphic = page.getByRole('img', { name: diagram.label }).first()
    const canvas = graphic
    const svg = graphic.locator('svg')
    await expect(graphic).toBeVisible()
    await expect(svg).toBeVisible()
    await expect(svg).toHaveAttribute('aria-hidden', 'true')
    await expect(graphic.locator('iframe')).toHaveCount(0)
    await expect(graphic.getByRole('button')).toHaveCount(0)
    await expect(page.getByText('Text source for this diagram')).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'Zoom diagram in' })).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'Reset diagram view' })).toHaveCount(0)

    const sizing = await canvas.evaluate(element => {
      const styles = window.getComputedStyle(element)
      const horizontalPadding = Number.parseFloat(styles.paddingLeft) + Number.parseFloat(styles.paddingRight)
      return {
        clientWidth: element.clientWidth,
        contentWidth: element.clientWidth - horizontalPadding,
        scrollWidth: element.scrollWidth,
        svgWidth: element.querySelector('svg')?.getBoundingClientRect().width || 0,
        viewportWidth: window.innerWidth,
      }
    })
    if (sizing.viewportWidth < 640) {
      expect(sizing.scrollWidth).toBeGreaterThan(sizing.clientWidth)
    } else {
      expect(sizing.svgWidth).toBeGreaterThanOrEqual(sizing.contentWidth - 2)
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)

    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()
    expect(results.violations).toEqual([])
  })
}

test('Mermaid diagram has a text alternative and a focus-managed fullscreen view', async ({ page }) => {
  await page.goto('/user-guide/trading/otc-deal-lifecycle')
  await expect(page.getByRole('img', { name: 'OTC deal lifecycle' })).toBeVisible()
  await expect(page.getByText('Text source for this diagram')).toHaveCount(0)

  const open = page.getByRole('button', { name: 'Expand diagram' })
  await open.click()
  await expect(page.getByRole('dialog', { name: 'OTC deal lifecycle' })).toBeVisible()
  const close = page.getByRole('button', { name: 'Close fullscreen diagram' })
  await expect(close).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog', { name: 'OTC deal lifecycle' })).toBeHidden()
  await expect(open).toBeFocused()
})

test('Developer Guide is visible but disabled and has no public route', async ({ page }) => {
  await page.goto('/')
  if ((page.viewportSize()?.width || 0) < 1024) {
    await page.getByRole('button', { name: 'Open documentation navigation' }).click()
  }
  const developerGuide = page.locator('[aria-disabled="true"]:visible').filter({ hasText: 'Developer Guide' }).first()
  await expect(developerGuide).toBeVisible()
  await expect(developerGuide).toHaveAttribute('aria-disabled', 'true')
  await expect(page.getByRole('link', { name: /Developer Guide/ })).toHaveCount(0)

  const response = await page.goto('/developer-guide/coming-soon')
  expect(response?.status()).toBe(404)
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/)
})

test('retired Developer Guide placeholder remains an index-safe 404', async ({ page }) => {
  const response = await page.goto('/developer-docs')
  expect(response?.status()).toBe(404)
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/)
})
