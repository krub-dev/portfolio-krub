/*
  The shared setup for the end-to-end flows, in one place.

  Every function here exists because of a quirk of the browser or of Playwright,
  and scattering the workarounds through the tests made them read as noise. A
  test should say what it checks; the how is here, said once.
*/

/*
  Open the site. Reduced motion is off by default and asked for explicitly, so a
  test that needs an animation to actually run does not get it switched off by
  accident. With it on, a transform lands instantly and the assertions do not
  race the curve — it is the same code with the transition off.
*/
export async function openSite(page, { reduced = false, path = '/', width, height } = {}) {
  if (reduced) await page.emulateMedia({ reducedMotion: 'reduce' })
  if (width) await page.setViewportSize({ width, height })
  await page.goto(path)
}

/*
  Scroll instantly. `html { scroll-behavior: smooth }` is global, so a plain
  scrollTo animates — and an assertion read mid-flight is not the state it
  checks. It also outran a 2s poll under parallel workers, which is what flaked.
*/
export function scrollTo(page, top) {
  return page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), top)
}

export function scrollToBottom(page) {
  return page.evaluate(() =>
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' }),
  )
}

/* Put an element at a known `offset` from the top, instantly. Deterministic:
   scrollIntoViewIfNeeded may not scroll at all when the element is already
   partly visible, which leaves it short of whatever line the assertion uses. */
export function scrollToTopOf(page, selector, offset = 0) {
  return page.evaluate(
    ([sel, gap]) => {
      const el = document.querySelector(sel)
      window.scrollTo({
        top: el.getBoundingClientRect().top + window.scrollY - gap,
        behavior: 'instant',
      })
    },
    [selector, offset],
  )
}

/* Put an element in the middle of the viewport, instantly, for the same reason. */
export function bringIntoView(locator) {
  return locator.evaluate((el) => el.scrollIntoView({ behavior: 'instant', block: 'center' }))
}

/* Where a rail is, read off its transform matrix: zero at the start, negative
   as it moves on. */
export function trackShift(track) {
  return track.evaluate((el) => {
    const value = getComputedStyle(el).transform
    return value === 'none' ? 0 : Math.round(new DOMMatrixReadOnly(value).m41)
  })
}

/* The pager's arrows are visually hidden on a phone — the swipe is the gesture
   there — so they are pressed through the DOM. What the test is about is what
   paging does, not where the button is. */
export function pressWhenHidden(button, isMobile) {
  return isMobile ? button.evaluate((el) => el.click()) : button.click()
}

/* A finger, dispatched as real touch events. Playwright's own tap is a pointer
   event and does not exercise `touch-action`, and the drag has to start over a
   card rather than the gap between two. */
export async function touchDrag(page, { from, to, y, steps = 8 }) {
  const client = await page.context().newCDPSession(page)
  const at = (x) => [{ x, y, radiusX: 6, radiusY: 6, force: 1, id: 1 }]

  await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: at(from) })
  for (let step = 1; step <= steps; step += 1) {
    await client.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: at(from + ((to - from) * step) / steps),
    })
  }
  await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
}
