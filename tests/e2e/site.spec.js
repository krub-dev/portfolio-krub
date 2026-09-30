import { expect, test } from '@playwright/test'

import {
  bringIntoView,
  openSite,
  scrollTo,
  scrollToBottom,
  scrollToTopOf,
  touchDrag,
  trackShift,
} from './helpers.js'

/*
  These flows. Each one is here because it could not be verified any other way —
  they all depend on scroll events, animation frames or CSS transitions
  actually advancing.

  The setup they share — reduced motion, the instant scrolls, the touch
  dispatch — lives in helpers.js: a test says what it checks, not how the
  browser had to be coaxed into checking it.
*/

test.describe('chrome reacts to scrolling', () => {
  test.skip(({ isMobile }) => isMobile, 'the desktop navbar is hidden below 900px')

  test('the navbar goes compact and shrinks to its own contents', async ({ page }) => {
    await openSite(page)
    const capsule = page.locator('.capsule')

    const wide = (await capsule.boundingBox()).width
    expect(wide).toBeGreaterThan(1000)

    await scrollTo(page, 600)
    // The capsule animates its max-width over 0.55s; wait for the end state
    // rather than for a fixed delay.
    await expect(capsule).toHaveClass(/compact/)
    await expect
      .poll(async () => (await capsule.boundingBox()).width, { timeout: 2000 })
      .toBeLessThan(wide - 200)
  })

  test('the footer slides in and never covers the last section', async ({ page }) => {
    await openSite(page)
    const footer = page.locator('footer')
    const viewport = page.viewportSize().height

    // Off-screen at the top of the page.
    expect((await footer.boundingBox()).y).toBeGreaterThanOrEqual(viewport - 1)

    await scrollToBottom(page)
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
    await openSite(page)
    const active = page.locator('.link.active')

    // At the top nothing is active: the hero has no nav link.
    await expect(active).toHaveCount(0)

    for (const id of ['me', 'projects', 'stack', 'contact']) {
      /*
        Deliberately deterministic: put the section's top edge at a known 100px
        rather than trusting scrollIntoViewIfNeeded, which may not scroll at all
        when the element is already partly visible and leaves the section short
        of the spy's 35%-of-viewport line.
      */
      await scrollToTopOf(page, `#${id}`, 100)
      await expect(active).toHaveCount(1)
      await expect(active).toHaveAttribute('href', `/#${id}`)
    }
  })
})

test('the project modal traps focus, closes on Escape and gives focus back', async ({ page }) => {
  await openSite(page)

  const card = page.locator('.card .open').first()
  const name = await card.textContent()
  await card.focus()
  await card.press('Enter')

  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  await expect(dialog.locator('.name')).toHaveText(name.trim())

  /*
    The media strip spans the whole panel. As a flex item with an aspect-ratio
    and only a max-height, its width was derived from its height — about 600px
    in a 1000px panel, with the rest of the row left empty.
  */
  const panelBox = await dialog.boundingBox()
  const mediaBox = await dialog.locator('.carousel').boundingBox()
  expect(mediaBox.width).toBeGreaterThan(panelBox.width * 0.95)

  // Focus moved inside, and the page behind cannot scroll.
  await expect(dialog.locator(':focus')).toHaveCount(1)
  await expect(page.locator('body')).toHaveCSS('overflow', 'hidden')

  // Tab all the way round: focus must never leave the dialog.
  for (let i = 0; i < 8; i += 1) {
    await page.keyboard.press('Tab')
    expect(await dialog.evaluate((el) => el.contains(document.activeElement))).toBe(true)
  }

  // The media slides and pages by its dots: the track moves, and the dot you are
  // on is the longer pill. Last before closing, because WebKit does not focus a
  // button on click and an earlier click would leave the focus checks above with
  // nothing focused.
  const dots = dialog.locator('.dots .dot')
  await expect(dots).toHaveCount(4)
  const track = dialog.locator('.carousel .track')
  await dots.nth(2).click()
  await expect(dots.nth(2)).toHaveClass(/active/)
  await expect(dots.nth(0)).not.toHaveClass(/active/)
  await expect.poll(() => trackShift(track)).toBeLessThan(-100)

  // And a drag takes the next slide, the way the rail does. The media is brought
  // back into view first: the tab loop above leaves the panel scrolled to whatever
  // it focused, and a drag measured off a half-hidden strip lands on nothing.
  await bringIntoView(dialog.locator('.carousel'))
  const box = await dialog.locator('.carousel').boundingBox()
  const midY = box.y + box.height / 2
  await page.mouse.move(box.x + box.width * 0.75, midY)
  await page.mouse.down()
  await page.mouse.move(box.x + box.width * 0.15, midY, { steps: 6 })
  await page.mouse.up()
  await expect(dots.nth(3)).toHaveClass(/active/)

  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
  await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden')
  await expect(card).toBeFocused()
})

