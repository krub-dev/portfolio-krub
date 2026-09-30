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

  `active` is only "the pointer has been seen at least once", so the cursor is
  not painted at 0,0 before the first move. It is not a liveness flag any more:
  the cursor used to fade out after two seconds of stillness and it never read as
  deliberate enough to keep.

  Nothing mounts on touch devices or below 900px: there is no cursor to follow,
  and the design switches all of this off there anyway.
*/

const pointer = { x: -200, y: -200, active: false } // offscreen until the mouse first moves
const subscribers = new Set()

let frame = null
let listening = false

function onMove(event) {
  pointer.x = event.clientX
  pointer.y = event.clientY

  if (!pointer.active) {
    pointer.active = true
    publish()
  }
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
    listening = true
  }
  if (frame === null) frame = requestAnimationFrame(loop)
}

function stop() {
  window.removeEventListener('mousemove', onMove)
  listening = false
  if (frame !== null) cancelAnimationFrame(frame)
  frame = null
}

export function isPointerDevice() {
  return window.matchMedia('(hover: hover)').matches && window.innerWidth > 900
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
