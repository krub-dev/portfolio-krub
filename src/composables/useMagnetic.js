import { onMounted, onUnmounted } from 'vue'

import { isScrollLocked } from './useBodyScrollLock'
import { usePointer } from './usePointer'

/*
  Magnetic hover: elements marked [data-magnetic] drift a few pixels toward the
  cursor as it approaches.

  Only ONE element moves at a time — the nearest one within range. Letting
  every nearby element lean at once reads as the page wobbling; picking a
  single winner reads as attraction.

  The shape of the pull is from the design spec §3.14:
    reach  = max(width, height) * 0.75 + 70   how far this element's pull carries
    score  = distance / reach                 0 at the centre, 1 at the edge of range
    pull   = (1 - score)^2 * MAX_PULL         squared, so it ramps up near the centre

  MAX_PULL and EASING are softer than the spec's 16px and 0.14: the effect read
  as too eager and too far. Halving the easing is what makes it feel slow —
  each frame covers less of the remaining distance, so the element glides
  instead of snapping.

  Every element eases toward its target, not just the winner. That is what lets
  the one that just lost glide back to zero instead of jumping.
*/

const REACH_PADDING = 70
const REACH_FACTOR = 0.75
const MAX_PULL = 10 //   how far an element can travel, in px
const EASING = 0.07 //   fraction of the remaining distance covered per frame
const DEAD_ZONE = 12 //  px around the resting centre where no pull is applied

export function useMagnetic(rootSelector = '[data-magnetic]') {
  let elements = []
  let observer = null
  // Current offset per element, keyed by the element itself.
  const offsets = new WeakMap()
  // Whether the loop is standing down because a dialog holds the page still.
  let paused = false

  /*
    Cache the element list instead of querying every frame. A MutationObserver
    refreshes it when the DOM changes — which happens when the project modal
    opens, when the mobile menu appears, when the language switch re-renders a
    section. Querying 60 times a second for a list that changes twice a minute
    is the kind of waste that is invisible until it is not.
  */
  function refresh() {
    elements = Array.from(document.querySelectorAll(rootSelector))
  }

  function release() {
    for (const el of elements) {
      offsets.set(el, { x: 0, y: 0 })
      el.style.transform = ''
    }
  }

  function frame(pointer) {
    /*
      A dialog over the page takes the pointer with it. The page behind is not
      what you are pointing at, and elements leaning back there read as the page
      wobbling under the backdrop. Everything goes home and the loop stands down
      until the dialog closes.
    */
    if (isScrollLocked()) {
      if (!paused) {
        paused = true
        release()
      }
      return
    }
    paused = false

    let winner = null
    let bestScore = 1 // nothing beyond score 1 is in range at all

    for (const el of elements) {
      const rect = el.getBoundingClientRect()
      // Skip anything scrolled out of view: no point pulling what nobody sees.
      // Both axes, because the project rail scrolls horizontally and a card
      // parked off to the side is still "in the viewport" vertically.
      if (rect.bottom < 0 || rect.top > window.innerHeight) continue
      if (rect.right < 0 || rect.left > window.innerWidth) continue

      /*
        The RESTING centre, not the current one.

        getBoundingClientRect() includes the transform we applied on the last
        frame, so measuring it directly creates a feedback loop: the element
        moves toward the pointer, which moves its centre, which changes the
        direction of the pull, which moves it again. Near the middle of a
        button that loop flips direction every frame and the element buzzes.
        Subtracting the offset we know we applied breaks the loop.
      */
      const offset = offsets.get(el) ?? { x: 0, y: 0 }
      const cx = rect.left + rect.width / 2 - offset.x
      const cy = rect.top + rect.height / 2 - offset.y
      const distance = Math.hypot(pointer.x - cx, pointer.y - cy)
      const reach = Math.max(rect.width, rect.height) * REACH_FACTOR + REACH_PADDING
      const score = distance / reach

      if (score < bestScore) {
        bestScore = score
        winner = { el, cx, cy, score, distance }
      }
    }

    for (const el of elements) {
      const current = offsets.get(el) ?? { x: 0, y: 0 }
      let targetX = 0
      let targetY = 0

      /*
        The dead zone is the second half of the anti-jitter fix. Right on the
        centre the direction vector is (0,0) and its normalised form is
        meaningless — a pixel of mouse movement swings it 180°. Inside 12px
        there is simply nothing to chase, which is also how it should feel:
        the element has arrived.
      */
      if (winner && winner.el === el && winner.distance > DEAD_ZONE) {
        const pull = (1 - winner.score) ** 2 * MAX_PULL
        const dx = pointer.x - winner.cx
        const dy = pointer.y - winner.cy
        const length = Math.hypot(dx, dy) || 1
        targetX = (dx / length) * pull
        targetY = (dy / length) * pull
      }

      current.x += (targetX - current.x) * EASING
      current.y += (targetY - current.y) * EASING
      offsets.set(el, current)

      // Below a third of a pixel the movement is invisible; clearing the
      // transform lets the element go back to whatever its own CSS says.
      if (Math.abs(current.x) < 0.3 && Math.abs(current.y) < 0.3) {
        el.style.transform = ''
      } else {
        el.style.transform = `translate3d(${current.x.toFixed(2)}px, ${current.y.toFixed(2)}px, 0)`
      }
    }
  }

  usePointer(frame)

  onMounted(() => {
    refresh()
    observer = new MutationObserver(refresh)
    observer.observe(document.body, { childList: true, subtree: true })
  })

  onUnmounted(() => {
    observer?.disconnect()
    // Leave nothing behind: an element frozen mid-pull would stay offset.
    for (const el of elements) el.style.transform = ''
  })
}
