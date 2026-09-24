<script setup>
/*
  The extruded mark: its material, its colour and its movement.

  A child of LogoScene's <TresCanvas> on purpose — TresJS's `useLoop`,
  `useTresContext` and the environment all need the renderer the canvas
  provides, and calling them in the component that renders the canvas throws.

  Three things worth knowing:

  - **The environment is generated, not downloaded.** RoomEnvironment is a
    little studio built in memory and run through PMREMGenerator (which turns a
    scene into a pre-filtered cube map the material can reflect). It is what
    makes the polished metal read as metal rather than as flat yellow, and it
    ships no multi-megabyte .hdr.
  - **The colour is a token.** `--acc-solid` is read from the page and re-read
    when the theme or the accent changes, so the logo follows the appearance
    control like everything else. A material cannot read CSS, so this is the one
    place the value is copied across.
  - **`running` is the optimisation.** Off-screen or under reduced motion the
    renderer's loop is stopped, not left on a still frame.

  When the real glTF arrives, the mesh is taken from the loaded scene instead of
  built from `props.geometry`. Lights, environment, colour, tilt and pause stay.
*/
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useLoop, useTresContext } from '@tresjs/core'
import { Group, Mesh, MeshStandardMaterial, PMREMGenerator } from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

const props = defineProps({
  geometry: { type: Object, required: true },
  running: { type: Boolean, default: true },
  tilt: { type: Object, default: () => ({ x: 0, y: 0 }) },
  material: { type: String, default: 'metal' },
})

// How far the cursor turns it, in radians. Small and readable, not a globe.
const TILT_Y = 0.5
const TILT_X = 0.32
const SWAY = 0.12

const accent = ref('#ffc800')

// Polished metal: full metalness, a tight roughness, and the generated
// environment doing the reflecting. `metalness: 1` means the base colour tints
// the reflection rather than the diffuse, which is what gives it the gold.
function makeMaterial() {
  return new MeshStandardMaterial({ metalness: 1, roughness: 0.15 })
}

const material = ref(makeMaterial())

const group = computed(() => {
  const mesh = new Mesh(props.geometry, material.value)
  const wrapper = new Group()
  wrapper.add(mesh)
  wrapper.scale.set(1.95)
  // SVGLoader lays the shapes out in SVG space (y down), so they come out
  // mirrored in three's y-up world. This one flip puts the mark back the way it
  // reads in the favicon.
  wrapper.scale.y = -1.95
  return wrapper
})

const { renderer, scene } = useTresContext()
const { onBeforeRender } = useLoop()

// The generated environment, once. Disposed with the component.
const pmrem = new PMREMGenerator(renderer.instance)
scene.value.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
onBeforeUnmount(() => pmrem.dispose())

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
  material.value.color.set(accent.value)

  // Eased toward the cursor, so a fast move is a lean and not a jump. Both axes
  // look at the pointer: +x turns right, +y (cursor below centre) tips the top
  // toward the viewer.
  const target = props.tilt
  const ease = Math.min(1, delta * 6)
  group.value.rotation.y +=
    (target.x * TILT_Y + Math.sin(elapsed * 0.45) * SWAY - group.value.rotation.y) * ease
  group.value.rotation.x += (target.y * TILT_X - group.value.rotation.x) * ease
})
</script>

<template>
  <primitive :object="group" />
</template>
