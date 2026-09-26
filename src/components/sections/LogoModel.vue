<script setup>
/*
  The extruded mark: its material, its colour and its movement.

  A child of LogoScene's <TresCanvas> on purpose — TresJS's `useLoop`,
  `useTresContext` and the environment all need the renderer the canvas
  provides, and calling them in the component that renders the canvas throws.

  The finish is a matcap: a `MeshMatcapMaterial` and one texture, with no lights
  and no environment behind it. See the note above the material.

  The mesh is built once and never rebuilt.

  When the real glTF arrives, the mesh is taken from the loaded scene instead of
  built from `props.geometry`. Lights, environment, colour, movement and pause
  stay.
*/
import { onBeforeUnmount, ref, watch } from 'vue'
import { useLoop, useTresContext } from '@tresjs/core'
import { Group, Mesh, MeshMatcapMaterial, SRGBColorSpace, TextureLoader } from 'three'

const props = defineProps({
  geometry: { type: Object, required: true },
  running: { type: Boolean, default: true },
  tilt: { type: Object, default: () => ({ x: 0, y: 0 }) },
  spin: { type: Number, default: 0 },
  spinY: { type: Number, default: 0 },
  dragging: { type: Boolean, default: false },
  // The lab takes the mark out of the scene to show what is behind it. Hidden by
  // `v-if` on the primitive rather than by unmounting, so the material and the
  // generated environment survive the toggle.
  logo: { type: Boolean, default: true },
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
  A matcap, not a lit material. `MeshMatcapMaterial` colours each pixel from a
  texture read by the surface normal in view space — the lighting and the
  reflections are baked into the image — so there is no environment, no PMREM, no
  BRDF and no light reaching it at all. It is the cheap route to a polished metal,
  and the mark barely moves, which is exactly the case matcaps are for.

  The image is neutral grey on purpose: the mark's colour is the accent, applied
  by `material.color` over it, so the matcap supplies the shading and the accent
  supplies the hue. Two things bound the choice: a dark matcap turns the accent
  into dark, desaturated patches, and a very light one leaves the mark looking
  flat. This one spans about 55% to 87% — enough range for the bevels and the walls
  to read as metal, no black in it.
  What no matcap can do here is shade the front face: the extrusion's front is one
  normal from edge to edge, and a matcap samples by the normal alone, so that face
  comes out flat. Only a material that reads the environment along the view vector
  puts a gradient on it, which is the price of not carrying one.

  Asset: `matcaps/256/8D8D8D_DDDDDD_CCCCCC_B7B7B7-256px.png` from
  github.com/nidorx/matcaps.
*/
const matcap = new TextureLoader().load('/assets/img/matcap-satin.png')
matcap.colorSpace = SRGBColorSpace

const material = new MeshMatcapMaterial({ matcap })
// The mark is the foreground: the tunnel's fog must not wash it out.
material.fog = false

const group = new Group()
group.add(new Mesh(props.geometry, material))
group.scale.set(1.95)
// SVGLoader lays the shapes out in SVG space (y down), so they come out mirrored
// in three's y-up world. This one flip puts the mark back the way it reads in
// the favicon.
group.scale.y = -1.95

const { renderer } = useTresContext()
const { onBeforeRender } = useLoop()

onBeforeUnmount(() => material.dispose())
onBeforeUnmount(() => matcap.dispose())

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
  material.color.set(accent.value)

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
