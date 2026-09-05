import { onUnmounted, watch } from 'vue'

/*
  Publishes the footer's real height as the CSS variable --footer-h on <html>.

  The footer is position:fixed, so it is out of the document flow and would sit
  on top of the last section. The page reserves room for it with
  `padding-bottom: var(--footer-h)`. Hardcoding a height would break the moment
  the text wraps to two lines — which it does on narrow screens, and can do on
  a language change, since the Spanish strings are longer.

  A ResizeObserver is the right tool: it fires whenever the element's box
  changes, whatever the cause — window resize, font load, wrapping, a language
  switch. No polling, no guessing which events to listen to.
*/
export function useFooterHeight(elementRef) {
  let observer = null

  function publish(height) {
    document.documentElement.style.setProperty('--footer-h', `${Math.ceil(height)}px`)
  }

  // The ref is null until the component mounts, so watch it rather than
  // reading it once.
  const stop = watch(
    elementRef,
    (el) => {
      observer?.disconnect()
      if (!el) return

      observer = new ResizeObserver(([entry]) => {
        publish(entry.contentRect.height + getBorders(el))
      })
      observer.observe(el)
      publish(el.getBoundingClientRect().height)
    },
    { immediate: true },
  )

  // contentRect excludes borders; the footer has a 1px top border that the
  // page still has to reserve space for.
  function getBorders(el) {
    const s = getComputedStyle(el)
    return parseFloat(s.borderTopWidth) + parseFloat(s.borderBottomWidth)
  }

  onUnmounted(() => {
    stop()
    observer?.disconnect()
    document.documentElement.style.removeProperty('--footer-h')
  })
}
