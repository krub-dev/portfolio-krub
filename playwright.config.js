import { defineConfig, devices } from '@playwright/test'

/*
  End-to-end tests, in a real Chromium.

  These exist for one specific reason: the navbar shrinking, the footer sliding
  in, the scroll spy and the modal's focus handling all depend on scroll events,
  requestAnimationFrame and CSS transitions actually running. None of those can
  be checked by reading the DOM, and during development the tooling browser ran
  no frames at all — so these five flows were the ones that could never be
  verified. A real browser runs all three.

  webServer builds the site and serves the production bundle, then shuts it down
  afterwards. Testing the dev server would test hot-reload plumbing that no
  visitor ever sees.
*/
/*
  Set E2E_BASE_URL to run the same suite against a deployment instead of a
  local build — useful for checking a Vercel preview or production before
  pointing a domain at it. Without it, the local production build is used.
*/
const remote = process.env.E2E_BASE_URL

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'list',

  use: {
    baseURL: remote ?? 'http://localhost:4173',
    // Only kept for failures, so a green run leaves nothing behind.
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },

  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],

  // No local server when the target is a deployment that is already running.
  webServer: remote
    ? undefined
    : {
        command: 'npm run build && npm run preview',
        url: 'http://localhost:4173',
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
})