test('a click on the card opens the project, not just the keyboard', async ({ page }) => {
  await openSite(page)
  await bringIntoView(page.locator('#projects .viewport'))
  await page.waitForTimeout(300)

  const box = await page.locator('#projects .card').first().boundingBox()
  /*
    Away from the title, on the card's own surface: the overlay is what makes the
    whole card the button's target, and it was the mouse path that was broken.
    The rail captured the pointer on pointerdown, so the pointerup went to the
    viewport and the click landed on the viewport too, and no card ever opened.
    The keyboard was the only path that worked, which is why the modal test above
    never caught it: it opens with focus and Enter.
  */
  await page.mouse.click(box.x + box.width / 2, box.y + box.height - 90)
  await expect(page.getByRole('dialog')).toBeVisible()
})

test('the parked card fills its arrow where there is no hover', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'only a touch device marks the parked card')
  await openSite(page)
  await bringIntoView(page.locator('#projects .viewport'))

  // The marker is the border AND the arrow. The fill lived in the hover block,
  // so on a phone the card was marked and its arrow was not.
  const arrow = page.locator('#projects .card.current .arrow')
  await expect(arrow).toHaveCSS('background-color', 'rgb(255, 200, 0)')
  await expect(arrow).toHaveCSS('color', 'rgb(12, 12, 13)')
})

test('the project rail pages to the end with its dots', async ({ page }) => {
  await openSite(page, { reduced: true })

  const track = page.locator('#projects .track')
  const shift = () => trackShift(track)
  const dots = page.locator('#projects .dots .dot')
  const viewport = page.locator('#projects .viewport')

  // One dot per parking spot, and the first is the one you start on.
  const count = await dots.count()
  expect(count).toBeGreaterThan(1)
  await expect(dots.first()).toHaveClass(/active/)
  expect(await shift()).toBe(0)

  /*
    And the edge with nothing beyond it is not faded: the first card's rounded
    corner sits on the left edge, and fading that side would eat it. The fade
    follows the live position, so at the ends it is one-sided.
  */
  await expect(viewport).toHaveClass(/fade-right/)

  // Jump to the last spot.
  await dots.last().click()
  await expect.poll(shift).toBeLessThan(0)
  await expect(dots.last()).toHaveClass(/active/)
  await expect(dots.first()).not.toHaveClass(/active/)

  /*
    At the far end it is the other way round: nothing hangs off the right, so
    that side is not faded. (With the CTA card the rail can end exactly on the
    edge, and then there is no fade at all.)
  */
  await expect(viewport).not.toHaveClass(/fade-right/)

  // And the card it was hiding ended up inside the rail.
  const last = await page.locator('#projects .cta').boundingBox()
  const rail = await page.locator('#projects .viewport').boundingBox()
  expect(last.x + last.width).toBeLessThanOrEqual(rail.x + rail.width + 1)

  // Back to the start.
  await dots.first().click()
  await expect.poll(shift).toBe(0)
  await expect(dots.first()).toHaveClass(/active/)
})

