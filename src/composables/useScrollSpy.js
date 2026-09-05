import { computed, ref, watch } from 'vue'

import { useScroll } from './useScroll'

/*
  Which section am I looking at?

  Both helpers here ride on the shared scroll listener in useScroll — no extra
  listeners, no IntersectionObserver. An observer would be the textbook answer,
  but it reports "this element is 40% visible", and the design asks a different
  question: "has this section's top edge crossed a line on the screen". Those
  disagree exactly where it matters — a section taller than the viewport is
  never fully visible, and two short ones are visible at once.
*/

/**
 * The active section id: the LAST one whose top edge has crossed `threshold`
 * of the viewport height. Walking in document order and keeping the last match
 * is what makes it settle on the section you have scrolled INTO, rather than
 * the one still coming up.
 *
 * @param {string[]} ids   section ids, in document order
 * @param {number} threshold  fraction of the viewport height, 0.35 by default
 */
export function useScrollSpy(ids, threshold = 0.35) {
  const { y } = useScroll()
  const activeId = ref(ids[0] ?? '')

  watch(
    y,
    () => {
      const line = window.innerHeight * threshold
      let current = ids[0] ?? ''

      for (const id of ids) {
        const el = document.getElementById(id)
        if (!el) continue
        if (el.getBoundingClientRect().top <= line) current = id
      }

      activeId.value = current
    },
    { immediate: true },
  )

  return { activeId }
}

/**
 * True once `selector`'s top edge has risen above `ratio` of the viewport.
 * Drives the background grid crossfade, which happens at 60% — a different
 * line from the scroll spy's 35%, and deliberately so: the grids swap while
 * "about" is still arriving, before its link lights up.
 */
export function useSectionReached(selector, ratio = 0.6) {
  const { y } = useScroll()
  const reached = ref(false)

  watch(
    y,
    () => {
      const el = document.querySelector(selector)
      if (!el) return
      reached.value = el.getBoundingClientRect().top <= window.innerHeight * ratio
    },
    { immediate: true },
  )

  return computed(() => reached.value)
}
