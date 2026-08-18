import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60_000,
  fullyParallel: true,
  workers: process.env.CI ? 3 : 2,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI
    ? [['github'], ['html', { outputFolder: 'playwright-report', open: 'never' }]]
    : 'list',
  use: {
    baseURL: 'http://127.0.0.1:4173',
    browserName: 'chromium',
    colorScheme: 'dark',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'desktop-dark', use: { colorScheme: 'dark', viewport: { width: 1440, height: 900 } } },
    { name: 'desktop-light', use: { colorScheme: 'light', viewport: { width: 1440, height: 900 } } },
    { name: 'tablet-dark', use: { colorScheme: 'dark', viewport: { width: 768, height: 1024 } } },
    { name: 'tablet-light', use: { colorScheme: 'light', viewport: { width: 768, height: 1024 } } },
    { name: 'mobile-dark', use: { colorScheme: 'dark', viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
    { name: 'mobile-light', use: { colorScheme: 'light', viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
  ],
  webServer: process.env.PLAYWRIGHT_SERVER_RUNNING
    ? undefined
    : {
        command: 'node scripts/serve-static.mjs',
        url: 'http://127.0.0.1:4173',
        reuseExistingServer: !process.env.CI,
      },
})
