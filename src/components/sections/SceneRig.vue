<script setup>
/*
  The rig around the mark: the camera, the fog and the room.

  A child of LogoScene's <TresCanvas> on purpose — `useLoop` and
  `useTresContext` need the renderer the canvas provides, and calling them in the
  component that renders the canvas throws.

  **The room is a box open at the front.** Its four walls run away from the frame
  and close on a far wall that is only a fraction of it, so the grid on them
  converges and the box reads as a recess with real perspective. The camera sits
  just outside the near face, which is left out of the geometry, so it looks
  straight in. Ten triangles, one unlit material and one grid texture, sized so a
  whole number of cells lands on every edge — the grid itself draws the box's
  edges, so it needs no separate outline.

  **The camera peeks.** It follows the pointer with a lerp and always looks back
  at the mark, so the mark stays centred while the room shifts around it: the
  parallax comes from the perspective, not from moving the object. The outer
  frame is CSS and never moves.

  The texture is read from the theme tokens and rebuilt when `data-theme` or
  `data-accent` changes.
*/
import { onMounted, onUnmounted, ref } from 'vue'
import { useLoop, useTresContext } from '@tresjs/core'
import {
  BufferGeometry,
  CanvasTexture,
  DoubleSide,
  Float32BufferAttribute,
  RepeatWrapping,
  SRGBColorSpace,
} from 'three'

const props = defineProps({
  // Pointer position over the stage, normalised to -1..1, from LogoStage.
  tilt: { type: Object, default: () => ({ x: 0, y: 0 }) },
  // Base distance, from the wheel zoom in LogoScene.
  camZ: { type: Number, required: true },
})

// The room. The opening sits in front of the camera and stays wider than the
// view at the closest zoom with the full lean, so the page never shows past its
// edges; the four walls run back to a far wall kept close to the frame — a deep
// box reads as a corridor, and this one is meant to be a shallow recess.
const ROOM_HALF = 80
const ROOM_TAPER = 1
const ROOM_DEPTH = 160
const ROOM_CENTER_Z = 5
// World units per grid cell. ROOM_HALF * 2 is a whole number of cells (eight),
// so the grid lines land on the box's edges and meet cleanly between faces.
const CELL = 20
const CELLS = 8
const SPAN = CELL * CELLS
// How far the camera leans, in world units.
const PEEK_X = 16
const PEEK_Y = 11

const room = ref(null)
const roomGeo = ref(null)
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

const { camera } = useTresContext()
const { onBeforeRender } = useLoop()

let observer = null
let smoothX = 0
let smoothY = 0

function makeCanvas(size) {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  return canvas
}

/*
  The walls, built by hand so the grid is world-uniform: a BoxGeometry maps each
  face to 0..1, which stretches the grid on the deeper walls, so the UVs are
  taken straight from the world position here instead.
*/
function buildRoomGeometry() {
  const near = ROOM_HALF
  const far = ROOM_HALF * ROOM_TAPER
  const zn = ROOM_DEPTH / 2
  const zf = -ROOM_DEPTH / 2

  const NBL = [-near, -near, zn]
  const NBR = [near, -near, zn]
  const NTR = [near, near, zn]
  const NTL = [-near, near, zn]
  const FBL = [-far, -far, zf]
  const FBR = [far, -far, zf]
  const FTR = [far, far, zf]
  const FTL = [-far, far, zf]

  const positions = []
  const uvs = []
  const indices = []

  const addQuad = (corners, project) => {
    const base = positions.length / 3
    for (const corner of corners) {
      positions.push(corner[0], corner[1], corner[2])
      uvs.push(project(corner)[0], project(corner)[1])
    }
    indices.push(base, base + 1, base + 2, base, base + 2, base + 3)
  }

  const xz = (c) => [c[0] / SPAN, c[2] / SPAN]
  const zy = (c) => [c[2] / SPAN, c[1] / SPAN]
  const xy = (c) => [c[0] / SPAN, c[1] / SPAN]

  addQuad([NBL, NBR, FBR, FBL], xz) // floor
  addQuad([NBR, NTR, FTR, FBR], zy) // right wall
  addQuad([NTR, NTL, FTL, FTR], xz) // ceiling
  addQuad([NTL, NBL, FBL, FTL], zy) // left wall
  addQuad([FBL, FBR, FTR, FTL], xy) // far wall

  const geo = new BufferGeometry()
  geo.setAttribute('position', new Float32BufferAttribute(positions, 3))
  geo.setAttribute('uv', new Float32BufferAttribute(uvs, 2))
  geo.setIndex(indices)
  geo.computeBoundingSphere()
  roomGeo.value?.dispose()
  roomGeo.value = geo
}

/*
  The room's grid, painted from the theme's tokens. The face texture is `--line`,
  so the grid reads as the walls' own texture rather than a faint wash the page
  shows through.
*/
function buildRoom() {
  const css = getComputedStyle(document.documentElement)
  const surface = css.getPropertyValue('--surface').trim() || '#141416'
  const grid = css.getPropertyValue('--line').trim() || 'rgba(255,255,255,.11)'

  const size = 512
  const canvas = makeCanvas(size)
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = surface
  ctx.fillRect(0, 0, size, size)

  const step = size / CELLS
  ctx.strokeStyle = grid
  ctx.lineWidth = 1
  ctx.beginPath()
  for (let i = 0; i < CELLS; i++) {
    const p = Math.round(i * step) + 0.5
    ctx.moveTo(p, 0)
    ctx.lineTo(p, size)
    ctx.moveTo(0, p)
    ctx.lineTo(size, p)
  }
  ctx.stroke()

  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  texture.anisotropy = 4
  texture.wrapS = RepeatWrapping
  texture.wrapT = RepeatWrapping
  room.value?.dispose()
  room.value = texture
}

function repaint() {
  buildRoom()
}

onMounted(() => {
  observer = new MutationObserver(repaint)
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme', 'data-accent'],
  })
})

onUnmounted(() => {
  observer?.disconnect()
  room.value?.dispose()
  roomGeo.value?.dispose()
})

buildRoomGeometry()
repaint()

onBeforeRender(({ delta }) => {
  // `camera` here is TresJS's camera manager, not the camera itself; the active
  // one lives on `activeCamera`.
  const cam = camera.activeCamera.value
  if (!cam) return

  // Reduced motion gets the room but no lean.
  const tilt = reduced ? { x: 0, y: 0 } : props.tilt
  const ease = Math.min(1, delta * 3)
  smoothX += (tilt.x * PEEK_X - smoothX) * ease
  smoothY += (tilt.y * PEEK_Y - smoothY) * ease

  // Always looking back at the mark, so it stays centred while the room moves.
  cam.position.set(smoothX, -smoothY, props.camZ)
  cam.lookAt(0, 0, 0)
})
</script>

<template>
  <!-- The room: a box open toward the camera, its walls closing on the far wall. -->
  <TresMesh v-if="roomGeo" :geometry="roomGeo" :position="[0, 0, ROOM_CENTER_Z]">
    <TresMeshBasicMaterial :map="room" :side="DoubleSide" :tone-mapped="false" />
  </TresMesh>
</template>