test('the rail ends on a card that goes to GitHub', async ({ page }) => {
  await openSite(page)
  await bringIntoView(page.locator('#projects .viewport'))

  const cta = page.locator('#projects .cta')
  await expect(cta).toBeVisible()
  // The dashed border is drawn with an SVG rect, so its dashes can be longer and
  // thicker than the browser's fixed pattern.
  await expect(cta.locator('.dashes rect')).toHaveCount(1)
  await expect(cta.getByRole('link')).toHaveAttribute('href', 'https://github.com/krub-dev')

  // And it is the same size as the cards beside it.
  const card = await page.locator('#projects .card').first().boundingBox()
  const box = await cta.boundingBox()
  expect(Math.abs(box.width - card.width)).toBeLessThan(1)
  expect(Math.abs(box.height - card.height)).toBeLessThan(1)
})

test('the navbar only takes clicks where the capsule is', async ({ page }) => {
  await openSite(page)

  // Past 60px the capsule compacts and shrinks to hug its own contents.
  await scrollTo(page, 400)
  await expect(page.locator('.capsule')).toHaveClass(/compact/)

  /*
    The bar is a full-width fixed strip. Without pointer-events:none on it, its
    empty half swallowed every click that landed in that band — which is
    anything that scrolls up behind the compact capsule, a third of its width:
    the project arrows, the appearance controls, any button.
  */
  const hit = await page.evaluate(() => {
    const band = document.querySelector('.bar').getBoundingClientRect()
    const capsule = document.querySelector('.capsule').getBoundingClientRect()
    const y = band.top + band.height / 2
    const right = capsule.right + 40
    const x = right < window.innerWidth - 8 ? right : capsule.left - 40
    return document.elementFromPoint(x, y)?.closest('.bar') ? 'bar' : 'content'
  })
  expect(hit).toBe('content')

  // And the capsule itself is still live.
  const onCapsule = await page.evaluate(() => {
    const capsule = document.querySelector('.capsule').getBoundingClientRect()
    const el = document.elementFromPoint(capsule.left + 4, capsule.top + capsule.height / 2)
    return Boolean(el?.closest('.capsule'))
  })
  expect(onCapsule).toBe(true)
})

test('the grid cell under the pointer lights up', async ({ page, isMobile }) => {
  test.skip(isMobile, 'there is no pointer below 900px')

  await openSite(page)
  test.skip((await page.locator('.grid-cell').count()) === 0, 'grid cell off (config.showGridCell)')

  const cell = page.locator('.grid-cell')
  await page.mouse.move(1000, 400)

  // Snapped to the 72px step, not eased: 1000 -> 13 cells, 400 -> 5.
  await expect
    .poll(() => cell.evaluate((el) => el.style.transform))
    .toBe('translate(936px, 360px)')
})

test('the grid cell follows the hero grid once the page scrolls', async ({ page, isMobile }) => {
  test.skip(isMobile, 'the hero layer is not the one being followed there')

  await openSite(page)
  test.skip((await page.locator('.grid-cell').count()) === 0, 'grid cell off (config.showGridCell)')

  const cell = page.locator('.grid-cell')

  await page.mouse.move(900, 400)
  await expect
    .poll(() => cell.evaluate((el) => el.style.transform))
    .toBe('translate(864px, 360px)')

  /*
    The hero layer is absolute, so its lines move up with the page while the cell
    stays fixed to the viewport. Snapped to the viewport it came apart from the
    grid you can see; it snaps in page coordinates until the fixed layer takes
    over, and it does so without the pointer moving. At scroll 150 and y 400:
    -150 + floor(550 / 72) * 72 = 354.
  */
  await page.evaluate(() => window.scrollTo({ top: 150, behavior: 'instant' }))
  await expect(cell).not.toHaveClass(/idle/)
  await expect
    .poll(() => cell.evaluate((el) => el.style.transform))
    .toBe('translate(864px, 354px)')
})

test('the cursor stays when the pointer sits still', async ({ page, isMobile }) => {
  test.skip(isMobile, 'there is no cursor below 900px')

  await openSite(page)
  const dot = page.locator('.cursor-dot')

  await page.mouse.move(300, 400)
  await expect(dot).not.toHaveClass(/idle/)

  // It used to fade out after two seconds of stillness. It does not any more.
  await page.waitForTimeout(2600)
  await expect(dot).not.toHaveClass(/idle/)
})

