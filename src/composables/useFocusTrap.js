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

  function onKeydown(event) {
    if (event.key !== 'Tab') return

    const items = focusable()
    if (items.length === 0) return

    const first = items[0]
    const last = items[items.length - 1]

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  watch(active, async (isActive) => {
    if (isActive) {
      previouslyFocused = document.activeElement
      document.addEventListener('keydown', onKeydown)
      // Wait for the dialog to actually be in the DOM before reaching into it.
      await nextTick()
      focusable()[0]?.focus()
    } else {
      document.removeEventListener('keydown', onKeydown)
      previouslyFocused?.focus?.()
      previouslyFocused = null
    }
  })

  onUnmounted(() => document.removeEventListener('keydown', onKeydown))
}
