<script setup>
/*
  One of the four Stack groups: a mono label with a rule under it, then the
  icons wrapping below.

  The group is monochrome at rest and the light comes from wherever there is
  one to come from:

  - On a pointer device it follows the cursor. Every tile within reach fades its
    colour copy in and lifts a few pixels.
  - On touch there is no cursor, so the scroll is the light: a group comes on
    whole as it climbs into view, rather than tile by tile.

  Naming the tile is Limonacho's job. He sits in the corner with a bubble, and
  the Stack only has to hand him a string. If he is not on the page — showLemon
  off, no hero, no lemon — the name falls back to a mono readout that follows
  the cursor, and the tiles mark themselves as clickable so the custom cursor
  says so too.

  Either way it hangs off the site's shared machinery — usePointer and useScroll
  each own ONE listener for the whole app — so this costs no extra
  requestAnimationFrame and no extra scroll listener. Under reduced motion it
  does nothing at all and the grid stays grey.
*/
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

import TechIcon from './TechIcon.vue'
import { isPointerDevice, usePointer } from '../../composables/usePointer'
import { useLemonVoice } from '../../composables/useLemonVoice'
import { useScroll } from '../../composables/useScroll'

defineProps({
  label: { type: String, required: true }, // already translated
  items: { type: Array, default: () => [] }, // [{ name, icon, invertOnDark, wide }]
})

// How far the light carries, and how close a tile must be to be named.
const REACH = 150
const NAME_REACH = 80
// The tile's reaction at full light: how far it lifts and how much it grows.
const LIFT = 3
const GROW = 0.06
// Fraction of the remaining distance covered per frame. Lower is heavier.
const EASING = 0.16
// How far the readout sits from the cursor, clear of the dot.
const NAME_OFFSET = 16
// How long a tapped name stays up.
const PIN = 1800
// The touch reveal: a group starts lighting when its top edge reaches the bottom
// of the viewport, and is fully lit once it has climbed to REVEAL_TO of it.
//
// Near the top it was lighting the whole section on arrival: the section is
// about a viewport tall on a phone, so with the threshold up there every group
// was already past it by the time you got to it. From the bottom edge the groups
// come on one after another as you scroll, which is what it was for.
const REVEAL_FROM = 1
const REVEAL_TO = 0.7

const pointerDevice = isPointerDevice()

const { listening, say, hush } = useLemonVoice()
// The lemon registers itself on mount. While it is there it does the talking.
const voice = computed(() => listening.value > 0)

const root = ref(null)
const icons = ref(null)
const readout = ref(null)

let tiles = []
let lit = []
let observer = null
let named = null
let nameX = 0
let nameY = 0
let nameLit = 0
let namePlaced = false
let pin = null
let revealed = -1

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')

/*
  Positions relative to the group, never to the page. The group moves down when
  anything above it grows — a project added, the testimonials switched on — and
  page coordinates cached at mount would quietly light the wrong tile. One rect
  per call for the group, then arithmetic on the cached offsets.
*/
function measure() {
  const box = root.value
  const grid = icons.value
  if (!box || !grid) return

  const origin = box.getBoundingClientRect()
  tiles = Array.from(grid.querySelectorAll('[data-tile]')).map((el) => {
    const rect = el.getBoundingClientRect()
    return {
      el,
      colour: el.querySelector('.colour'),
      name: el.dataset.name,
      x: rect.left - origin.left + rect.width / 2,
      y: rect.top - origin.top + rect.height / 2,
    }
  })
  lit = tiles.map(() => 0)
}

/*
  Lights every tile near (x, y), which are viewport coordinates. Returns the
  nearest one, so the caller can name it.
*/
function paint(x, y) {
  const box = root.value
  let nearest = null
  let nearestDistance = Infinity

  if (!box || !tiles.length) return { nearest, distance: nearestDistance }

  const origin = box.getBoundingClientRect()

  for (let i = 0; i < tiles.length; i += 1) {
    const tile = tiles[i]
    const distance = Math.hypot(x - (origin.left + tile.x), y - (origin.top + tile.y))
    // Falls off with distance, and squared so the centre is clearly the centre.
    const target = distance < REACH ? (1 - distance / REACH) ** 1.6 : 0
    const value = lit[i] + (target - lit[i]) * EASING
    lit[i] = value

    if (value > 0.01) {
      tile.colour.style.opacity = value.toFixed(3)
      tile.el.style.transform =
        `translateY(${(-value * LIFT).toFixed(2)}px) scale(${(1 + value * GROW).toFixed(3)})`
    } else if (tile.el.style.transform) {
      // Clearing the transform hands the tile back to its own CSS.
      tile.colour.style.opacity = '0'
      tile.el.style.transform = ''
    }

    if (distance < nearestDistance) {
      nearestDistance = distance
      nearest = tile
    }
  }

  return { nearest, distance: nearestDistance }
}

