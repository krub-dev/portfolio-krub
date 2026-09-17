<script setup>
/*
  One of the four Stack groups: a mono label with a rule under it, then the
  icons wrapping below.

  The group is monochrome at rest and the pointer lights what it passes near:
  the colour copy fades in, the tile lifts a few pixels, and a mono readout
  names the tile closest to the cursor. It hangs off usePointer — the site's
  single loop, shared with the cursor, the magnetic hover and the parallax — so
  it costs no second requestAnimationFrame, and it does nothing at all on touch
  or under reduced motion, where the group simply stays grey.

  Why a readout and not a name inside the tile: "IntelliJ IDEA" does not fit in
  44px at any legible size, and a caption under every tile would either push the
  grid apart or overlap the row below.
*/
import { onMounted, onUnmounted, ref } from 'vue'

import TechIcon from './TechIcon.vue'
import { usePointer } from '../../composables/usePointer'

defineProps({
  label: { type: String, required: true }, // already translated
  items: { type: Array, default: () => [] }, // [{ name, icon, invertOnDark }]
})

// How far the light carries, and how close a tile must be to be named.
const REACH = 130
const NAME_REACH = 64
// The tile's reaction at full light: how far it lifts and how much it grows.
const LIFT = 3
const GROW = 0.06
// Fraction of the remaining distance covered per frame. Lower is heavier.
const EASING = 0.16
// How far the readout sits from the cursor, clear of the dot.
const NAME_OFFSET = 16

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

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')

/*
  Positions relative to the group, never to the page. The group moves down when
  anything above it grows — a project added, the testimonials switched on — and
  page coordinates cached at mount would quietly light the wrong tile. One rect
  per frame for the group, then arithmetic on the cached offsets.
*/
function measure() {
  const box = root.value
  const grid = icons.value
  if (!box || !grid) return

  const origin = box.getBoundingClientRect()
  tiles = Array.from(grid.querySelectorAll('.tile')).map((el) => {
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

function frame(pointer) {
  const box = root.value
  if (reduced.matches || !box || !tiles.length) return

  const origin = box.getBoundingClientRect()
  let nearest = null
  let nearestDistance = Infinity

  for (let i = 0; i < tiles.length; i += 1) {
    const tile = tiles[i]
    const distance = Math.hypot(
      pointer.x - (origin.left + tile.x),
      pointer.y - (origin.top + tile.y),
    )
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

  const label = readout.value
  if (!label) return

  const close = nearestDistance < NAME_REACH

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

usePointer(frame)

onMounted(() => {
  // A frame first, so the grid has been laid out and the fonts have settled.
  requestAnimationFrame(measure)
  // And again whenever the group changes size: a rewrap, a language switch.
  observer = new ResizeObserver(measure)
  if (root.value) observer.observe(root.value)
  window.addEventListener('resize', measure, { passive: true })
})

onUnmounted(() => {
  observer?.disconnect()
  window.removeEventListener('resize', measure)
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
    <div ref="icons" class="icons">
      <TechIcon
        v-for="item in items"
        :key="item.name"
        :name="item.name"
        :src="item.icon"
        :invert-on-dark="item.invertOnDark"
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
  gap: 14px;
}

.label {
  margin: 0;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--line);
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--fg-3);
}

.icons {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
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
</style>
