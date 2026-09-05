import { onMounted, onUnmounted } from 'vue'

import { usePointer } from './usePointer'

/*
  Magnetic hover: elements marked [data-magnetic] drift a few pixels toward the
  cursor as it approaches.

  Only ONE element moves at a time — the nearest one within range. Letting
  every nearby element lean at once reads as the page wobbling; picking a
  single winner reads as attraction.

  The numbers are from the design spec §3.14 and are not arbitrary:
    reach  = max(width, height) * 0.75 + 70   how far this element's pull carries
    score  = distance / reach                 0 at the centre, 1 at the edge of range
    pull   = (1 - score)^2 * 16               squared, so it ramps up near the centre

  Every element eases toward its target by 14% per frame rather than jumping to
  it. That is what stops the element snapping when the cursor crosses into
  range, and what lets it glide back to zero when the cursor leaves — including
  the element that just lost, which is why the loop touches all of them and not
  just the winner.
*/

const REACH_PADDING = 70
const REACH_FACTOR = 0.75
const MAX_PULL = 16
const EASING = 0.14

export function useMagnetic(rootSelector = '[data-magnetic]') {
  let elements = []
  let observer = null
  // Current offset per element, keyed by the element itself.
  const offsets = new WeakMap()

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

  function frame(pointer) {
    let winner = null
    let bestScore = 1 // nothing beyond score 1 is in range at all

    for (const el of elements) {
      const rect = el.getBoundingClientRect()
      // Skip anything scrolled out of view: no point pulling what nobody sees.
      if (rect.bottom < 0 || rect.top > window.innerHeight) continue

      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const distance = Math.hypot(pointer.x - cx, pointer.y - cy)
      const reach = Math.max(rect.width, rect.height) * REACH_FACTOR + REACH_PADDING
      const score = distance / reach

      if (score < bestScore) {
        bestScore = score
        winner = { el, cx, cy, score }
      }
    }

    for (const el of elements) {
      const current = offsets.get(el) ?? { x: 0, y: 0 }
      let targetX = 0
      let targetY = 0

      if (winner && winner.el === el) {
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