// The pointer path: the light is the cursor, and the name goes to Limonacho.
function frame(pointer) {
  if (reduced.matches) return

  const { nearest, distance } = paint(pointer.x, pointer.y)
  if (!nearest) return

  const close = distance < NAME_REACH

  /*
    With the lemon on the page he names the tile and the readout stays asleep.
    Calling say() with the name it already has is a no-op, so this can run every
    frame without re-rendering anything.
  */
  if (voice.value) {
    if (close) say(nearest.name)
    else hush()
    return
  }

  const label = readout.value
  if (!label) return

  /*
    Snap on the first frame of an appearance and trail after that. A readout
    that eased in from wherever it was last time would read as a stray element
    crossing the grid.
  */
  if (close && !namePlaced) {
    nameX = pointer.x
    nameY = pointer.y
    namePlaced = true
  }

  nameLit = Math.min(1, Math.max(0, nameLit + (close ? EASING : -EASING)))
  if (nameLit === 0) namePlaced = false

  if (close && named !== nearest.name) {
    named = nearest.name
    label.textContent = nearest.name
  }

  if (nameLit > 0.01) {
    nameX += (pointer.x - nameX) * EASING
    nameY += (pointer.y - nameY) * EASING
    label.style.transform =
      `translate3d(${(nameX + NAME_OFFSET).toFixed(1)}px, ${(nameY + NAME_OFFSET).toFixed(1)}px, 0)`
  }
  label.style.opacity = nameLit.toFixed(3)
}

/*
  The touch path: no cursor, so the light is the scroll and it comes on a WHOLE
  group at a time. The tiles of a group are read together — lighting them one by
  one as each passed a line was noise — and they do not lift either, because a
  block of tiles rising as one reads as the page jumping. The scroll only calls
  this when it moves, so there is nothing to ease: a half-finished ease would
  freeze on screen the moment the scrolling stopped.
*/
function reveal() {
  const box = root.value
  if (reduced.matches || !box || !tiles.length) return

  const rect = box.getBoundingClientRect()
  const from = window.innerHeight * REVEAL_FROM
  const span = window.innerHeight * (REVEAL_FROM - REVEAL_TO)
  const value = Math.min(1, Math.max(0, (from - rect.top) / span))
  // Rounded, so a scroll that does not change the value writes nothing.
  const step = Math.round(value * 200) / 200

  if (step === revealed) return
  revealed = step

  for (const tile of tiles) {
    tile.colour.style.opacity = step.toFixed(3)
    if (tile.el.style.transform) tile.el.style.transform = ''
  }
}

/*
  A tap names the tile under it. With the lemon there it is his bubble, up for a
  moment; without him it is the readout, placed where the tile is. Only on
  touch — on a pointer device the cursor has already done the naming.
*/
function onTap(event) {
  if (pointerDevice || reduced.matches) return

  const el = event.target.closest('[data-tile]')
  const tile = el && tiles.find((candidate) => candidate.el === el)
  if (!tile) return

  if (voice.value) {
    say(tile.name)
    clearTimeout(pin)
    pin = setTimeout(hush, PIN)
    return
  }

  const label = readout.value
  if (!label) return

  const rect = el.getBoundingClientRect()
  label.textContent = tile.name
  named = tile.name
  // Measured before placing, so a long name near the right edge is pulled back
  // inside the screen instead of running off it.
  const x = Math.min(rect.left, window.innerWidth - label.offsetWidth - 12)
  const y = Math.min(rect.bottom + 8, window.innerHeight - 28)

  label.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`
  label.style.opacity = '1'

  clearTimeout(pin)
  pin = setTimeout(() => {
    label.style.opacity = '0'
    named = null
    nameLit = 0
    namePlaced = false
  }, PIN)
}

usePointer(frame)

const { y } = useScroll()
if (!pointerDevice) watch(y, reveal)

onMounted(() => {
  // A frame first, so the grid has been laid out and the fonts have settled.
  requestAnimationFrame(() => {
    measure()
    if (!pointerDevice) reveal()
  })
  // And again whenever the group changes size: a rewrap, a language switch.
  observer = new ResizeObserver(measure)
  if (root.value) observer.observe(root.value)
  window.addEventListener('resize', measure, { passive: true })
})

onUnmounted(() => {
  observer?.disconnect()
  window.removeEventListener('resize', measure)
  clearTimeout(pin)
  hush()
  // Leave nothing behind: a tile frozen mid-lift would stay offset.
  for (const tile of tiles) {
    tile.colour.style.opacity = ''
    tile.el.style.transform = ''
  }
})
</script>

<template>
  <div ref="root" class="group">
    <p class="label">{{ label }}</p>
    <div ref="icons" class="icons" @click="onTap">
      <TechIcon
        v-for="item in items"
        :key="item.name"
        :name="item.name"
        :src="item.icon"
        :invert-on-dark="item.invertOnDark"
        :wide="item.wide"
        :interactive="!voice"
      />
    </div>

    <!-- Names the tile the pointer is on. Decorative: the alt already says it. -->
    <span ref="readout" class="readout" aria-hidden="true" />
  </div>
</template>

<style scoped>
.group {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.label {
  margin: 0;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--line);
  font-family: var(--font-mono);
  font-size: 13px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--fg-3);
}

.icons {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

/* Fixed, so it follows the cursor in viewport coordinates with no scroll maths.
   Out of the flow, so it never moves the grid it is describing. */
.readout {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 5;
  pointer-events: none;
  opacity: 0;
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--acc-text);
  white-space: nowrap;
}

@media (max-width: 900px) {
  .icons {
    gap: 10px;
  }
}
</style>
