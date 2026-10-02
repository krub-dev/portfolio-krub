<script setup>
/*
  The loaded GLB model: its materials, colours and movement.

  A child of LogoScene's <TresCanvas> on purpose — TresJS's `useLoop`,
  `useTresContext` and the environment all need the renderer the canvas
  provides, and calling them in the component that renders the canvas throws.

  The finish is PBR: `MeshStandardMaterial` with the environment map from
  SceneRig, so the metal reflects the room and the surfaces get gradients
  instead of coming out flat.

  The GLB contains two meshes (front and back). Each gets its own material so
  they can be coloured independently — the front takes the accent, the back a
  darker neutral.
*/
import { onBeforeUnmount, ref, watch } from 'vue'
import { useLoop, useTresContext } from '@tresjs/core'
import { Box3, Color, Group, MeshStandardMaterial, Vector3 } from 'three'

const props = defineProps({
  logoGroup: { type: Object, required: true },
  running: { type: Boolean, default: true },
  tilt: { type: Object, default: () => ({ x: 0, y: 0 }) },
  spin: { type: Number, default: 0 },
  spinY: { type: Number, default: 0 },
  dragging: { type: Boolean, default: false },
  // The lab takes the mark out of the scene to show what is behind it. Hidden by
  // `v-if` on the primitive rather than by unmounting, so the material and the
  // generated environment survive the toggle.
  logo: { type: Boolean, default: true },
  // Whether the halo is lit. Triggers the "pop" animation when it turns on.
  haloOn: { type: Boolean, default: false },
  // The environment map from SceneRig, so the metal has something to reflect.
  environment: { type: Object, default: null },
  // A multiplier on the fit-to-stage scale, so the mark can be sized by hand
  // without touching the room (which scales with the canvas, not with this).
  markScale: { type: Number, default: 1 },
})

// How far the hover turns it, in radians. Wider than it was: the room's lean is
// capped by the frame's width (SceneRig), so this is the axis with room to give,
// and the mark has to carry the gesture.
const TILT_Y = 0.5
const TILT_X = 0.27
// The idle: a slow breath on both axes, a touch wider and quicker than it was
// so the mark never looks parked.
const SWAY = 0.2
const SWAY_X = 0.1
const BREATH = 0.7

const accent = ref('#ffc800')
// The "off" colour: dark grey in dark theme, light grey in light theme.
// Matches the page background so the logo reads as part of the scene before
// the halo lights it up.
const off = ref('#1a1a1a')
let smoothSpin = 0
let smoothSpinY = 0
// Strike progress: 0 = off, 1 = fully lit. Driven by the same timing as
// glowStrike in LogoStage (flickers at 8%, 44%, 58%, 80%, hold at 100%).
/*
  Start lit when the halo is already on. The scene is remounted when the blind is
  lowered and raised again, and by then the halo never changes, so the strike
  below would not fire and the mark would sit in its "off" grey. Starting at 1
  puts it straight at the accent, like the ring, which stays lit the whole time.
*/
let strikeProgress = props.haloOn ? 1 : 0

/*
  Two materials: the front face gets the accent colour, the back gets a dark
  neutral. Both are polished metal (metalness 0.9, roughness 0.25) with the
  environment map from SceneRig so they reflect the room.
*/
const frontMaterial = new MeshStandardMaterial({
  metalness: 0.9,
  roughness: 0.25,
  envMapIntensity: 1.2,
  side: 2, // DoubleSide: prevent holes when viewed at angles
})
frontMaterial.fog = false

const backMaterial = new MeshStandardMaterial({
  color: '#888888', // Medium grey - lighter so it doesn't read as black through the letter holes
  metalness: 0.9,
  roughness: 0.25,
  envMapIntensity: 1.2,
  side: 2, // DoubleSide: render both faces
})
backMaterial.fog = false

const group = new Group()
// The GLB scene is a Group with the meshes (possibly nested in sub-groups).
// Walk the whole tree and reparent every mesh into our group, keeping their
// relative transforms so the front and back stay in their correct positions.
const meshes = []
props.logoGroup.traverse((child) => {
  if (child.isMesh) meshes.push(child)
})

meshes.forEach((child) => {
  // Skip helper curves from Blender (Curve00X). Only render the actual logo meshes.
  if (child.name.startsWith('Curve')) return
  
  // Only "krub-logo_front" gets the accent material. Everything else gets the
  // dark grey back material.
  const isFront = child.name === 'krub-logo_front'
  child.material = isFront ? frontMaterial : backMaterial
  group.add(child)
})

// Center the group so the logo sits at the origin.
const box = new Box3().setFromObject(group)
const center = box.getCenter(new Vector3())
group.position.sub(center)

