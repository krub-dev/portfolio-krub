<script setup>
/*
  The 3D logo, inside the hero stage.

  The mark is the vector path from the favicon (public/assets/img/krub-logo.svg),
  parsed by Three's SVGLoader and extruded — which is the whole reason a vector
  copy exists: an ExtrudeGeometry needs outlines, and a raster PNG has none.

  **The box is a window, not a card.** Two surfaces build a shallow room behind
  the mark: a back wall carrying the stage's own gradient and grid, and a floor
  whose grid runs away from the camera. The floor is what gives the box depth —
  a flat wall alone is still a card.

  The wall is painted from the theme's own tokens (`--surface`, `--ink`,
  `--grid`), read once and rebuilt when `data-theme` changes, so the box is light
  in the light theme instead of a dark hole in a light page.

  It is deliberately cheap for what it is:

  - Lazy. TresJS and Three are a chunk of their own; LogoStage mounts the scene
    with defineAsyncComponent, so the initial bundle does not carry it.
  - **The loop only runs while the stage is mostly on screen** (60%), so the
    reflections cost nothing during the scroll.
  - Framed at 24fps and capped at 1.5x DPR.
  - Never on a phone: the stage is not mounted below 900px (decision 37).

  The wheel zooms the camera, not the mesh, so the perspective stays honest. It
  is clamped, and it only takes the gesture while it can still move — at either
  end the page keeps its scroll.
*/
import { computed, onMounted, onUnmounted, ref, shallowRef } from 'vue'
import { TresCanvas } from '@tresjs/core'
import { CanvasTexture, ExtrudeGeometry, SRGBColorSpace } from 'three'
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js'
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

import LogoModel from './LogoModel.vue'

const props = defineProps({
  // Pointer position over the stage, normalised to -1..1, from LogoStage.
  tilt: { type: Object, default: () => ({ x: 0, y: 0 }) },
  spin: { type: Number, default: 0 },
  dragging: { type: Boolean, default: false },
})

// Tells LogoStage the scene is up, so it can drop its 2D fallback.
const emit = defineEmits(['ready'])

const root = ref(null)
const geometry = shallowRef(null)
const backdrop = ref(null)
const floor = ref(null)
const onScreen = ref(false)
const zoom = ref(1)
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

const DEPTH = 12
const CAM_Z = 205
const WALL_Z = -280
const FLOOR_Y = -84
const ZOOM_MIN = 0.82
const ZOOM_MAX = 1.22

const camZ = computed(() => CAM_Z / zoom.value)

let observer = null
let themeObserver = null

onMounted(() => {
  // 0.6, not "any pixel": the loop is what costs, so it waits until the box is
  // properly in view rather than waking up as it grazes the edge of the screen.
  observer = new IntersectionObserver(([entry]) => (onScreen.value = entry.isIntersecting), {
    threshold: 0.6,
  })
  observer.observe(root.value)

  // The wall and the floor are painted from the theme tokens, so they are
  // rebuilt when the theme changes. The textures are disposed first: a rebuilt
  // canvas texture is a new GPU upload, and the old one would leak.
  themeObserver = new MutationObserver(repaint)
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  })
})

onUnmounted(() => {
  observer?.disconnect()
  themeObserver?.disconnect()
  backdrop.value?.dispose()
  floor.value?.dispose()
})

function onWheel(event) {
  const next = zoom.value * (event.deltaY > 0 ? 0.94 : 1.06)
  const clamped = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, next))
  if (clamped === zoom.value) return // at a limit, let the page have the scroll
  event.preventDefault()
  zoom.value = clamped
}

function makeCanvas(size) {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  return canvas
}

function drawGrid(ctx, size, cells, style, width) {
  const step = size / cells
  ctx.strokeStyle = style
  ctx.lineWidth = width
  ctx.beginPath()
  for (let i = 0; i <= cells; i++) {
    const p = Math.round(i * step) + 0.5
    ctx.moveTo(p, 0)
    ctx.lineTo(p, size)
    ctx.moveTo(0, p)
    ctx.lineTo(size, p)
  }
  ctx.stroke()
}

/*
  The theme's colours, read from CSS so the box follows the light/dark switch the
  same way the CSS stage does. The fallbacks are the dark tokens, in case this
  runs before the stylesheet has resolved.
*/
function readTokens() {
  const css = getComputedStyle(document.documentElement)
  const read = (name, fallback) => css.getPropertyValue(name).trim() || fallback
  return {
    surface: read('--surface', '#141416'),
    ink: read('--ink', '#0c0c0d'),
    grid: read('--grid', 'rgba(255,255,255,.045)'),
  }
}

