import { fileURLToPath } from 'node:url'

import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'

/*
  Vitest reuses the project's Vite config, so imports, aliases and .vue files
  resolve exactly as they do in the app. That is the whole appeal over a
  separate Jest setup: no second build pipeline to keep in sync.

  environment: 'jsdom' gives the tests a document and a localStorage, which
  useTheme and useLang both touch. The pure functions in src/utils do not need
  it, but one environment for everything is simpler than annotating files.
*/
export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    include: ['tests/unit/**/*.test.js'],
    // Playwright specs live in tests/e2e and have their own runner; without
    // this Vitest would try to execute them and fail on the missing import.
    exclude: ['tests/e2e/**', 'node_modules/**'],
    root: fileURLToPath(new URL('./', import.meta.url)),
  },
})
