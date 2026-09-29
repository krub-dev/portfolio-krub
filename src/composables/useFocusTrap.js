import { nextTick, onUnmounted, watch } from 'vue'

/*
  Keeps keyboard focus inside the modal while it is open.

  Without this, Tab walks straight out of the dialog and into the page behind
  it — which is still there, still full of links, just invisible under a blur.
  A sighted mouse user never notices; a keyboard or screen-reader user gets
  lost immediately.

  Three jobs:
  1. Move focus into the dialog when it opens, and remember where it came from.
  2. Wrap Tab at the last element and Shift+Tab at the first.
  3. Put focus back where it started when it closes, so the page does not jump
     to the top and the card you opened is still under the cursor.

  The candidate list is queried on each Tab rather than cached: the carousel
  changes what is on screen, and a stale list would trap focus on a button that
  no longer exists.
*/

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

export function useFocusTrap(containerRef, active) {
  let previouslyFocused = null

  function focusable() {
    if (!containerRef.value) return []
    return Array.from(containerRef.value.querySelectorAll(FOCUSABLE)).filter(
      // offsetParent is null for anything display:none — cheaper than
      // checking computed styles, and right for everything here.
      (el) => el.offsetParent !== null || el === document.activeElement,
    )
  }

  /*
    Tab is handled entirely here rather than only at the ends. The end-only
    version assumes the browser can reach the last element, and on WebKit it
    cannot: Safari leaves links out of the tab order by default, so Tab walked
    from the last button straight to the page behind without ever passing the
    last link, and the wrap never fired. Moving focus ourselves makes the dialog
    the only thing that decides where Tab goes, whatever the engine's own order.
  */
  function onKeydown(event) {
    if (event.key !== 'Tab') return

    const items = focusable()
    if (items.length === 0) return

    const index = items.indexOf(document.activeElement)
    event.preventDefault()

    if (event.shiftKey) {
      items[index <= 0 ? items.length - 1 : index - 1].focus()
    } else {
      items[index === -1 ? 0 : (index + 1) % items.length].focus()
    }
  }

  /*
    A second net for escapes that are not a Tab: a programmatic focus, or a click
    that lands behind the dialog. It does not catch focus lost to the document
    (WebKit's own tabbing past the end), because `focusin` has no target then —
    that is the keydown handler's job.
  */
  function onFocusIn(event) {
    if (!containerRef.value) return
    if (containerRef.value.contains(event.target)) return
    focusable()[0]?.focus()
  }

  watch(active, async (isActive) => {
    if (isActive) {
      previouslyFocused = document.activeElement
      document.addEventListener('keydown', onKeydown)
      document.addEventListener('focusin', onFocusIn)
      // Wait for the dialog to actually be in the DOM before reaching into it.
      await nextTick()
      focusable()[0]?.focus()
    } else {
      document.removeEventListener('keydown', onKeydown)
      document.removeEventListener('focusin', onFocusIn)
      previouslyFocused?.focus?.()
      previouslyFocused = null
    }
  })

  onUnmounted(() => {
    document.removeEventListener('keydown', onKeydown)
    document.removeEventListener('focusin', onFocusIn)
  })
}
