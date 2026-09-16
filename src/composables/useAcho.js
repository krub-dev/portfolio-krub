import { achoSound } from '../data'

/*
  The easter egg: Limonacho greets you, once per visit.

  Two things happen on that first poke and neither happens again — he says
  "acho" and he shows his bubble. Later pokes are just the shake.

  The flag is at module scope, not inside the component. Limonacho unmounts when
  the route changes — he only lives on the home page — so a flag in the
  component would be born again every time you came back to it. Per visit means
  per page load, which is what module scope gives.

  Nothing goes in localStorage on purpose: this is not a preference, and it is
  not worth remembering for a week. Close the tab and the joke is new again.
*/
let greeted = false
let clip = null

export function useAcho() {
  /*
    Called from the lemon's own click handler, synchronously. iOS only lets a
    page play audio that a real gesture asked for, so this has to stay inside
    the handler — moved into a timer or a rAF callback, it gets blocked.

    Returns true on the first poke of the visit, false on every later one. The
    caller needs that answer: the bubble belongs to the same greeting, so it
    cannot decide on its own whether this is the first time.
  */
  function playOnce() {
    // The flag flips on the click, not on the playback succeeding: a browser
    // that blocks it would otherwise try again, and fail again, on every click.
    if (greeted) return false
    greeted = true

    /*
      The clip is built and fetched on the first click, not up front: 17 KB is
      nothing, but it is still audio most visits never ask for. The shake gives
      it half a second of cover while it arrives.
    */
    clip ??= new Audio(achoSound)
    // An empty catch on purpose: a blocked play() or a missing file leaves
    // nothing to recover — the shake and the page are unaffected.
    clip.play().catch(() => {})

    return true
  }

  return { playOnce }
}
