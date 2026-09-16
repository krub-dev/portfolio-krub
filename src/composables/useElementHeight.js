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

  // getBoundingClientRect(), not entry.contentRect: contentRect is the CONTENT
  // box, so an element with padding would be reported short by exactly that
  // padding — 18px, for the footer, which is why the page used to reserve too
  // little and the fixed footer sat on top of the contact section.
  function publish() {
    if (!el) return
    document.documentElement.style.setProperty(cssVariable, `${Math.ceil(el.getBoundingClientRect().height)}px`)
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
    ended up overlapping it. visualViewport fires when the toolbar moves, which
    is exactly when the number has to be read again.
  */
  const viewport = typeof window === 'undefined' ? null : window.visualViewport

  onMounted(() => {
    viewport?.addEventListener('resize', publish)
    viewport?.addEventListener('scroll', publish)
  })

  onUnmounted(() => {
    stop()
    observer?.disconnect()
    viewport?.removeEventListener('resize', publish)
    viewport?.removeEventListener('scroll', publish)
    // Not removed from the element: the fallback in tokens.css takes over, and
    // a property that disappears mid-session would collapse the layout that
    // depends on it.
    document.documentElement.style.removeProperty(cssVariable)
  })
}
