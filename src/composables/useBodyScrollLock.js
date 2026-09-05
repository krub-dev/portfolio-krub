import { onUnmounted, watch } from 'vue'

/*
  Stops the page scrolling behind the modal.

  `overflow: hidden` on <body> alone has a well-known side effect: on desktop
  the scrollbar disappears, the viewport gets ~15px wider, and the whole page
  visibly jumps sideways as the modal opens. The fix is to replace the missing
  scrollbar with padding of exactly the same width.

  window.innerWidth includes the scrollbar; documentElement.clientWidth does
  not. The difference is the scrollbar's width — 0 on overlay-scrollbar
  platforms (most phones, macOS by default), where no padding gets added and
  nothing moves.

  The previous inline values are captured rather than assumed, so unlocking
  restores whatever was there instead of blanking it.
*/
export function useBodyScrollLock(active) {
  let previousOverflow = ''
  let previousPadding = ''
  let locked = false

  function lock() {
    if (locked) return
    const gap = window.innerWidth - document.documentElement.clientWidth

    previousOverflow = document.body.style.overflow
    previousPadding = document.body.style.paddingRight

    document.body.style.overflow = 'hidden'
    if (gap > 0) document.body.style.paddingRight = `${gap}px`

    locked = true
  }

  function unlock() {
    if (!locked) return
    document.body.style.overflow = previousOverflow
    document.body.style.paddingRight = previousPadding
    locked = false
  }

  watch(active, (isActive) => (isActive ? lock() : unlock()), { immediate: true })

  // A modal unmounted while open would otherwise leave the page unscrollable
  // forever, with no visible cause.
  onUnmounted(unlock)
}
