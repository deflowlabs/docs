import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

const routes = [
  '/',
  '/getting-started/product-availability',
  '/user-guide/overview',
  '/user-guide/trading/fees-and-supported-assets',
  '/user-guide/syndicates/overview',
  '/user-guide/security/risks-and-assurance',
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

test('Mermaid diagram has a text alternative and a focus-managed fullscreen view', async ({ page }) => {
  await page.goto('/user-guide/trading/otc-deal-lifecycle')
  await expect(page.getByRole('img', { name: 'OTC deal lifecycle' })).toBeVisible()
  await expect(page.getByText('Text source for this diagram')).toHaveCount(0)

  const open = page.getByRole('button', { name: 'Open diagram in fullscreen' })
  await open.click()
  const close = page.getByRole('button', { name: 'Close fullscreen diagram' })
  await expect(close).toBeFocused()
  await page.keyboard.press('Escape')
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
