<script setup>
/*
  The rig around the mark: the camera, the fog and the room.

  A child of LogoScene's <TresCanvas> on purpose — `useLoop` and
  `useTresContext` need the renderer the canvas provides, and calling them in the
  component that renders the canvas throws.

  **The room is a box seen from the inside.** One `BoxGeometry` with
  `side: BackSide`: the near face is culled, so the camera sits inside an open
  room. One mesh, one unlit material and one small grid texture — the depth is
  real perspective, not painted on. Twelve triangles.

  **The camera peeks.** It follows the pointer with a lerp and always looks back
  at the mark, so the mark stays centred while the room shifts around it: the
  parallax comes from the perspective, not from moving the object. The outer
  frame is CSS and never moves.

  **The fog does the rest.** It fades the room toward the site's own background
  (`--ink`), so the box has no visible far edge. The mark opts out
  (`material.fog = false`, in LogoModel) and stays crisp in the foreground.

  **A glow on the far wall** — a soft accent light, additive, tinted from
  `--acc-solid` — is what makes the room read as a place with its own light
  rather than a flat grid. It is one more quad and one small mask.

  The textures, the fog and the glow are read from the theme tokens and rebuilt
  when `data-theme` or `data-accent` changes, so the room is light in the light
  theme and the light follows the accent.
*/
import { onMounted, onUnmounted, ref } from 'vue'
import { useLoop, useTresContext } from '@tresjs/core'
import { AdditiveBlending, BackSide, CanvasTexture, Fog, SRGBColorSpace } from 'three'

const props = defineProps({
  // Pointer position over the stage, normalised to -1..1, from LogoStage.
  tilt: { type: Object, default: () => ({ x: 0, y: 0 }) },
  // Base distance, from the wheel zoom in LogoScene.
  camZ: { type: Number, required: true },
})

// A room the camera sits inside, wide enough that its far wall stays out of
// reach. The camera never travels near it.
const ROOM = 620
// How far the camera leans, in world units. Small: the depth is the
// perspective, not the travel.
const PEEK_X = 16
const PEEK_Y = 11
// The fog starts behind the mark and ends just short of the far wall.
const FOG_NEAR = 300
const FOG_FAR = 640
const CELLS = 12
// A soft accent light on the far wall, so the room reads as a place with its
// own light rather than a flat grid.
const GLOW = 380

const room = ref(null)
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
  The room's grid, painted from the theme's tokens. A flat fill, not the stage's
  radial gradient: a gradient per face would show its own circle on each wall.
  It uses the page's own `--grid` and is sized so a cell lands near the page's
  72px at the far wall — the closest the box can get to continuing the grid
  outside it.
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
  for (let i = 0; i <= CELLS; i++) {
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
  const gradient = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2,
  )
  gradient.addColorStop(0, 'rgba(255,255,255,0.28)')
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
  glow.value?.dispose()
})

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
  <!-- The accent light on the far wall. Additive, so it only adds to the dark. -->
  <TresMesh v-if="glow" :position="[0, 0, -ROOM / 2 + 6]">
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

  <!-- One box, seen from the inside: its far faces are the room. -->
  <TresMesh v-if="room">
    <TresBoxGeometry :args="[ROOM, ROOM, ROOM]" />
    <TresMeshBasicMaterial :map="room" :side="BackSide" :tone-mapped="false" />
  </TresMesh>
</template>
