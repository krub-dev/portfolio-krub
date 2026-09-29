import { onUnmounted, watch } from 'vue'

/*
  Stops the page scrolling behind a dialog.

  Three things, because each platform needs a different one:

  1. **`overflow: hidden` on <body>** — the desktop case. On its own it has a
     well-known side effect: the scrollbar disappears, the viewport gets ~15px
     wider, and the whole page visibly jumps sideways as the dialog opens. The
     fix is to replace the missing scrollbar with padding of exactly the same
     width.
  2. **`position: fixed` on <body>, with the scroll offset in `top`** — the iOS
     case. iOS does not honour `overflow: hidden` on the body: the document still
     scrolls, which is how a finger could drag the page around under an open
     dialog. Taking the body out of flow is what stops it there, and the offset
     keeps the page exactly where it was.
  3. **A module flag** the rest of the app can read, `isScrollLocked()`, so the
     magnetic hover stands down while a dialog is over the page.

  The previous inline values are captured rather than assumed, so unlocking
  restores whatever was there instead of blanking it.
*/

let locks = 0

// True while any dialog holds the page still.
export const isScrollLocked = () => locks > 0

export function useBodyScrollLock(active) {
  let previous = null
  let scrollY = 0

  function lock() {
    if (previous) return
    const body = document.body
    const gap = window.innerWidth - document.documentElement.clientWidth

    previous = {
      overflow: body.style.overflow,
      paddingRight: body.style.paddingRight,
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
    }
    scrollY = window.scrollY

    body.style.overflow = 'hidden'
    if (gap > 0) body.style.paddingRight = `${gap}px`
    body.style.position = 'fixed'
    body.style.top = `${-scrollY}px`
    body.style.width = '100%'

    locks += 1
  }

  function unlock() {
    if (!previous) return
    const body = document.body

    body.style.overflow = previous.overflow
    body.style.paddingRight = previous.paddingRight
    body.style.position = previous.position
    body.style.top = previous.top
    body.style.width = previous.width
    previous = null

    /*
      Back where the page was, at once. The body was fixed, so the document sat
      at the top; `html { scroll-behavior: smooth }` is global, and without
      turning it off for this jump the page would glide back under the dialog
      that is closing.
    */
    const root = document.documentElement
    const smooth = root.style.scrollBehavior
    root.style.scrollBehavior = 'auto'
    // Reading layout first: the style has to be applied before the jump, or the
    // smooth behaviour is still the one in force.
    void root.offsetHeight
    window.scrollTo(0, scrollY)
    root.style.scrollBehavior = smooth

    locks = Math.max(0, locks - 1)
  }

  watch(active, (isActive) => (isActive ? lock() : unlock()), { immediate: true })

  // A dialog unmounted while open would otherwise leave the page unscrollable
  // forever, with no visible cause.
  onUnmounted(unlock)
}
