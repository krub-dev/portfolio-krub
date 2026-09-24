<script setup>
/*
  The rig around the mark: the camera, the fog and the room.

  A child of LogoScene's <TresCanvas> on purpose — `useLoop` and
  `useTresContext` need the renderer the canvas provides, and calling them in the
  component that renders the canvas throws.

  **The room is a tapering box, open at the front.** Its four walls run away from
  the frame and close on a smaller far wall, so the grid on them converges and
  the box reads as a recess with real perspective. The camera sits just outside
  the near face, which is left out of the geometry, so it looks straight in. Ten
  triangles, one unlit material and one grid texture.

  **The camera peeks.** It follows the pointer with a lerp and always looks back
  at the mark, so the mark stays centred while the room shifts around it: the
  parallax comes from the perspective, not from moving the object. The outer
  frame is CSS and never moves.

  **The fog does the rest.** It fades the room's far wall toward the site's own
  background (`--ink`), so the box has no hard far edge. The mark opts out
  (`material.fog = false`, in LogoModel) and stays crisp in the foreground.

  **A faint glow on the far wall** — a soft accent light, additive, tinted from
  `--acc-solid` — so the room reads as a place with its own light. Kept weak: a
  stronger one reflected on the metal.

  The texture, the fog and the glow are read from the theme tokens and rebuilt
  when `data-theme` or `data-accent` changes.
*/
import { onMounted, onUnmounted, ref } from 'vue'
import { useLoop, useTresContext } from '@tresjs/core'
import {
  AdditiveBlending,
  BackSide,
  BufferGeometry,
  CanvasTexture,
  EdgesGeometry,
  Fog,
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
// edges; the walls run back to a far wall that is only a fraction of the frame,
// which is what gives the box its depth.
const ROOM_HALF = 80
const ROOM_TAPER = 1
const ROOM_DEPTH = 280
const ROOM_CENTER_Z = -55
// The fog starts behind the mark and has thinned the far wall by nearly half.
const FOG_NEAR = 250
const FOG_FAR = 600
// World units per grid cell, so the grid is the same size on every face.
const CELL = 12
// Cells drawn per texture tile; the walls' UVs divide by CELL * CELLS so a cell
// lands exactly one `CELL` wide.
const CELLS = 8
const SPAN = CELL * CELLS
const GLOW = 200
// How far the camera leans, in world units.
const PEEK_X = 16
const PEEK_Y = 11

const room = ref(null)
const roomGeo = ref(null)
const edgeGeo = ref(null)
const edgeColor = ref('rgba(255,255,255,.11)')
const glow = ref(null)
const glowColor = ref('#ffc800')
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

  // The box's edges: without them the walls read as one flat grid.
  edgeGeo.value?.dispose()
  edgeGeo.value = new EdgesGeometry(geo)
}

/*
  The room's grid, painted from the theme's tokens — the page's own `--grid`, so
  the lines inside match the ones outside as far as the perspective allows. The
  texture tiles, so a cell is `CELL` world units on every face.
*/
function buildRoom() {
  const css = getComputedStyle(document.documentElement)
  const surface = css.getPropertyValue('--surface').trim() || '#141416'
  const grid = css.getPropertyValue('--grid').trim() || 'rgba(255,255,255,.045)'

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
  const css = getComputedStyle(document.documentElement)
  const ink = css.getPropertyValue('--ink').trim() || '#0c0c0d'
  if (!scene.value.fog) {
    scene.value.fog = new Fog(ink, FOG_NEAR, FOG_FAR)
  } else {
    scene.value.fog.color.set(ink)
  }
}

/*
  The glow is a white radial mask, not a colour: the tint comes from the
  material, which reads `--acc-solid` so the light in the room matches the mark.
  A mask has to be white, the same way the fade masks above have to be black.
*/
function buildGlow() {
  const size = 256
  const canvas = makeCanvas(size)
  const ctx = canvas.getContext('2d')
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  gradient.addColorStop(0, 'rgba(255,255,255,0.3)')
  gradient.addColorStop(0.4, 'rgba(255,255,255,0.07)')
  gradient.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)

  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  glow.value?.dispose()
  glow.value = texture
}

function readAccent() {
  const css = getComputedStyle(document.documentElement)
  glowColor.value = css.getPropertyValue('--acc-solid').trim() || '#ffc800'
  edgeColor.value = css.getPropertyValue('--line').trim() || 'rgba(255,255,255,.11)'
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
  edgeGeo.value?.dispose()
  glow.value?.dispose()
})

buildRoomGeometry()
buildGlow()
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
  <!-- The room: a box narrowing away from the frame, open toward the camera. -->
  <TresMesh v-if="roomGeo" :geometry="roomGeo" :position="[0, 0, ROOM_CENTER_Z]">
    <TresMeshBasicMaterial :map="room" :side="BackSide" :tone-mapped="false" />
  </TresMesh>

  <!-- The box's edges, so the room reads as a box and not as a flat grid. -->
  <TresLineSegments v-if="edgeGeo" :geometry="edgeGeo" :position="[0, 0, ROOM_CENTER_Z]">
    <TresLineBasicMaterial :color="edgeColor" :transparent="true" :tone-mapped="false" />
  </TresLineSegments>

  <!-- The accent light on the far wall. Additive, so it only adds. -->
  <TresMesh v-if="glow" :position="[0, 0, ROOM_CENTER_Z - ROOM_DEPTH / 2 + 8]">
    <TresPlaneGeometry :args="[GLOW, GLOW]" />
    <TresMeshBasicMaterial
      :map="glow"
      :color="glowColor"
      :transparent="true"
      :blending="AdditiveBlending"
      :depth-write="false"
      :tone-mapped="false"
      :fog="false"
    />
  </TresMesh>
</template>
