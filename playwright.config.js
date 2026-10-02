import { defineConfig, devices } from '@playwright/test'

/*
  End-to-end tests, in real browsers: Chromium on a desktop and a phone, and
  WebKit on a phone and a tablet.

  These exist for one specific reason: the navbar shrinking, the footer sliding
  in, the scroll spy and the modal's focus handling all depend on scroll events,
  requestAnimationFrame and CSS transitions actually running. None of those can
  be checked by reading the DOM — only by a browser that paints.

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

  // One worker on CI: a few flows measure animation timing, and several browsers
  // painting at once starve the frames and turn them red at random. Locally the
  // count is left to the machine.
  workers: process.env.CI ? 1 : undefined,

  use: {
    baseURL: remote ?? 'http://localhost:4173',
    // Only kept for failures, so a green run leaves nothing behind.
    trace: process.env.CI ? 'on-first-retry' : 'retain-on-failure',
    screenshot: 'only-on-failure',
  },

  projects: [
    // 1280×800 rather than Desktop Chrome's 720-tall window: the hero is capped
    // near 700px, and at 720 the viewport is too close to that for the layout
    // under test to be anything but an edge case.
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
    // WebKit, not only Chromium: several real bugs here only show there (pointer
    // capture retargeting a click, `overflow-clip-margin` unsupported, and the
    // scroll a route change lands on, which iOS puts back). See decisions.md.
    { name: 'webkit', use: { ...devices['iPhone 13'] } },
    // A wide touch screen is its own layout: above 900px the rail's touch marker,
    // the modal and the scroll lock all behave differently with a finger, and
    // nothing else here covers touch past that breakpoint.
    { name: 'tablet', use: { ...devices['iPad Pro 11 landscape'] } },
  ],

  // No local server when the target is a deployment that is already running.
  webServer: remote
    ? undefined
    : {
        // `--strictPort` so a busy 4173 fails loudly instead of Vite quietly
        // moving to 4174 while Playwright waits on a port nothing is serving.
        command: 'npm run build && npm run preview -- --strictPort',
        url: 'http://localhost:4173',
        // Never reuse a server: a preview left over from an earlier commit is a
        // different build, and a green run against it is a false green.
        reuseExistingServer: false,
        timeout: 120_000,
      },
})
