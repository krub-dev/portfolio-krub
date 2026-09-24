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
import { computed, onMounted, onUnmounted, ref, shallowRef } from 'vue'
import { useLoop, useTresContext } from '@tresjs/core'
import {
  AdditiveBlending,
  BufferGeometry,
  CanvasTexture,
  DoubleSide,
  Float32BufferAttribute,
  Fog,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
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
//
// The geometry is built at the base distance and the whole box is scaled by the
// zoom (see `k`), which keeps the opening on the stage at any zoom.
const FOV = 40
const BASE_CAM_Z = 205
const OPENING_Z = 25
const CELLS = 7
const ROOM_HALF = (BASE_CAM_Z - OPENING_Z) * Math.tan((FOV / 2) * (Math.PI / 180))
const CELL = (ROOM_HALF * 2) / CELLS
const SPAN = CELL * CELLS
const ROOM_DEPTH = 700
// The zoom: how much nearer the camera is than at rest, and where the box has to
// sit so its opening still lands on OPENING_Z.
const k = computed(() => (props.camZ - OPENING_Z) / (BASE_CAM_Z - OPENING_Z))
const roomZ = computed(() => OPENING_Z - (k.value * ROOM_DEPTH) / 2)
// Just behind the mark the fog starts, and it has blacked the far wall well
// before the box ends, so the tunnel has no bottom to see.
const FOG_NEAR = 240
const FOG_FAR = 560
// The lean, sized to the frame: the opening is the stage, so a bigger one would
// pull its edge out from under the frame's band.
// The lean, sized to the slim frame: the band is 12px, and a bigger one would
// pull the box's edge out from under it.
const PEEK_X = 3
const PEEK_Y = 2
// The entrance glow: a ring of light at the opening, just inside the frame.
const RING_INSET = 0.94
// A neutral halo behind the mark, in the theme's own background: dark in the
// dark theme, light in the light one.
const BACKLIGHT_Z = -60
const BACKLIGHT = 170

const room = ref(null)
const roomGeo = ref(null)
const backlight = ref(null)
const backlightMesh = ref(null)
const backlightColor = ref('#0c0c0d')
const ring = shallowRef(null)
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
  /*
    The lines sit on the halves of a cell, not on `i * step`: the stage's own
    grid puts a line on every edge and none through its middle, because seven
    whole cells leave the centre mid-cell. Drawing the texture half a cell over
    is what makes the two grids meet instead of running a cell out of phase.
  */
  for (let i = 0; i < CELLS; i++) {
    const p = Math.round((i + 0.5) * step) + 0.5
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
  The halo is a white radial mask; its colour is the page's own background, set
  on the material. A mask has to be white.
*/
function buildBacklight() {
  const size = 256
  const canvas = makeCanvas(size)
  const ctx = canvas.getContext('2d')
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  gradient.addColorStop(0, 'rgba(255,255,255,0.85)')
  gradient.addColorStop(0.5, 'rgba(255,255,255,0.3)')
  gradient.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)

  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  backlight.value?.dispose()
  backlight.value = texture
}

function readBacklight() {
  const css = getComputedStyle(document.documentElement)
  // The halo is the page's own background: dark in the dark theme, light in the
  // light one, so it separates the mark without a colour of its own.
  backlightColor.value = css.getPropertyValue('--ink').trim() || '#0c0c0d'
}

/*
  The entrance glow: a soft ring of light at the opening, in the accent. It is a
  blurred square, not a stroked outline — a hard line reads as wire, and the point
  is the sense of light coming in from the frame — so it is drawn in a few passes
  with a growing blur for a bright core and a wide halo.
*/
function buildRing() {
  const size = 512
  const canvas = makeCanvas(size)
  const ctx = canvas.getContext('2d')
  const inset = size * 0.06
  const box = size - inset * 2
  ctx.strokeStyle = tokens().accent
  ctx.shadowColor = tokens().accent
  for (const [width, blur, alpha] of [
    [size * 0.005, size * 0.02, 1],
    [size * 0.009, size * 0.06, 0.5],
    [size * 0.013, size * 0.13, 0.26],
  ]) {
    ctx.globalAlpha = alpha
    ctx.lineWidth = width
    ctx.shadowBlur = blur
    ctx.strokeRect(inset, inset, box, box)
  }
  ctx.globalAlpha = 1

  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  disposeRing()
  const span = ROOM_HALF * 2 * RING_INSET
  const mesh = new Mesh(
    new PlaneGeometry(span, span),
    new MeshBasicMaterial({
      map: texture,
      transparent: true,
      blending: AdditiveBlending,
      depthWrite: false,
      toneMapped: false,
      fog: false,
    }),
  )
  mesh.position.z = OPENING_Z
  ring.value = mesh
}

function disposeRing() {
  if (!ring.value) return
  ring.value.material.map?.dispose()
  ring.value.geometry.dispose()
  ring.value.material.dispose()
  ring.value = null
}

function repaint() {
  buildRoom()
  buildFog()
  readBacklight()
  buildRing()
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
  disposeRing()
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

  // The halo sits on the camera's own axis, behind the mark: the point on the
  // line through the camera and the mark at the halo's depth. Without this it
  // stays in world space and slides off the mark as the camera leans.
  const axis = BACKLIGHT_Z / props.camZ
  backlightMesh.value?.position.set(smoothX * axis, -smoothY * axis, BACKLIGHT_Z)

  // The ring sits on the opening, and the opening scales with the zoom.
  ring.value?.scale.setScalar(k.value)
})
</script>

<template>
  <!-- The room: a deep box open toward the camera. It scales and moves with the
       zoom so its opening stays on the stage. -->
  <TresMesh
    v-if="roomGeo"
    :geometry="roomGeo"
    :position="[0, 0, roomZ]"
    :scale="[k, k, k]"
  >
    <TresMeshBasicMaterial :map="room" :side="DoubleSide" :tone-mapped="false" />
  </TresMesh>

  <!-- A neutral halo behind the mark, to clear the grid and rim it. It is placed
       each frame on the camera's own axis (below), so it stays behind the mark
       however the camera leans instead of sliding off it. -->
  <TresMesh ref="backlightMesh" v-if="backlight" :position="[0, 0, BACKLIGHT_Z]">
    <TresPlaneGeometry :args="[BACKLIGHT, BACKLIGHT]" />
    <TresMeshBasicMaterial
      :map="backlight"
      :color="backlightColor"
      :transparent="true"
      :depth-write="false"
      :tone-mapped="false"
      :fog="false"
    />
  </TresMesh>
  <!-- The entrance glow at the opening. -->
  <primitive v-if="ring" :object="ring" />
</template>
