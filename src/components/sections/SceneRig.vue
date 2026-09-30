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
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useLoop, useTresContext } from '@tresjs/core'
import {
  BufferGeometry,
  CanvasTexture,
  DoubleSide,
  Float32BufferAttribute,
  Fog,
  MeshBasicMaterial,
  PMREMGenerator,
  RepeatWrapping,
  SRGBColorSpace,
} from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

const props = defineProps({
  // Pointer position over the stage, normalised to -1..1, from LogoStage.
  tilt: { type: Object, default: () => ({ x: 0, y: 0 }) },
  // Base distance, from the wheel zoom in LogoScene.
  camZ: { type: Number, required: true },
  // How the tunnel fades out with depth. See FOG_MODES.
  fog: { type: String, default: 'far' },
  /*
    Whether the room is drawn at all. Off leaves the mark alone in the scene,
    with nothing behind it — what the Open Graph card wants, and what the stage
    never does, so the default is the stage's.
  */
  room: { type: Boolean, default: true },
  /*
    A depth gradient painted into the geometry's vertex colours: white at the
    opening, `depth` at the far wall. The grid texture multiplies it, so the
    walls *and* their lines sink together as they go back — depth without a light
    and without darkening the mouth, so the room still meets the page at the
    frame. `depth` is how dark the far wall goes (1 = none).
  */
  gradient: { type: Boolean, default: false },
  depth: { type: Number, default: 0.55 },
  /*
    A soft dark blob just behind the mark, on the wall. A plane with a radial
    gradient in `--cast`, transparent, that gives the floating mark something to
    cast onto — the cheap contact shadow, no light and no shadow map.
  */
  shadow: { type: Boolean, default: false },
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
// Reduced from 700 to 400 so the transverse lines are not as compressed by the
// perspective transform. The tunnel still reads as deep, but the grid cells look
// more square on screen instead of elongated.
const ROOM_DEPTH = 400
// The zoom: how much nearer the camera is than at rest, and where the box has to
// sit so its opening still lands on OPENING_Z.
const k = computed(() => (props.camZ - OPENING_Z) / (BASE_CAM_Z - OPENING_Z))
const roomZ = computed(() => OPENING_Z - (k.value * ROOM_DEPTH) / 2)
// The contact shadow, in the room's own coordinates so it scales and travels
// with the box. Local z 120 is a little over halfway back, just behind the mark.
const SHADOW_LOCAL_Z = 120
const SHADOW_LOCAL_Y = -18
const shadowZ = computed(() => roomZ.value + k.value * SHADOW_LOCAL_Z)
const shadowY = computed(() => k.value * SHADOW_LOCAL_Y)
/*
  How the tunnel fades out with depth. All of them fade to `--ink`, the page's own
  background, because that is what the tunnel should disappear into.

  - `off` is the tunnel with nothing between it and the page.
  - `near` is where it started: the darkening begins just past the mark and is
    complete well before the far wall.
  - `far` is the default: it begins deep and is only complete past the wall, so
    what you see is the tunnel getting dark rather than a blob appearing.

  A `haze` mode — the same fog built from `--fg` mixed into `--ink`, so the end
  rises above the background instead of falling to it — was built and dropped: it
  does lift the end (12 to 33 on the same measurement) but its boundary is a
  square panel of mist at the end of the tunnel, which reads as a lit wall rather
  than as depth. See the backlog.
*/
const FOG_MODES = {
  off: null,
  near: { near: 240, far: 560 },
  far: { near: 430, far: 900 },
}
// The lean, sized to the frame: the opening is the stage, so a bigger one would
// pull its edge out from under the frame's band.
// The lean, sized to the slim frame: the band is 12px, and a bigger one would
// pull the box's edge out from under it.
const PEEK_X = 3
const PEEK_Y = 2

const room = ref(null)
const roomGeo = ref(null)
const shadow = ref(null)
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

const { camera, scene, renderer } = useTresContext()
const { onBeforeRender } = useLoop()

let observer = null
let smoothX = 0
let smoothY = 0
let environment = null
let pmremBuilt = false

function makeCanvas(size) {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  return canvas
}

function tokens() {
  const css = getComputedStyle(document.documentElement)
  const read = (name, fallback) => css.getPropertyValue(name).trim() || fallback
  return {
    ink: read('--ink', '#0c0c0d'),
    fogEnd: read('--fog-end', '#0c0c0d'),
    /*
      The page's own grid colour, not `--line`. The room's lines are meant to be
      the page's lines carried into depth: with the ring lit, the difference is
      invisible, but the moment the room is shown without it — which is what the
      Open Graph card does — two grids in two colours read as a mistake.
    */
    grid: read('--grid', 'rgba(255,255,255,.045)'),
    // The contact shadow is a shadow, so it takes the shadow token and stays
    // dark in both themes.
    cast: read('--cast', 'rgba(0,0,0,.85)'),
  }
}

/*
  The walls, built by hand so the grid is world-uniform: a BoxGeometry maps each
  face to 0..1, which would stretch the grid on the deeper walls, so the UVs are
  taken straight from the world position here instead.

  The Z axis uses a perspective transform so the transverse lines (at constant Z)
  are spaced in screen space rather than world space. This makes the interior grid
  coincide with the page's grid when projected, instead of the lines bunching up
  near the frame.
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
  const colors = []
  const indices = []

  const addQuad = (corners, project) => {
    const base = positions.length / 3
    for (const corner of corners) {
      positions.push(corner[0], corner[1], corner[2])
      uvs.push(project(corner)[0], project(corner)[1])
      // The depth gradient, per vertex: 1 at the opening, `depth` at the back.
      // Pushed always, read only when the material asks for vertex colours.
      const t = (zn - corner[2]) / (zn - zf)
      const c = 1 - (1 - props.depth) * t
      colors.push(c, c, c)
    }
    indices.push(base, base + 1, base + 2, base, base + 2, base + 3)
  }

  // Perspective transform for Z: maps Z to a value that, when used as a UV,
  // spaces the transverse lines uniformly in screen space.
  const zToPersp = (z) => {
    const vRaw = 1 / (z - BASE_CAM_Z)
    const vMin = 1 / (zn - BASE_CAM_Z)
    const vMax = 1 / (zf - BASE_CAM_Z)
    return (vRaw - vMin) / (vMax - vMin)
  }

  const xz = (c) => [c[0] / SPAN, c[2] / SPAN]
  const zy = (c) => [c[2] / SPAN, c[1] / SPAN]
  const xy = (c) => [c[0] / SPAN, c[1] / SPAN]

  // Floor and ceiling: X linear, Z in perspective.
  const xzPersp = (c) => [c[0] / SPAN, zToPersp(c[2])]
  // Side walls: Z in perspective, Y linear.
  const zyPersp = (c) => [zToPersp(c[2]), c[1] / SPAN]

  addQuad([NBL, NBR, FBR, FBL], xzPersp) // floor
  addQuad([NBR, NTR, FTR, FBR], zyPersp) // right wall
  addQuad([NTR, NTL, FTL, FTR], xzPersp) // ceiling
  addQuad([NTL, NBL, FBL, FTL], zyPersp) // left wall
  addQuad([FBL, FBR, FTR, FTL], xy) // far wall

  const geo = new BufferGeometry()
  geo.setAttribute('position', new Float32BufferAttribute(positions, 3))
  geo.setAttribute('uv', new Float32BufferAttribute(uvs, 2))
  geo.setAttribute('color', new Float32BufferAttribute(colors, 3))
  geo.setIndex(indices)
  geo.computeBoundingSphere()
  roomGeo.value?.dispose()
  roomGeo.value = geo
}

/*
  The room's grid, painted from the theme's tokens. Both halves take the page's
  own colours — the walls the page background, the lines the page grid — so the
  room's grid *is* the page's grid carried into depth: same colour, same cells at
  the opening. With the ring lit the wall tone was hidden behind the light, but
  the moment the room is shown without it, which is what the Open Graph card does,
  a lighter box with brighter lines reads as a second, mismatched grid.
*/
function buildRoom() {
  const { ink, grid } = tokens()
  /*
    A whole number of cells across the tile, so it is exactly one repeat and
    wraps without a seam. At 512 the tile was not a multiple of seven, and
    rounding the half-cell line positions left the join a pixel wide of every
    other gap — a faint line running the length of each wall.
  */
  const cellPx = 72
  const size = cellPx * CELLS
  const canvas = makeCanvas(size)
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = ink
  ctx.fillRect(0, 0, size, size)

  ctx.strokeStyle = grid
  ctx.lineWidth = 1
  ctx.beginPath()
  /*
    The lines sit on the halves of a cell, not on `i * step`: the stage's own
    grid puts a line on every edge and none through its middle, because seven
    whole cells leave the centre mid-cell. Drawing the texture half a cell over
    is what makes the two grids meet instead of running a cell out of phase. The
    half-pixel offset lands the one-pixel stroke on a whole texel.
  */
  for (let i = 0; i < CELLS; i++) {
    const p = (i + 0.5) * cellPx + 0.5
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
  `--cast` at a given alpha. The token is an `rgba(...)`, and a canvas gradient
  needs the alpha per stop, so the channels are kept and only the alpha swapped.
*/
function fade(color, alpha) {
  const m = color.match(/rgba?\(([^)]+)\)/)
  if (!m) return color
  const [r, g, b] = m[1].split(',').map((s) => s.trim())
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

/*
  The mark's contact shadow: a radial gradient in `--cast`, painted on a plane
  just behind the mark. No light and no shadow map — it is a sprite the wall
  shows through where it is transparent.

  Five stops, not two: most of the alpha is gone by two thirds of the radius, so
  the blob reads as a blur rather than as a disc with a hard rim. The centre
  alpha is the 0.5 that the material's old 0.6 opacity gave over the token.
*/
function buildShadow() {
  const { cast } = tokens()
  const size = 256
  const canvas = makeCanvas(size)
  const ctx = canvas.getContext('2d')
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  g.addColorStop(0, fade(cast, 0.5))
  g.addColorStop(0.3, fade(cast, 0.36))
  g.addColorStop(0.55, fade(cast, 0.2))
  g.addColorStop(0.8, fade(cast, 0.07))
  g.addColorStop(1, 'transparent')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)

  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  shadow.value?.dispose()
  shadow.value = texture
}

function buildFog() {
  const { fogEnd } = tokens()
  const mode = FOG_MODES[props.fog] ?? FOG_MODES.far
  if (!mode) {
    scene.value.fog = null
    return
  }
  if (!scene.value.fog) {
    scene.value.fog = new Fog(fogEnd, mode.near, mode.far)
  } else {
    scene.value.fog.color.set(fogEnd)
  }
  applyFogScale()
}

/*
  The fog distances are measured from the camera, and the camera's distance to the
  room's far wall scales with the zoom (`k`) — so the fog has to scale with it
  too. Left in fixed world units, the same wall sat at a different point of the
  fade: the tunnel's dark end lightened as you zoomed in and darkened as you
  zoomed out, so the background changed under the mark. Tied to `k`, the end holds
  however near or far the camera is.
*/
function applyFogScale() {
  const fog = scene.value?.fog
  const mode = FOG_MODES[props.fog] ?? FOG_MODES.far
  if (!fog || !mode) return
  fog.near = mode.near * k.value
  fog.far = mode.far * k.value
}

// The lab flips this while the stage is up, so the whole fog is rebuilt, not just
// recoloured. The zoom only re-scales it.
watch(() => props.fog, buildFog)
watch(k, applyFogScale)
// The gradient lives in the geometry's vertex colours, so the dial rebuilds it.
watch(() => props.depth, buildRoomGeometry)

function repaint() {
  buildRoom()
  buildShadow()
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
  shadow.value?.dispose()
  roomGeo.value?.dispose()
  environment?.dispose()
})

defineExpose({ environment })

buildRoomGeometry()
repaint()

onBeforeRender(({ delta }) => {
  // Build the PMREM environment on the first frame, once the renderer is ready.
  if (!pmremBuilt && renderer.value) {
    const pmrem = new PMREMGenerator(renderer.value)
    environment = pmrem.fromScene(new RoomEnvironment()).texture
    pmrem.dispose()
    pmremBuilt = true
  }

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
  <!-- The room: a deep box open toward the camera. It scales and moves with the
       zoom so its opening stays on the stage. -->
  <TresMesh
    v-if="props.room && roomGeo"
    :geometry="roomGeo"
    :position="[0, 0, roomZ]"
    :scale="[k, k, k]"
  >
    <!--
      Unlit: the walls are exactly `--ink`, so the grid is the page's carried into
      depth. With `gradient`, the vertex colours darken the wall toward the back,
      and the grid lines ride down with it.
    -->
    <TresMeshBasicMaterial
      :map="room"
      :side="DoubleSide"
      :vertex-colors="props.gradient"
      :tone-mapped="false"
    />
  </TresMesh>

  <!-- The mark's contact shadow: a soft blob on the wall behind it. -->
  <TresMesh
    v-if="props.room && props.shadow && shadow"
    :position="[0, shadowY, shadowZ]"
    :scale="[k, k, k]"
  >
    <TresMeshBasicMaterial
      :map="shadow"
      :transparent="true"
      :depth-write="false"
      :tone-mapped="false"
      :fog="false"
    />
    <TresPlaneGeometry :args="[170, 170]" />
  </TresMesh>
</template>