test('on touch the grid cell lights where you tap, and a scroll clears it', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'this is the path taken when there is no cursor')

  await openSite(page)
  test.skip((await page.locator('.grid-cell').count()) === 0, 'grid cell off (config.showGridCell)')

  const cell = page.locator('.grid-cell')
  await page.touchscreen.tap(300, 400)

  // Snapped to the 72px step: 300 -> 4 cells, 400 -> 5.
  await expect
    .poll(() => cell.evaluate((el) => el.style.transform))
    .toBe('translate(288px, 360px)')
  await expect(cell).not.toHaveClass(/idle/)

  // It stays: no timer takes it away.
  await page.waitForTimeout(1200)
  await expect(cell).not.toHaveClass(/idle/)

  // A scroll is what clears it, so it is not left behind while the page moves.
  await page.evaluate(() => window.scrollTo({ top: 300, behavior: 'instant' }))
  await expect(cell).toHaveClass(/idle/)
})

test('the rail never fades the card it is parked on', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'only a phone has a position with a whole card either side')

  await openSite(page, { reduced: true })

  const viewport = page.locator('#projects .viewport')

  // One card in: the one behind is exactly off the rail — a card plus a gap of
  // travel — so there is nothing on that side to soften, and the card the rail
  // is parked on must not be faded. Reading "has the rail moved" instead of "is
  // a card hanging off it" faded its left edge, which is what this guards.
  await page.locator('#projects .dots .dot').nth(1).click()
  await expect(viewport).toHaveClass(/fade-right/)
  await expect(viewport).not.toHaveClass(/fade-both/)
})

test('the project rail drags with the mouse, and a drag does not open a card', async ({ page }) => {
  await openSite(page, { reduced: true })

  const viewport = page.locator('#projects .viewport')
  const track = page.locator('#projects .track')
  const shift = () => trackShift(track)

  await bringIntoView(viewport)

  const box = await viewport.boundingBox()
  const middle = box.y + box.height / 2

  /*
    A deliberately short drag — 100px, a quarter of a card. It has to take the
    next card; settling on the nearest one would put the rail back where it
    started, which is what "it will not move" was.
  */
  await page.mouse.move(box.x + 120, middle)
  await page.mouse.down()
  await page.mouse.move(box.x + 20, middle, { steps: 12 })
  await page.mouse.up()

  // The rail moved on...
  await expect.poll(shift).toBeLessThan(-100)

  // ...and the card the drag ended over did not open. Without the click guard
  // the whole card is a click target, so a drag would open whatever it lands on.
  await expect(page.getByRole('dialog')).toBeHidden()
})

test('on touch the rail marks the card it is parked on', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'the marker exists because there is no hover to mark it')

  await openSite(page, { reduced: true })

  const cards = page.locator('#projects .card')

  // The first card carries it, the rest do not.
  await expect(cards.nth(0)).toHaveClass(/current/)
  await expect(cards.nth(1)).not.toHaveClass(/current/)

  // And it moves with the rail, not with the finger.
  await page.locator('#projects .dots .dot').nth(1).click()
  await expect(cards.nth(1)).toHaveClass(/current/)
  await expect(cards.nth(0)).not.toHaveClass(/current/)
})

test('the testimonials page one at a time', async ({ page }) => {
  await openSite(page, { reduced: true })

  const count = page.locator('.testimonials .position')
  const quote = page.locator('.testimonials .quote')
  const dots = page.locator('.testimonials .dot')

  // The count follows the data, so adding a quote does not break the test.
  const total = await dots.count()
  await expect(dots.nth(0)).toHaveClass(/active/)
  await expect(count).toHaveText(`1 / ${total}`)

  // Only the current quote is in the DOM at all.
  await expect(page.locator('.testimonials .entry')).toHaveCount(1)

  // Paging only means something with more than one quote.
  test.skip(total < 2, 'one quote so far')
  const first = await quote.textContent()

  await dots.nth(1).click()
  await expect(count).toHaveText(`2 / ${total}`)
  await expect(dots.nth(1)).toHaveClass(/active/)
  await expect(dots.nth(0)).not.toHaveClass(/active/)
  await expect(quote).not.toHaveText(first)

  await dots.nth(0).click()
  await expect(count).toHaveText(`1 / ${total}`)
  await expect(dots.nth(0)).toHaveClass(/active/)
})

