import { expect, test } from '@playwright/test'

/*
  Five flows. Each one is here because it could not be verified any other way —
  they all depend on scroll events, animation frames or CSS transitions
  actually advancing.
*/

test.describe('chrome reacts to scrolling', () => {
  test.skip(({ isMobile }) => isMobile, 'the desktop navbar is hidden below 900px')

  test('the navbar goes compact and shrinks to its own contents', async ({ page }) => {
    await page.goto('/')
    const capsule = page.locator('.capsule')

    const wide = (await capsule.boundingBox()).width
    expect(wide).toBeGreaterThan(1000)

    await page.evaluate(() => window.scrollTo(0, 600))
    // The capsule animates its max-width over 0.55s; wait for the end state
    // rather than for a fixed delay.
    await expect(capsule).toHaveClass(/compact/)
    await expect
      .poll(async () => (await capsule.boundingBox()).width, { timeout: 2000 })
      .toBeLessThan(wide - 200)
  })

  test('the footer slides in and never covers the last section', async ({ page }) => {
    await page.goto('/')
    const footer = page.locator('footer')
    const viewport = page.viewportSize().height

    // Off-screen at the top of the page.
    expect((await footer.boundingBox()).y).toBeGreaterThanOrEqual(viewport - 1)

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await expect(footer).toHaveClass(/shown/)
    await expect
      .poll(async () => (await footer.boundingBox()).y, { timeout: 2000 })
      .toBeLessThan(viewport)

    // The page reserves exactly the footer's height, so contact ends where the
    // footer begins — the 1px allowance is sub-pixel rounding.
    const contactBottom = (await page.locator('#contact').boundingBox()).y +
      (await page.locator('#contact').boundingBox()).height
    expect(contactBottom).toBeLessThanOrEqual((await footer.boundingBox()).y + 1)
  })

  test('exactly one nav link is highlighted, and it follows the scroll', async ({ page }) => {
    await page.goto('/')
    const active = page.locator('.link.active')

    // At the top nothing is active: the hero has no nav link.
    await expect(active).toHaveCount(0)

    for (const id of ['me', 'projects', 'stack', 'contact']) {
      // Deliberately deterministic: scrollIntoViewIfNeeded may not scroll at
      // all when the element is already partly visible, which leaves the
      // section short of the spy's 35%-of-viewport line. Put its top edge at a
      // known 100px instead.
      await page.evaluate((sectionId) => {
        const el = document.getElementById(sectionId)
        window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 100)
      }, id)
      await expect(active).toHaveCount(1)
      await expect(active).toHaveAttribute('href', `/#${id}`)
    }
  })
})

test('the project modal traps focus, closes on Escape and gives focus back', async ({ page }) => {
  await page.goto('/')

  const card = page.locator('.card .open').first()
  const name = await card.textContent()
  await card.focus()
  await card.press('Enter')

  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  await expect(dialog.locator('.name')).toHaveText(name.trim())

  // Focus moved inside, and the page behind cannot scroll.
  await expect(dialog.locator(':focus')).toHaveCount(1)
  await expect(page.locator('body')).toHaveCSS('overflow', 'hidden')

  // Tab all the way round: focus must never leave the dialog.
  for (let i = 0; i < 8; i += 1) {
    await page.keyboard.press('Tab')
    expect(await dialog.evaluate((el) => el.contains(document.activeElement))).toBe(true)
  }

  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
  await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden')
  await expect(card).toBeFocused()
})

test('an unknown path shows the 404, chrome and all, and offers a way back', async ({ page, isMobile }) => {
  await page.goto('/no-such-page')

  await expect(page.getByRole('heading', { level: 1 })).toHaveText('[404]')
  await expect(page.locator('meta[name="robots"][content="noindex"]')).toHaveCount(1)

  // Exactly one viewport tall, so nothing scrolls — which is also why the
  // navbar never goes compact and the footer is in from the first frame.
  const viewport = page.viewportSize().height
  const documentHeight = await page.evaluate(() => document.documentElement.scrollHeight)
  expect(documentHeight).toBeLessThanOrEqual(viewport + 1)
  await expect(page.locator('.capsule')).not.toHaveClass(/compact/)
  await expect(page.locator('footer')).toHaveClass(/shown/)

  // Limonacho belongs to the hero, and this route has none.
  await expect(page.locator('.pet')).toHaveCount(0)

  // Nor does it have the scroll rail: there is nothing to scroll here.
  await expect(page.locator('.indicator')).toHaveCount(0)

  // The shared chrome points at the home page, not back at this route.
  await expect(page.locator('.brand')).toHaveAttribute('href', '/#top')
  await expect(page.locator('.link').first()).toHaveAttribute('href', /^\/#/)

  // A wide but short window is the case that brought the scrollbar back: the
  // display number is bounded by vh, not only by vw.
  if (!isMobile) {
    await page.setViewportSize({ width: 1280, height: 600 })
    await page.waitForTimeout(200)
    const overflow = await page.evaluate(
      () => document.documentElement.scrollHeight - document.documentElement.clientHeight,
    )
    expect(overflow).toBeLessThanOrEqual(0)
  }

  const back = page.getByRole('link', { name: 'Back home' })
  await back.click()
  await expect(page).toHaveURL('/')

  // The noindex tag is scoped to the view; leaving the route removes it.
  await expect(page.locator('meta[name="robots"]')).toHaveCount(0)
})

test('theme and language survive a reload', async ({ page }) => {
  await page.goto('/')
  const html = page.locator('html')

  await expect(html).not.toHaveAttribute('data-theme', 'light')
  await expect(html).toHaveAttribute('lang', 'en')

  // Both control sets exist in the DOM; only one is displayed at a given
  // breakpoint, so scope to the visible one rather than taking first().
  await page.locator('.icon-btn:visible').first().click()
  await page.locator('.lang-btn:visible').first().click()
  await expect(html).toHaveAttribute('data-theme', 'light')
  await expect(html).toHaveAttribute('lang', 'es')

  await page.reload()
  await expect(html).toHaveAttribute('data-theme', 'light')
  await expect(html).toHaveAttribute('lang', 'es')

  // The inline script in <head> applies both before Vue boots, so there is no
  // flash of the wrong theme. If it regressed, this would be light-on-dark for
  // a frame — invisible to a human, visible here.
  const painted = await page.evaluate(
    () => getComputedStyle(document.body).backgroundColor,
  )
  expect(painted).toBe('rgb(245, 243, 238)')
})

test('the accent cycles and survives a reload', async ({ page, isMobile }) => {
  await page.goto('/')
  const html = page.locator('html')
  await expect(html).toHaveAttribute('data-accent', 'yellow')

  // Desktop: the button in the navbar. Mobile: the row inside the menu.
  if (isMobile) await page.locator('.menu-btn').click()

  const button = page.locator('.accent-btn:visible')
  await expect(button).toHaveAttribute('aria-label', 'Theme: Yellow')
  await button.click()

  await expect(html).toHaveAttribute('data-accent', 'aqua')
  await expect(button).toHaveAttribute('aria-label', 'Theme: Aqua')
  // The dark theme's aqua fill, straight off the token.
  const fill = await page.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue('--acc').trim(),
  )
  expect(fill).toBe('#c3fffc')

  await page.reload()
  await expect(html).toHaveAttribute('data-accent', 'aqua')
})
