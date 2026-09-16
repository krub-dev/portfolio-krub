import { onMounted, onUnmounted, watch } from 'vue'

/*
  Publishes an element's real height as a CSS custom property on <html>, so
  that other parts of the page can reserve room for it in CSS.

  Two elements need this, and for the same underlying reason: the navbar and
  the footer are both position:fixed, so they are out of the document flow and
  the page has no idea how much space they take. Hardcoding either height works
  right up until the text wraps — which it does on narrow screens, and can do
  on a language change, since the Spanish strings are longer.

  A ResizeObserver is the right tool: it fires whenever the element's box
  changes, whatever the cause — window resize, font load, wrapping, a language
  switch. No polling, and no guessing which events to listen to.

  With one exception, see the visualViewport listener below.
*/
export function useElementHeight(elementRef, cssVariable) {
  let observer = null
  let el = null
  let last = null

  // getBoundingClientRect(), not entry.contentRect: contentRect is the CONTENT
  // box, so an element with padding would be reported short by exactly that
  // padding — 18px, for the footer, which is why the page used to reserve too
  // little and the fixed footer sat on top of the contact section.
  //
  // The last-value check is what keeps an extra firing free: the observer may
  // report a change the number does not actually move for, and writing the same
  // value again is a style recalculation on <html> for nothing.
  function publish() {
    if (!el) return
    const height = Math.ceil(el.getBoundingClientRect().height)
    if (height === last) return
    last = height
    document.documentElement.style.setProperty(cssVariable, `${height}px`)
  }

  // The ref is null until the component mounts, so watch it rather than
  // reading it once.
  const stop = watch(
    elementRef,
    (element) => {
      observer?.disconnect()
      el = element
      if (!el) return

      // box: 'border-box', not the default content box: a height that changes
      // because of padding (the footer's safe-area inset) has to be reported.
      observer = new ResizeObserver(publish, { box: 'border-box' })
      observer.observe(el)
      publish()
    },
    { immediate: true },
  )

  /*
    The iOS toolbar collapsing is the case a ResizeObserver can miss. It changes
    the bottom safe-area inset, and that lands in the footer's padding: on a real
    iPhone the footer grows about 25px and the observer does not report it, so
    --footer-h kept the old number and the lemon, which stands on the footer,
    ended up overlapping it.

    visualViewport fires `resize` when the toolbar collapses, which is exactly
    when the number has to be read again. Only `resize` — `scroll` fires
    continuously while the page is scrolled on iOS, and reading layout once per
    frame to publish a number that has not moved is a cost with no return.
  */
  const viewport = typeof window === 'undefined' ? null : window.visualViewport

  onMounted(() => {
    viewport?.addEventListener('resize', publish)
  })

  onUnmounted(() => {
    stop()
    observer?.disconnect()
    viewport?.removeEventListener('resize', publish)
    // Not removed from the element: the fallback in tokens.css takes over, and
    // a property that disappears mid-session would collapse the layout that
    // depends on it.
    document.documentElement.style.removeProperty(cssVariable)
  })
}