test('clicking the card goes to the next quote and wraps', async ({ page }) => {
  await openSite(page, { reduced: true, width: 420, height: 900 })

  const count = page.locator('.testimonials .position')
  const pane = page.locator('.testimonials .pane')
  const total = await page.locator('.testimonials .dot').count()
  test.skip(total < 2, 'one quote so far')

  await expect(count).toHaveText(`1 / ${total}`)
  await pane.click({ position: { x: 30, y: 50 } })
  await expect(count).toHaveText(`2 / ${total}`)

  // Clicking past the last one wraps to the first.
  for (let i = 1; i < total; i += 1) {
    await pane.click({ position: { x: 30, y: 50 } })
  }
  await expect(count).toHaveText(`1 / ${total}`)
})

test('the read more button does not page the quote', async ({ page }) => {
  await openSite(page, { reduced: true, width: 420, height: 900 })

  const count = page.locator('.testimonials .position')
  const more = page.locator('.testimonials .entry .more')
  const total = await page.locator('.testimonials .dot').count()

  await expect(count).toHaveText(`1 / ${total}`)
  await more.click()
  await expect(count).toHaveText(`1 / ${total}`)
})

test('the testimonial dots are visible and tappable on every viewport', async ({ page }) => {
  await openSite(page, { reduced: true })

  const dots = page.locator('.testimonials .dot')
  await expect(dots.first()).toBeVisible()
  expect(await dots.count()).toBeGreaterThanOrEqual(1)

  // WCAG 2.2 asks for 24px: the mark is 8px, the button that carries it is 24.
  const box = await dots.first().boundingBox()
  expect(box.width).toBeGreaterThanOrEqual(24)
})

test('the about tabs are a real tablist', async ({ page }) => {
  await openSite(page, { reduced: true })

  const tabs = page.locator('.about [role="tab"]')
  await expect(tabs).toHaveCount(3)

  // Roving tabindex: only the selected tab is in the tab order.
  await expect(tabs.nth(0)).toHaveAttribute('tabindex', '0')
  await expect(tabs.nth(1)).toHaveAttribute('tabindex', '-1')

  // The arrows move the selection and take the focus with them.
  await tabs.nth(0).focus()
  await page.keyboard.press('ArrowRight')
  await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true')
  await expect(tabs.nth(1)).toBeFocused()

  // The panel points back at the tab it belongs to.
  await expect(page.locator('.about [role="tabpanel"]')).toHaveAttribute(
    'aria-labelledby',
    'me-tabs-tab-edu',
  )
})

test('opening a quote reveals the rest, and closing hides it again', async ({ page }) => {
  /*
    A phone-width viewport on both projects: on a wide one the real quote fits
    inside the four-line clamp and there is no "read more" to press.
  */
  await openSite(page, { reduced: true, width: 420, height: 900 })

  const quote = page.locator('.testimonials .quote')
  const height = () => quote.evaluate((el) => el.clientHeight)
  const more = page.locator('.testimonials .entry .more')

  // The quote on show has to overflow the clamp for there to be a button.
  test.skip(!(await more.isVisible()), 'the quote fits without a clamp here')
  const clamped = await height()
  await more.click()
  await expect.poll(height).toBeGreaterThan(clamped)

  await more.click()
  await expect.poll(height).toBe(clamped)
})

