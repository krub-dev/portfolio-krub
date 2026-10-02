import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

import { openSite } from './helpers.js'

/*
  Axe over the routes a visitor actually sees, at both ends of the theme and the
  language. The tree is the same one, so between them they cover the colour
  tokens, the copy, and the two pages that are not the home page.
*/
function setPreferences(page, theme, lang) {
  return page.addInitScript(
    ([t, l]) => {
      localStorage.setItem('krub-theme', t)
      localStorage.setItem('krub-lang', l)
    },
    [theme, lang],
  )
}

/* ids and counts, not the whole tree: enough to know what broke, and readable. */
const report = (violations) => violations.map((v) => `${v.id} (${v.nodes.length})`)

test('the home page has no axe violations, dark and English', async ({ page }) => {
  await setPreferences(page, 'dark', 'en')
  await openSite(page)
  expect(report((await new AxeBuilder({ page }).analyze()).violations)).toEqual([])
})

test('the home page has no axe violations, light and Spanish', async ({ page }) => {
  await setPreferences(page, 'light', 'es')
  await openSite(page)
  expect(report((await new AxeBuilder({ page }).analyze()).violations)).toEqual([])
})

test('the privacy notice has no axe violations', async ({ page }) => {
  await openSite(page, { path: '/privacy' })
  expect(report((await new AxeBuilder({ page }).analyze()).violations)).toEqual([])
})

test('the 404 has no axe violations', async ({ page }) => {
  await openSite(page, { path: '/no-such-page' })
  expect(report((await new AxeBuilder({ page }).analyze()).violations)).toEqual([])
})
