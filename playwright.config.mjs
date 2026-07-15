import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 45_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  retries: 1,
  reporter: [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:4173/social-challenge-arena/',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  webServer: {
    command: 'npm run build && npx vite preview --host 127.0.0.1 --port 4173',
    url: 'http://127.0.0.1:4173/social-challenge-arena/',
    reuseExistingServer: false,
    timeout: 120_000
  },
  projects: [
    { name: 'android-360', use: { ...devices['Pixel 5'], viewport: { width: 360, height: 640 } } },
    { name: 'iphone-390', use: { ...devices['iPhone 13'], viewport: { width: 390, height: 844 } } },
    { name: 'android-412', use: { ...devices['Galaxy S9+'], viewport: { width: 412, height: 915 } } },
    { name: 'landscape-844', use: { ...devices['Pixel 5'], viewport: { width: 844, height: 390 }, isMobile: true, hasTouch: true } }
  ]
});