/*
  The back wall. The gradient is the stage's own (`--surface` to `--ink`); the
  grid is sized so it lands at roughly the CSS stage's 40px cells — the plane
  sits at WALL_Z, parallel to the camera, so its world grid projects to a screen
  grid, and the two backgrounds line up.
*/
function buildBackdrop() {
  const { surface, ink, grid } = readTokens()
  const size = 1024
  const canvas = makeCanvas(size)
  const ctx = canvas.getContext('2d')

  const gradient = ctx.createRadialGradient(
    size * 0.5,
    size * 0.44,
    size * 0.03,
    size * 0.5,
    size * 0.5,
    size * 0.72,
  )
  gradient.addColorStop(0, surface)
  gradient.addColorStop(1, ink)
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)

  // 50 cells across a 1600-unit plane is ~32 units — about 42px on screen.
  drawGrid(ctx, size, 50, grid, 1.4)

  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  texture.anisotropy = 4
  backdrop.value?.dispose()
  backdrop.value = texture
}

/*
  The floor: the same grid, coarser, faded to nothing at the edges so the plane
  has no border. This is the depth cue — its lines converge as they recede.
*/
function buildFloor() {
  const { grid } = readTokens()
  const size = 1024
  const canvas = makeCanvas(size)
  const ctx = canvas.getContext('2d')

  drawGrid(ctx, size, 16, grid, 1.4)

  ctx.globalCompositeOperation = 'destination-in'
  const fade = ctx.createRadialGradient(
    size * 0.5,
    size * 0.5,
    size * 0.04,
    size * 0.5,
    size * 0.5,
    size * 0.5,
  )
  fade.addColorStop(0, 'rgba(0,0,0,1)')
  fade.addColorStop(0.6, 'rgba(0,0,0,0.55)')
  fade.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = fade
  ctx.fillRect(0, 0, size, size)

  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  texture.anisotropy = 4
  floor.value?.dispose()
  floor.value = texture
}

function repaint() {
  buildBackdrop()
  buildFloor()
}

async function build() {
  const svg = await fetch('/assets/img/krub-logo.svg').then((r) => r.text())
  const paths = new SVGLoader().parse(svg).paths
  const shapes = paths.flatMap((path) => SVGLoader.createShapes(path))

  let built = new ExtrudeGeometry(shapes, {
    depth: DEPTH,
    // A hair of a bevel: enough to catch the light on the edge, small enough
    // that the mark keeps the shape it has in the SVG.
    bevelEnabled: true,
    bevelThickness: 0.8,
    bevelSize: 0.6,
    bevelSegments: 2,
    curveSegments: 24,
  })

  /*
    Smooth the wall without rounding the edges. ExtrudeGeometry does not share
    vertices between the segments of a curve, so every facet of the wall carries
    its own normal and the polished metal shows each polygon. `mergeVertices`
    alone does nothing here — it compares the whole vertex, normals included, and
    they all differ. Dropping the normals first lets it weld by position, and the
    recomputed normals average across the curve.
  */
  built.deleteAttribute('normal')
  built = mergeVertices(built, 1e-3)
  built.computeVertexNormals()
  built.center()
  geometry.value = built
  emit('ready')
}

repaint()
build()
</script>

<template>
  <div ref="root" class="scene" @wheel="onWheel">
    <TresCanvas :fps-limit="24" :dpr="[1, 1.5]" clear-color="#00000000" alpha>
      <!-- A little above the mark and looking slightly down, so the floor is
           seen as a floor instead of edge-on. -->
      <TresPerspectiveCamera :position="[0, 22, camZ]" :rotation="[-0.1, 0, 0]" :fov="40" />
      <TresDirectionalLight :position="[120, 160, 200]" :intensity="1.6" />

      <!-- The back wall: the stage's gradient and grid. -->
      <TresMesh v-if="backdrop" :position="[0, 0, WALL_Z]">
        <TresPlaneGeometry :args="[1600, 1600]" />
        <TresMeshBasicMaterial :map="backdrop" :tone-mapped="false" />
      </TresMesh>

      <!-- The floor: the same grid, receding. The depth cue. -->
      <TresMesh v-if="floor" :position="[0, FLOOR_Y, -40]" :rotation="[-Math.PI / 2, 0, 0]">
        <TresPlaneGeometry :args="[1400, 1400]" />
        <TresMeshBasicMaterial
          :map="floor"
          :transparent="true"
          :depth-write="false"
          :tone-mapped="false"
        />
      </TresMesh>

      <LogoModel
        v-if="geometry"
        :geometry="geometry"
        :tilt="props.tilt"
        :spin="props.spin"
        :dragging="props.dragging"
        :running="onScreen && !reduced"
      />
    </TresCanvas>
  </div>
</template>

<style scoped>
.scene {
  position: absolute;
  inset: 0;
}
</style>
