<script setup>
/*
  The rig around the mark: the camera, the depth behind it.

  A child of LogoScene's <TresCanvas> on purpose — `useLoop` and
  `useTresContext` need the renderer the canvas provides, and calling them in the
  component that renders the canvas throws.

  **The room is a box open at the front** — four walls converging on a far wall,
  the grid painted on every face — and it runs deep, so it reads as a recess that
  could go on. A fog fades the far end into the page's own background, so the box
  has no bottom to see. Three ways to dress it, switched by `mode` while the two
  are compared (the selector is temporary):

  - `grid`  — the deep grid tunnel and its fog.
  - `rings` — square frames receding into the dark, one `InstancedMesh`.
  - `both`  — the grid tunnel with the frames inside it.

  **The camera peeks.** It leans with the pointer and looks back at the mark, so
  the mark stays centred and the depth shifts around it. The lean is a lerp in the
  scene's own loop. The Stage's CSS frame covers the box's edges, so the lean
  never shows the page past them.

  The textures, the fog and the ring colours are read from the theme tokens and
  rebuilt when `data-theme` or `data-accent` changes.
*/
import { onMounted, onUnmounted, ref, shallowRef } from 'vue'
import { useLoop, useTresContext } from '@tresjs/core'
import {
  BufferGeometry,
  CanvasTexture,
  Color,
  DoubleSide,
  Float32BufferAttribute,
  Fog,
  InstancedMesh,
  Matrix4,
  MeshBasicMaterial,
  Path,
  RepeatWrapping,
  Shape,
  ShapeGeometry,
  SRGBColorSpace,
} from 'three'

const props = defineProps({
  // Pointer position over the stage, normalised to -1..1, from LogoStage.
  tilt: { type: Object, default: () => ({ x: 0, y: 0 }) },
  // Base distance, from the wheel zoom in LogoScene.
  camZ: { type: Number, required: true },
  // 'grid' | 'rings' | 'both'.
  mode: { type: String, default: 'grid' },
})

// The room. The opening sits in front of the camera and stays wider than the
// view at the closest zoom with the full lean, so the page never shows past its
// edges; the walls run far back, which is what reads as depth.
const ROOM_HALF = 80
const ROOM_DEPTH = 700
const OPENING_Z = 85
const ROOM_CENTER_Z = OPENING_Z - ROOM_DEPTH / 2
// The fog has swallowed the tunnel well before its far wall.
const FOG_NEAR = 300
const FOG_FAR = 900
// World units per grid cell. ROOM_HALF * 2 is a whole number of cells (eight),
// so the grid lines land on the box's edges and meet cleanly between faces.
const CELL = 20
const CELLS = 8
const SPAN = CELL * CELLS
// The rings: square frames of the tunnel's own size, receding and fading.
const RING_COUNT = 12
const RING_STEP = 55
// How far the camera leans, in world units.
const PEEK_X = 10
const PEEK_Y = 7

const room = ref(null)
const roomGeo = ref(null)
// shallowRef: an InstancedMesh must not be wrapped in Vue's reactive proxy, or
// the renderer trips over its read-only matrices.
const rings = shallowRef(null)
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
    accent: read('--acc-solid', '#ffc800'),
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

/*
  The rings. One square frame — a shape with a square hole — instanced down the
  tunnel: the same size each time, only further back, so perspective does the
  shrinking, and tinted from the accent toward the background so the far ones
  vanish. One draw call; the whole thing is a few hundred triangles.
*/
function buildRings() {
  const { accent, ink } = tokens()

  const outer = 1
  const inner = 0.975
  const shape = new Shape()
  shape.moveTo(-outer, -outer)
  shape.lineTo(outer, -outer)
  shape.lineTo(outer, outer)
  shape.lineTo(-outer, outer)
  shape.closePath()
  const hole = new Path()
  hole.moveTo(-inner, -inner)
  hole.lineTo(-inner, inner)
  hole.lineTo(inner, inner)
  hole.lineTo(inner, -inner)
  hole.closePath()
  shape.holes.push(hole)

  const geometry = new ShapeGeometry(shape)
  const material = new MeshBasicMaterial({
    color: 0xffffff,
    side: DoubleSide,
    toneMapped: false,
    fog: false,
  })
  const mesh = new InstancedMesh(geometry, material, RING_COUNT)
  mesh.frustumCulled = false

  const matrix = new Matrix4()
  const colour = new Color()
  const inkColour = new Color(ink)
  const accentColour = new Color(accent)
  for (let i = 0; i < RING_COUNT; i++) {
    matrix.makeScale(ROOM_HALF, ROOM_HALF, 1)
    matrix.setPosition(0, 0, OPENING_Z - i * RING_STEP)
    mesh.setMatrixAt(i, matrix)
    // Faint, and fainter with depth: a hint of the accent at the front, gone by
    // the back, so the tunnel has no end to see.
    const fade = 1 - i / (RING_COUNT - 1)
    colour.copy(inkColour).lerp(accentColour, fade * 0.45)
    mesh.setColorAt(i, colour)
  }
  mesh.instanceMatrix.needsUpdate = true
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true

  disposeRings()
  rings.value = mesh
}

function disposeRings() {
  if (!rings.value) return
  rings.value.geometry.dispose()
  rings.value.material.dispose()
  rings.value.dispose()
  rings.value = null
}

function buildFog() {
  const { ink } = tokens()
  if (!scene.value.fog) {
    scene.value.fog = new Fog(ink, FOG_NEAR, FOG_FAR)
  } else {
    scene.value.fog.color.set(ink)
  }
}

function repaint() {
  buildRoom()
  buildRings()
  buildFog()
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
  disposeRings()
})

buildRoomGeometry()
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
  <!-- The grid tunnel. -->
  <TresMesh
    v-if="roomGeo && (mode === 'grid' || mode === 'both')"
    :geometry="roomGeo"
    :position="[0, 0, ROOM_CENTER_Z]"
  >
    <TresMeshBasicMaterial :map="room" :side="DoubleSide" :tone-mapped="false" />
  </TresMesh>

  <!-- The receding frames. -->
  <primitive v-if="rings && (mode === 'rings' || mode === 'both')" :object="rings" />
</template>
