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
import { Box3, Group, MeshStandardMaterial, Vector3 } from 'three'

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
  // The environment map from SceneRig, so the metal has something to reflect.
  environment: { type: Object, default: null },
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
let smoothSpin = 0
let smoothSpinY = 0

/*
  Two materials: the front face gets the accent colour, the back gets a dark
  neutral. Both are polished metal (metalness 0.9, roughness 0.25) with the
  environment map from SceneRig so they reflect the room.
*/
const frontMaterial = new MeshStandardMaterial({
  metalness: 0.9,
  roughness: 0.25,
  envMapIntensity: 1.2,
})
frontMaterial.fog = false

const backMaterial = new MeshStandardMaterial({
  color: '#4a4a4a',
  metalness: 0.9,
  roughness: 0.25,
  envMapIntensity: 1.2,
  side: 2, // DoubleSide: render both faces so there are no holes when viewed through the front mesh
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

console.log('[LogoModel] GLB meshes:', meshes.length, meshes.map((m) => m.name))

meshes.forEach((child, index) => {
  // If there are exactly 2 meshes, first is back, second is front (reverse order in GLB).
  // Otherwise, try to match by name.
  let isBack = false
  if (meshes.length === 2) {
    isBack = index === 0 // Reversed: GLB exports back first, front second
  } else {
    isBack = child.name.toLowerCase().includes('back')
  }
  
  console.log(`[LogoModel] Mesh ${index}: "${child.name}" → ${isBack ? 'back (grey)' : 'front (accent)'}`)
  
  child.material = isBack ? backMaterial : frontMaterial
  // Keep the mesh's local transform — do NOT reset to zero. The front and back
  // meshes have different positions in the GLB, and resetting them would make
  // them overlap.
  group.add(child)
})

// Center the group so the logo sits at the origin.
const box = new Box3().setFromObject(group)
const center = box.getCenter(new Vector3())
group.position.sub(center)

// Scale to fit the stage. The logo should occupy ~70% of the 504px stage ≈ 353px.
// At FOV 40, Z 205, one Three unit ≈ 3.38px at Z=0. So we need ~104 units wide.
const size = box.getSize(new Vector3())
const targetWidth = 104
const currentWidth = size.x || 1
const s = targetWidth / currentWidth
group.scale.set(s, s, s)
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

watch(
  () => props.running,
  (run) => (run ? renderer.loop.start() : renderer.loop.stop()),
  { immediate: true },
)
onBeforeUnmount(() => renderer.loop.stop())

// Follow the appearance control: the accent is written on <html>, and the theme
// changes the same attributes.
function readAccent() {
  const value = getComputedStyle(document.documentElement).getPropertyValue('--acc-solid')
  if (value) accent.value = value.trim()
}
const appearance = new MutationObserver(readAccent)
appearance.observe(document.documentElement, { attributes: true })
onBeforeUnmount(() => appearance.disconnect())
readAccent()

onBeforeRender(({ elapsed, delta }) => {
  frontMaterial.color.set(accent.value)

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
