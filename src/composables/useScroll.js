import { onMounted, onUnmounted, readonly, ref } from 'vue'

/*
  ONE scroll listener for the whole app.

  The navbar (compact state), the footer (slide-in) and the scroll indicator
  all react to scrolling. Three components each adding their own listener would
  mean three handlers on an event that fires constantly. This module owns a
  single listener and a reference count: the first component to call useScroll()
  attaches it, the last one to unmount removes it.

  Everything is computed synchronously in the handler, on purpose. Two earlier
  versions of this file were cleverer and both were wrong:

  - Throttling with requestAnimationFrame and a `ticking` flag: if one frame is
    ever dropped, `ticking` stays true and every later scroll event is silently
    discarded. The state freezes and never recovers.
  - Caching the scrollable distance and refreshing it from a ResizeObserver:
    the first component to call this mounts BEFORE the router has rendered the
    page, so the cached value was measured against a nearly empty document and
    every position afterwards reported 100%. It only corrected itself if the
    observer happened to fire.

  So `max` is recomputed on every scroll. Yes, reading scrollHeight forces
  layout — but nothing writes to the DOM in this handler, so the layout is
  already clean and the read is cheap. Correct beats clever here.
*/

const y = ref(0) //         pixels scrolled from the top
const progress = ref(0) //  0 at the top, 1 at the bottom
const atEnd = ref(false) // past 98% — the scroll indicator fades out here

let listeners = 0

function update() {
  // How far the page can actually scroll. Zero on a page shorter than the
  // window, which would otherwise divide by zero.
  const max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight)

  y.value = window.scrollY
  progress.value = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0
  atEnd.value = progress.value > 0.98
}

export function useScroll() {
  onMounted(() => {
    if (listeners === 0) {
      // passive tells the browser we will never call preventDefault, so it can
      // keep scrolling without waiting for this handler.
      window.addEventListener('scroll', update, { passive: true })
      window.addEventListener('resize', update, { passive: true })
    }
    listeners += 1
    update()
  })

  onUnmounted(() => {
    listeners -= 1
    if (listeners === 0) {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  })

  return { y: readonly(y), progress: readonly(progress), atEnd: readonly(atEnd) }
}
