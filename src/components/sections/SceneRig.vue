<script setup>
/*
  The rig around the mark: the camera and the depth behind it.

  A child of LogoScene's <TresCanvas> on purpose — `useLoop` and
  `useTresContext` need the renderer the canvas provides, and calling them in the
  component that renders the canvas throws.

  **The room is a box open at the front** — four walls converging on a far wall,
  the grid painted on every face — and it runs deep, so it reads as a recess that
  could go on. A fog fades the far end into the page's own background, so the box
  has no bottom to see.

  **The camera peeks.** It leans with the pointer and looks back at the mark, so
  the mark stays centred and the depth shifts around it. The lean is a lerp in the
  scene's own loop. The Stage's CSS frame covers the box's edges, so the lean
  never shows the page past them.

  The texture and the fog are read from the theme tokens and rebuilt when
  `data-theme` or `data-accent` changes.
*/
import { onMounted, onUnmounted, ref } from 'vue'
import { useLoop, useTresContext } from '@tresjs/core'
import {
  AdditiveBlending,
  BufferGeometry,
  CanvasTexture,
  DoubleSide,
  Float32BufferAttribute,
  Fog,
  MeshBasicMaterial,
  RepeatWrapping,
  SRGBColorSpace,
} from 'three'

const props = defineProps({
  // Pointer position over the stage, normalised to -1..1, from LogoStage.
  tilt: { type: Object, default: () => ({ x: 0, y: 0 }) },
  // Base distance, from the wheel zoom in LogoScene.
  camZ: { type: Number, required: true },
})

// The box's opening is cut to land exactly on the stage: at its distance the
// frustum's half-height is `d * tan(fov/2)`, so an opening that size projects to
// the stage's edges and nothing more. Divide it into the same seven cells the
// stage is (decision 79) and its grid lines fall on the page's at the frame.
const FOV = 40
const OPENING_Z = 25
const CELLS = 7
const ROOM_HALF = (props.camZ - OPENING_Z) * Math.tan((FOV / 2) * (Math.PI / 180))
const CELL = (ROOM_HALF * 2) / CELLS
const SPAN = CELL * CELLS
const ROOM_DEPTH = 700
const ROOM_CENTER_Z = OPENING_Z - ROOM_DEPTH / 2
// Just behind the mark the fog starts, and it has blacked the far wall well
// before the box ends, so the tunnel has no bottom to see.
const FOG_NEAR = 240
const FOG_FAR = 560
// A touch of lean, spent before the frame's edge: the opening is the stage now,
// so a big one would pull its edge out from under the frame.
const PEEK_X = 3
const PEEK_Y = 2
// A faint light behind the mark, to rim it against the dark.
const BACKLIGHT_Z = -60
const BACKLIGHT = 150

const room = ref(null)
const roomGeo = ref(null)
const backlight = ref(null)
const backlightColor = ref('#ffc800')
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

const { camera, scene } = useTresContext()
const { onBeforeRender } = useLoop()

let observer = null
let smoothX = 0
let smoothY = 0

function makeCanvas(size) {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  return canvas
}

function tokens() {
  const css = getComputedStyle(document.documentElement)
  const read = (name, fallback) => css.getPropertyValue(name).trim() || fallback
  return {
    surface: read('--surface', '#141416'),
    ink: read('--ink', '#0c0c0d'),
    grid: read('--line', 'rgba(255,255,255,.11)'),
  }
}

/*
  The walls, built by hand so the grid is world-uniform: a BoxGeometry maps each
  face to 0..1, which would stretch the grid on the deeper walls, so the UVs are
  taken straight from the world position here instead.
*/
function buildRoomGeometry() {
  const near = ROOM_HALF
  const far = ROOM_HALF
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
  so the grid reads as the walls' own texture rather than a faint wash.
*/
function buildRoom() {
  const { surface, grid } = tokens()
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

function buildFog() {
  const { ink } = tokens()
  if (!scene.value.fog) {
    scene.value.fog = new Fog(ink, FOG_NEAR, FOG_FAR)
  } else {
    scene.value.fog.color.set(ink)
  }
}

/*
  The backlight is a white radial mask; the tint comes from `--acc-solid`, so the
  halo behind the mark follows the accent. A mask has to be white.
*/
function buildBacklight() {
  const size = 256
  const canvas = makeCanvas(size)
  const ctx = canvas.getContext('2d')
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  gradient.addColorStop(0, 'rgba(255,255,255,0.22)')
  gradient.addColorStop(0.45, 'rgba(255,255,255,0.06)')
  gradient.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)

  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  backlight.value?.dispose()
  backlight.value = texture
}

function readAccent() {
  const css = getComputedStyle(document.documentElement)
  backlightColor.value = css.getPropertyValue('--acc-solid').trim() || '#ffc800'
}

function repaint() {
  buildRoom()
  buildFog()
  readAccent()
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
  backlight.value?.dispose()
})

buildRoomGeometry()
buildBacklight()
repaint()

onBeforeRender(({ delta }) => {
  // `camera` here is TresJS's camera manager, not the camera itself; the active
  // one lives on `activeCamera`.
  const cam = camera.activeCamera.value
  if (!cam) return

  // Reduced motion gets the depth but no lean.
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
  <!-- The room: a deep box open toward the camera, its walls converging. -->
  <TresMesh v-if="roomGeo" :geometry="roomGeo" :position="[0, 0, ROOM_CENTER_Z]">
    <TresMeshBasicMaterial :map="room" :side="DoubleSide" :tone-mapped="false" />
  </TresMesh>

  <!-- The backlight, just behind the mark: a soft accent halo to rim it. -->
  <TresMesh v-if="backlight" :position="[0, 0, BACKLIGHT_Z]">
    <TresPlaneGeometry :args="[BACKLIGHT, BACKLIGHT]" />
    <TresMeshBasicMaterial
      :map="backlight"
      :color="backlightColor"
      :transparent="true"
      :blending="AdditiveBlending"
      :depth-write="false"
      :tone-mapped="false"
      :fog="false"
    />
  </TresMesh>
</template>