test('the project rail drags with a finger too', async ({ page, isMobile, browserName }) => {
  test.skip(!isMobile, 'there is no finger on a desktop')
  // The drag is dispatched over CDP, which only Chromium speaks.
  test.skip(browserName !== 'chromium', 'the finger drag uses CDP')

  await openSite(page, { reduced: true })

  const viewport = page.locator('#projects .viewport')
  const track = page.locator('#projects .track')
  const shift = () => trackShift(track)

  await bringIntoView(viewport)
  const box = await viewport.boundingBox()

  // Dispatched as real touch events, starting over a CARD rather than the gap
  // between two, and short enough that the nearest-card rule would undo it.
  await touchDrag(page, {
    from: box.x + 120,
    to: box.x + 20,
    y: box.y + box.height / 2,
  })

  await expect.poll(shift).toBeLessThan(-100)
})

test('an unknown path shows the 404, chrome and all, and offers a way back', async ({ page, isMobile }) => {
  await openSite(page, { path: '/no-such-page' })

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
  await openSite(page)
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
  expect(painted).toBe('rgb(242, 243, 242)')
})

test('the accent cycles and survives a reload', async ({ page, isMobile }) => {
  await openSite(page)
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
  await scrollTo(page, 400)
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
    await scrollTo(page, 800)
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

  await openSite(page)

  // He is parked off-screen until the hero is behind you.
  const bringHimIn = () => scrollToBottom(page)
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

test('the stack is monochrome until the pointer reaches a tile', async ({ page, isMobile }) => {
  test.skip(isMobile, 'there is no pointer below 900px')

  await openSite(page)

  const tile = page.locator('#stack .tile').first()
  await bringIntoView(tile)

  const colour = tile.locator('.colour')
  const opacity = () => colour.evaluate((el) => Number(el.style.opacity || 0))

  // At rest the colour copy is invisible and the tile shows the grey one.
  expect(await opacity()).toBe(0)

  const box = await tile.boundingBox()
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)

  await expect.poll(opacity).toBeGreaterThan(0.5)

  // And Limonacho names it, which is the only visible name there is.
  await expect(page.locator('.pet .bubble')).toHaveText('Java')

  /*
    Beside him, not on his head. The bubble has no tail, so centred over the
    lemon it reads as sitting on his leaf. Polled, because it animates in and a
    rect read mid-animation is not the rect it settles at.
  */
  await expect
    .poll(async () => {
      const bubble = await page.locator('.pet .bubble').boundingBox()
      const lemon = await page.locator('.pet .lemon').boundingBox()
      return bubble.x + bubble.width - lemon.x
    })
    .toBeLessThanOrEqual(1)

  // Out of the grid he stops saying it.
  await page.mouse.move(5, 5)
  await expect(page.locator('.pet .bubble')).toHaveCount(0)
})

test('on touch the stack lights with the scroll, and a tap names a tile', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'this is the path taken when there is no pointer')

  await openSite(page)

  // The light is the scroll, and it comes on group by group from a grey base:
  // with the first group in the middle of the screen, the last one has not been
  // reached yet.
  const tile = page.locator('#stack .tile').first()
  await bringIntoView(tile)

  // Polled, because a scroll event is delivered a frame after the scroll
  // itself, so a plain read can land before the sweep has run.
  const lit = () =>
    page.evaluate(() =>
      [...document.querySelectorAll('#stack .group')].map((group) => {
        const copies = [...group.querySelectorAll('.colour')]
        return copies.reduce((sum, el) => sum + Number(el.style.opacity || 0), 0) / copies.length
      }),
    )

  await expect.poll(async () => (await lit())[0]).toBeGreaterThan(0.8)
  expect((await lit()).at(-1)).toBeLessThan(0.2)

  // A tap names the tile, and Limonacho is the one who says it.
  const name = await tile.getAttribute('data-name')
  await tile.click()

  await expect(page.locator('.pet .bubble')).toHaveText(name)

  // No cursor to follow, so he glances at where the tap landed instead.
  await expect
    .poll(() => page.locator('.pupil').first().evaluate((el) => el.style.transform))
    .not.toBe('')
})

