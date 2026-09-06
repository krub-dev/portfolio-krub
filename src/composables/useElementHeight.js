import { onUnmounted, watch } from 'vue'

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
*/
export function useElementHeight(elementRef, cssVariable) {
  let observer = null

  function publish(height) {
    document.documentElement.style.setProperty(cssVariable, `${Math.ceil(height)}px`)
  }

  // The ref is null until the component mounts, so watch it rather than
  // reading it once.
  const stop = watch(
    elementRef,
    (el) => {
      observer?.disconnect()
      if (!el) return

      /*
        getBoundingClientRect(), not entry.contentRect.

        contentRect is the CONTENT box: it excludes padding and border. The
        footer has 9px of vertical padding and a 1px top border, so measuring
        it that way reported 31px for an element that occupies 49 — and the
        page reserved 18px too little, letting the footer sit on top of the
        end of the contact section.

        It hid well. The initial measurement below was already correct; the
        observer then overwrote it with the wrong number, so the bug only
        appeared once something triggered a resize. An end-to-end test in a
        real browser is what surfaced it.
      */
      observer = new ResizeObserver(() => publish(el.getBoundingClientRect().height))
      observer.observe(el)
      publish(el.getBoundingClientRect().height)
    },
    { immediate: true },
  )

  onUnmounted(() => {
    stop()
    observer?.disconnect()
    // Not removed from the element: the fallback in tokens.css takes over, and
    // a property that disappears mid-session would collapse the layout that
    // depends on it.
    document.documentElement.style.removeProperty(cssVariable)
  })
}
