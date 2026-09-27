import { onMounted, onUnmounted } from 'vue'

/*
  ONE mouse listener and ONE requestAnimationFrame for everything that follows
  the cursor: the custom cursor, the magnetic hover, the logo's tilt and the
  lemon's pupils.

  Why a subscription list instead of each component running its own loop: four
  loops means four callbacks per frame competing to read layout and write
  styles, and four chances to leave one running after unmount. Here there is
  one loop, it starts when the first subscriber arrives and stops when the last
  one leaves.

  The position is a PLAIN OBJECT, not a ref. That is deliberate. A reactive
  ref would re-render every component that reads it sixty times a second, for
  values that never belong in the template — subscribers write to the DOM
  directly through their own element refs instead. Reactivity is for state the
  user sees; this is animation.

  Nothing mounts on touch devices or below 900px: there is no cursor to follow,
  and the design switches all of this off there anyway.
*/

const pointer = { x: -200, y: -200, active: false } // offscreen until the mouse first moves
const subscribers = new Set()

// How long the pointer can sit still before the cursor and the grid cell go.
// Not immediate — a cursor that vanishes the instant you stop reading is
// confusing — and not tied to entering or leaving the window, which never fired
// reliably and left the cursor parked wherever it had last been inside.
const IDLE_MS = 2000

let frame = null
let listening = false
let idleTimer = null

export function isPointerDevice() {
  return window.matchMedia('(hover: hover)').matches && window.innerWidth > 900
}

function restartIdle() {
  if (idleTimer) clearTimeout(idleTimer)
  idleTimer = setTimeout(() => {
    pointer.active = false
    publish()
  }, IDLE_MS)
}

function onMove(event) {
  pointer.x = event.clientX
  pointer.y = event.clientY

  if (!pointer.active) {
    pointer.active = true
    publish()
  }

  restartIdle()
}

/*
  Scrolling is activity too, and it wakes the pointer as well as keeping it
  awake. Without the first part the cursor stayed gone while the page moved under
  it, because only a `mousemove` brought it back and a wheel fires none; without
  the second it went while the page was still moving.
*/
function onScroll() {
  if (!pointer.active) {
    pointer.active = true
    publish()
  }
  restartIdle()
}

function publish() {
  for (const run of subscribers) run(pointer)
}

function loop() {
  publish()
  frame = requestAnimationFrame(loop)
}

function start() {
  if (!listening) {
    window.addEventListener('mousemove', onMove, { passive: true })
    window.addEventListener('scroll', onScroll, { passive: true })
    listening = true
  }
  if (frame === null) frame = requestAnimationFrame(loop)
}

function stop() {
  window.removeEventListener('mousemove', onMove)
  window.removeEventListener('scroll', onScroll)
  if (idleTimer) clearTimeout(idleTimer)
  idleTimer = null
  listening = false
  if (frame !== null) cancelAnimationFrame(frame)
  frame = null
}

/**
 * Runs `callback(pointer)` once per frame while the component is mounted.
 * Returns whether it actually subscribed, so a component can skip setting up
 * DOM it will never animate.
 */
export function usePointer(callback) {
  let active = false

  onMounted(() => {
    if (!isPointerDevice()) return
    active = true
    subscribers.add(callback)
    start()
  })

  onUnmounted(() => {
    if (!active) return
    subscribers.delete(callback)
    // The last one out turns off the lights. Without this the loop would keep
    // running forever over an empty set.
    if (subscribers.size === 0) stop()
  })

  return { pointer }
}
