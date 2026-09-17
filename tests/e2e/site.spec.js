import { expect, test } from '@playwright/test'

/*
  These flows. Each one is here because it could not be verified any other way —
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
      // known 100px instead — and instantly, because the page scrolls smoothly
      // by default and this assertion is about where the mark lands, not about
      // the animation getting there.
      await page.evaluate((sectionId) => {
        const el = document.getElementById(sectionId)
        window.scrollTo({
          top: el.getBoundingClientRect().top + window.scrollY - 100,
          behavior: 'instant',
        })
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
  await page.locator('.seg-theme:visible').click()
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

  // One press moves to the next palette (yellow -> aqua).
  const disc = page.locator('.seg-accent:visible')
  await expect(disc).toHaveAttribute('aria-label', 'Accent colour: Yellow')
  await disc.click()

  await expect(html).toHaveAttribute('data-accent', 'aqua')
  await expect(disc).toHaveAttribute('aria-label', 'Accent colour: Aqua')
  // The dark theme's aqua fill, straight off the token.
  const fill = await page.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue('--acc').trim(),
  )
  expect(fill).toBe('#c3fffc')

  if (isMobile) {
    // Before the bar compacts the menu has no controls: they are in the bar.
    await page.locator('.menu-btn').click()
    await expect(page.locator('.menu .settings')).toHaveCount(0)
    await page.locator('.menu-btn').click()
  }

  // Compact: the bar hands the controls over — to the settings button on
  // desktop, to the menu on a phone.
  await page.evaluate(() => window.scrollTo(0, 400))
  await expect(page.locator('.capsule')).toHaveClass(/compact/)
  if (isMobile) {
    await expect(page.locator('.controls.mobile .full')).toBeHidden()
    await page.locator('.menu-btn').click()
    await expect(page.locator('.menu .settings .lang-btn')).toBeVisible()
  } else {
    await expect(page.locator('.controls.desktop .full')).toBeHidden()
    await page.locator('.settings .trigger').click()
    await expect(page.locator('.settings-panel .lang-btn')).toBeVisible()
    // A scroll closes it, as it does the mobile menu.
    await page.evaluate(() => window.scrollTo(0, 800))
    await expect(page.locator('.settings-panel')).toHaveCount(0)
  }

  await page.reload()
  await expect(html).toHaveAttribute('data-accent', 'aqua')
})

test('Limonacho greets you on the first poke of a visit, and only on that one', async ({ page }) => {
  // Counting calls to play() is the only way to see the sound without a
  // speaker, and stubbing it also keeps the run silent.
  await page.addInitScript(() => {
    window.__acho = 0
    HTMLMediaElement.prototype.play = function play() {
      if (this.src.endsWith('/assets/sound/acho.mp3')) window.__acho += 1
      return Promise.resolve()
    }
  })

  await page.goto('/')

  // He is parked off-screen until the hero is behind you.
  const bringHimIn = () => page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  const lemon = page.locator('.lemon')
  const bubble = page.locator('.bubble')
  const plays = () => page.evaluate(() => window.__acho)

  await bringHimIn()
  await expect(page.locator('.pet')).toHaveClass(/shown/)

  /*
    Count the shake replays from the class itself instead of polling for it: the
    class is only there for half a second, and under a loaded parallel run a
    polling assertion can miss that window and go red for no reason. The counter
    only ever goes up, so waiting for a number is race-free.
  */
  await page.evaluate(() => {
    window.__shakes = 0
    const lemon = document.querySelector('.lemon')
    new MutationObserver(() => {
      if (lemon.classList.contains('shaking')) window.__shakes += 1
    }).observe(lemon, { attributes: true, attributeFilter: ['class'] })
  })
  const shakes = () => page.evaluate(() => window.__shakes)

  // The greeting: the voice, the bubble and one shake.
  await lemon.click()
  expect(await plays()).toBe(1)
  await expect.poll(shakes).toBe(1)
  await expect(bubble).toBeVisible()

  // Let the bubble keep to its own four seconds, so the next poke starts from a
  // clean slate and can be read as "and nothing came back".
  await expect(bubble).toBeHidden({ timeout: 6000 })

  // A later poke is only the shake: no second voice, and nothing to say.
  await lemon.click()
  expect(await plays()).toBe(1)
  await expect.poll(shakes).toBe(2)
  await expect(bubble).toBeHidden()

  // A reload is a new visit: the flag is module state, not anything written
  // down, so the greeting comes back. The stub resets too, which is what makes
  // the second 1 below mean "played again".
  await page.reload()
  await bringHimIn()
  await lemon.click()
  expect(await plays()).toBe(1)
  await expect(bubble).toBeVisible()

  // And the clip it asks for is really there, and really audio.
  const clip = await page.request.get('/assets/sound/acho.mp3')
  expect(clip.ok()).toBe(true)
  expect(clip.headers()['content-type']).toContain('audio')
})

test('the hero glow turns, and stops turning under reduced motion', async ({ page, isMobile }) => {
  test.skip(isMobile, 'the stage is not rendered below 900px')

  await page.goto('/')

  /*
    Reading the animated custom property is the only way to see the rotation
    from outside, and it is also the point: the whole effect rests on
    --glow-angle being registered with @property. Without that registration a
    custom property is a string, the animation has nothing to interpolate and
    the angle never moves — a still ring, and this test says so.
  */
  const angle = () =>
    page.evaluate(() =>
      getComputedStyle(document.querySelector('.frame'), '::before')
        .getPropertyValue('--glow-angle')
        .trim(),
    )

  const first = await angle()
  await page.waitForTimeout(700)
  expect(await angle()).not.toBe(first)

  // Decorative: reduced motion leaves the ring where it is.
  await page.emulateMedia({ reducedMotion: 'reduce' })
  const still = await angle()
  await page.waitForTimeout(700)
  expect(await angle()).toBe(still)
})