// Scale to fit the stage. The logo should occupy ~70% of the 504px stage ≈ 353px.
// At FOV 40, Z 205, one Three unit ≈ 3.38px at Z=0. So we need ~104 units wide.
//
// The fit is the base, and `markScale` rides on top of it — a dial the Open Graph
// card uses to put the mark's edges on the grid. It scales the mark inside the
// scene, not the canvas: a CSS transform on the canvas would shrink the room with
// it, and the room has to reach the slot's edge.
const size = box.getSize(new Vector3())
const targetWidth = 104
const currentWidth = size.x || 1
const baseScale = targetWidth / currentWidth

function applyMarkScale() {
  const s = baseScale * props.markScale
  group.scale.set(s, s, s)
}

applyMarkScale()
watch(() => props.markScale, applyMarkScale)
// The GLB was exported with the logo lying flat (rotation X=90° applied in Blender).
// Rotate -90° on X to stand it up facing the camera (+Z).
group.rotation.x = -Math.PI / 2

const { renderer } = useTresContext()
const { onBeforeRender } = useLoop()

onBeforeUnmount(() => {
  frontMaterial.dispose()
  backMaterial.dispose()
})

// The environment map arrives asynchronously from SceneRig. When it does, both
// materials pick it up and start reflecting the room.
watch(
  () => props.environment,
  (env) => {
    frontMaterial.envMap = env
    frontMaterial.needsUpdate = true
    backMaterial.envMap = env
    backMaterial.needsUpdate = true
  },
)

// When the halo lights up, the logo colour follows the same flicker pattern
// as glowStrike: off → flicker → off → flicker → flicker → off → hold.
// The colour interpolates between off (dark/light grey) and the accent.
watch(
  () => props.haloOn,
  (on) => {
    if (!on) {
      strikeProgress = 0
      return
    }
    // glowStrike is 2.1s with steps at 8, 14, 36, 44, 50, 58, 64, 80, 100%.
    // We mirror those steps: on at 8-14, 44-50, 58-64, 80-100.
    const steps = [
      { at: 0.08, on: true },
      { at: 0.14, on: false },
      { at: 0.44, on: true },
      { at: 0.50, on: false },
      { at: 0.58, on: true },
      { at: 0.64, on: false },
      { at: 0.80, on: true },
      { at: 1.00, on: true },
    ]
    const duration = 2100
    const start = performance.now()

    const tick = (now) => {
      const elapsed = now - start
      const t = Math.min(elapsed / duration, 1)
      let lit = false
      for (const step of steps) {
        if (t >= step.at) lit = step.on
        else break
      }
      strikeProgress = lit ? 1 : 0
      if (t < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  },
)

watch(
  () => props.running,
  (run) => (run ? renderer.loop.start() : renderer.loop.stop()),
  { immediate: true },
)
onBeforeUnmount(() => renderer.loop.stop())

// Follow the appearance control: the accent is written on <html>, and the theme
// changes the same attributes.
function readAccent() {
  const css = getComputedStyle(document.documentElement)
  const acc = css.getPropertyValue('--acc-solid').trim()
  if (acc) accent.value = acc
  // The off colour matches the page background so the logo blends in before
  // the halo lights it. Dark theme: near-black. Light theme: near-white.
  const ink = css.getPropertyValue('--ink').trim()
  if (ink) off.value = ink
}
const appearance = new MutationObserver(readAccent)
appearance.observe(document.documentElement, { attributes: true })
onBeforeUnmount(() => appearance.disconnect())
readAccent()

const offColor = new Color()
const accentColor = new Color()
const currentColor = new Color()

onBeforeRender(({ elapsed, delta }) => {
  // Interpolate between off colour and accent based on strike progress.
  offColor.set(off.value)
  accentColor.set(accent.value)
  currentColor.lerpColors(offColor, accentColor, strikeProgress)
  frontMaterial.color.copy(currentColor)

  // The drag angle, then the magnetic return: held by the pointer while
  // dragging, easing back to zero the moment it is let go. On both axes.
  const spinEase = Math.min(1, delta * (props.dragging ? 14 : 2.6))
  smoothSpin += ((props.dragging ? props.spin : 0) - smoothSpin) * spinEase
  smoothSpinY += ((props.dragging ? props.spinY : 0) - smoothSpinY) * spinEase

  // During a drag the hover is off: the spin is the whole story, and the idle
  // breathes underneath it whichever way that is.
  const target = props.dragging ? { x: 0, y: 0 } : props.tilt
  // Slower than the drag's return: leaving the stage used to snap, and the eye
  // reads a hanging tilt as the mark settling rather than as a jump.
  const ease = Math.min(1, delta * 3.5)
  group.rotation.y +=
    (target.x * TILT_Y + Math.sin(elapsed * BREATH) * SWAY + smoothSpin - group.rotation.y) * ease
  group.rotation.x +=
    (target.y * TILT_X +
      Math.sin(elapsed * BREATH * 0.8) * SWAY_X +
      smoothSpinY -
      group.rotation.x) *
    ease
})
</script>

<template>
  <primitive v-if="props.logo" :object="group" />
</template>