test('the contact form asks for what is missing, then sends', async ({ page }) => {
  // The endpoint is ours, so the suite can stub it and still test the whole
  // flow: validation, the request, the state and the emptying of the fields.
  let posted = null
  await page.route('**/api/contact', async (route) => {
    posted = JSON.parse(route.request().postData() ?? '{}')
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ok: true }),
    })
  })

  await openSite(page)
  await scrollToTopOf(page, '.form', 150)

  const send = page.locator('.form button[type="submit"]')

  // Nothing filled: the button is off, and no field has been scolded yet.
  await expect(send).toBeDisabled()
  await expect(page.locator('.form .error')).toHaveCount(0)

  // Leaving a field shows its error, and it clears the moment it is fixed.
  await page.locator('#contact-name').focus()
  await page.locator('#contact-name').blur()
  await expect(page.locator('#contact-name-error')).toBeVisible()
  await page.locator('#contact-name').fill('Kiko')
  await expect(page.locator('#contact-name-error')).toHaveCount(0)

  await page.locator('#contact-email').fill('kikorubioillan@gmail.com')
  await page.locator('#contact-message').fill('Hola, te escribo por lo del backend.')

  // The three fields are right, but the consent is still missing.
  await expect(send).toBeDisabled()

  // Ticking the box is what arms the button.
  await page.locator('.form .box').check()
  await expect(send).toBeEnabled()

  await send.click()

  await expect(page.locator('.form .status')).toHaveText(/Thanks/)
  expect(posted.name).toBe('Kiko')
  expect(posted.message).toContain('backend')
  expect(posted.consent).toBe(true)

  // Emptied on success, so the same message cannot go twice by accident, and the
  // button goes back to off.
  await expect(page.locator('#contact-name')).toHaveValue('')
  await expect(send).toBeDisabled()
})

test('the privacy link opens the notice on its own route', async ({ page }) => {
  await openSite(page)
  await scrollToTopOf(page, '.form', 150)
  // The form sits near the end of the home page, so the route has to leave the
  // old offset behind: the new page opens at its top, at once.
  expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(1000)

  await page.locator('.form .policy').first().click()

  await expect(page).toHaveURL(/\/privacy$/)
  await expect(page.locator('main h1')).toBeVisible()
  expect(await page.evaluate(() => window.scrollY)).toBe(0)
})

test('the CV opens in a dialog, rendered page by page', async ({ page }) => {
  await openSite(page)

  /*
    Intent warms it: reaching the button (and hovering it) starts the download in
    the background, so the dialog is usually ready by the time it is opened. The
    document is asked for first, which is what this checks.
  */
  await bringIntoView(page.locator('.cv'))
  await page.locator('.cv').hover()
  await expect(page.locator('link[rel="prefetch"][href$="cv-en-dark.pdf"]')).toBeAttached()

  await page.locator('.cv').click()

  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()

  // The pages are painted from the PDF the site already offers for this theme
  // and language, so the dialog and the download cannot disagree about the file.
  await expect(dialog.locator('canvas.page').first()).toBeVisible()
  expect(await dialog.locator('canvas.page').count()).toBeGreaterThan(0)
  await expect(dialog.locator('a[download]')).toHaveAttribute('href', /cv-en-dark\.pdf$/)

  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
})

test('the navbar stays compact while a dialog is open', async ({ page }) => {
  await openSite(page)
  await scrollTo(page, 800)

  const capsule = page.locator('.capsule')
  await expect(capsule).toHaveClass(/compact/)

  await page.locator('.card .open').first().click()
  await expect(page.getByRole('dialog')).toBeVisible()

  /*
    The scroll lock takes the body out of flow, and a fixed body reports the
    scroll as zero — the bar used to believe it and expand to its full width the
    moment a dialog opened.
  */
  await expect(capsule).toHaveClass(/compact/)

  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toBeHidden()
  await expect(capsule).toHaveClass(/compact/)
})

test.describe('3D logo', () => {
  test.skip(({ isMobile }) => isMobile, 'the stage is not mounted below 900px (decision 37)')

  test('falls back to the 2D mark during tests (scene gated)', async ({ page }) => {
    await openSite(page)

    // The scene is gated under navigator.webdriver, so the 2D mark shows instead.
    // This verifies the gate works and the fallback renders.
    const mark = page.locator('.stage .mark')
    await expect(mark).toBeVisible({ timeout: 5000 })
  })
})
