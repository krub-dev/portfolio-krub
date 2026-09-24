<script setup>
/*
  The extruded mark: its material, its colour and its movement.

  A child of LogoScene's <TresCanvas> on purpose — TresJS's `useLoop` and
  `useTresContext` both read the renderer from the context the canvas provides,
  so calling them in the component that renders the canvas throws.

  Three things worth knowing:

  - **The colour is a token, not a value.** `--acc-solid` is read from the page
    and re-read when the theme or the accent changes, so the logo follows the
    appearance control like everything else. A material cannot read CSS, so this
    is the one place the value has to be copied across.
  - **The tilt is the logo's, not the box's.** `LogoStage` hands down a pointer
    position normalised to -1..1, and this rotates the mesh with it. The stage
    itself no longer moves.
  - **`running` is the whole optimisation.** Off-screen or under reduced motion
    the renderer's loop is stopped, not just left on a still frame. Stopped, the
    last frame stays on screen and nothing is drawn.

  When the real glTF arrives this file changes one thing: instead of building the
  mesh from `props.geometry`, it takes the loaded scene object and adds it to the
  group. Everything else — lights, colour, tilt, pause — is already here.
*/
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useLoop, useTresContext } from '@tresjs/core'
import { Group, Mesh, MeshStandardMaterial } from 'three'

const props = defineProps({
  geometry: { type: Object, required: true },
  running: { type: Boolean, default: true },
  tilt: { type: Object, default: () => ({ x: 0, y: 0 }) },
})

// How far the cursor turns it, in radians. Small and readable, not a globe.
const TILT_Y = 0.5
const TILT_X = 0.32
// The idle sway, so it is alive when the pointer is still.
const SWAY = 0.12

const accent = ref('#ffc800')
const material = computed(() => new MeshStandardMaterial({ metalness: 0.2, roughness: 0.32 }))

function readAccent() {
  const value = getComputedStyle(document.documentElement).getPropertyValue('--acc-solid')
  if (value) accent.value = value.trim()
}

const group = computed(() => {
  const mesh = new Mesh(props.geometry, material.value)
  const wrapper = new Group()
  wrapper.add(mesh)
  wrapper.scale.setScalar(1.55)
  // SVGLoader lays the shapes out in SVG space (y down), so they come out
  // mirrored in three's y-up world. This is the one flip that puts the mark
  // back the way it reads in the favicon.
  wrapper.scale.y = -1.55
  return wrapper
})

const { renderer } = useTresContext()
const { onBeforeRender } = useLoop()

watch(
  () => props.running,
  (run) => (run ? renderer.loop.start() : renderer.loop.stop()),
  { immediate: true },
)
onBeforeUnmount(() => renderer.loop.stop())

// Follow the appearance control: the accent is written on <html>, and the theme
// changes the same attributes.
const appearance = new MutationObserver(readAccent)
appearance.observe(document.documentElement, { attributes: true })
onBeforeUnmount(() => appearance.disconnect())
readAccent()

onBeforeRender(({ elapsed, delta }) => {
  material.value.color.set(accent.value)
  // Eased toward the cursor, so a fast move is a lean and not a jump.
  const target = props.tilt
  const ease = Math.min(1, delta * 6)
  group.value.rotation.y +=
    (target.x * TILT_Y + Math.sin(elapsed * 0.45) * SWAY - group.value.rotation.y) * ease
  group.value.rotation.x += (-target.y * TILT_X - group.value.rotation.x) * ease
})
</script>

<template>
  <primitive :object="group" />
</template>
