<script setup>
/*
  The extruded mark: its materials, its colour and its movement.

  A child of LogoScene's <TresCanvas> on purpose — TresJS's `useLoop`,
  `useTresContext` and the environment all need the renderer the canvas
  provides, and calling them in the component that renders the canvas throws.

  Four things worth knowing:

  - **The environment is generated, not downloaded.** RoomEnvironment is a
    little studio built in memory and run through PMREMGenerator (which turns a
    scene into a pre-filtered map the material can reflect). It is what makes
    the polished metal read as metal rather than as flat yellow, and it ships no
    multi-megabyte .hdr.
  - **The colour is a token.** `--acc-solid` is read from the page and re-read
    when the theme or the accent changes. A material cannot read CSS, so this is
    the one place the value is copied across.
  - **The mesh is built once and never rebuilt.** The finish changes by swapping
    `mesh.material`, not by rebuilding the group — rebuilding it threw away the
    object the canvas had already mounted, which is why the first crystal switch
    did nothing.
  - **`running` is the optimisation.** Off-screen or under reduced motion the
    renderer's loop is stopped, not left on a still frame.

  The movement is one value, eased every frame: hover tilts it toward the cursor,
  drag spins it while the button is down, and on release the spin settles back to
  the front — the magnetic snap. Hover is suspended during a drag so the two
  never fight.

  When the real glTF arrives, the mesh is taken from the loaded scene instead of
  built from `props.geometry`. Lights, environment, colour, movement and pause
  stay.
*/
import { onBeforeUnmount, ref, shallowRef, watch } from 'vue'
import { useLoop, useTresContext } from '@tresjs/core'
import {
  Group,
  Mesh,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  PMREMGenerator,
} from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

const props = defineProps({
  geometry: { type: Object, required: true },
  running: { type: Boolean, default: true },
  tilt: { type: Object, default: () => ({ x: 0, y: 0 }) },
  spin: { type: Number, default: 0 },
  dragging: { type: Boolean, default: false },
  material: { type: String, default: 'metal' },
})

// How far the hover turns it, in radians. Small and readable, not a globe.
const TILT_Y = 0.5
const TILT_X = 0.32
const SWAY = 0.12

const accent = ref('#ffc800')
let smoothSpin = 0

function makeMaterial(id) {
  if (id === 'crystal') {
    return new MeshPhysicalMaterial({
      metalness: 0,
      roughness: 0.04,
      transmission: 1,
      thickness: 14,
      ior: 1.5,
      envMapIntensity: 1.4,
    })
  }
  // Polished metal: full metalness and a tight roughness, the environment doing
  // the reflecting. `metalness: 1` tints the reflection rather than a diffuse,
  // which is what gives it the gold.
  return new MeshStandardMaterial({ metalness: 1, roughness: 0.15 })
}

const material = ref(makeMaterial(props.material))

// Built once. The mesh is what the finish swaps on.
const mesh = shallowRef(null)
const group = new Group()
const build = () => {
  const built = new Mesh(props.geometry, material.value)
  mesh.value = built
  group.add(built)
  group.scale.set(1.95)
  // SVGLoader lays the shapes out in SVG space (y down), so they come out
  // mirrored in three's y-up world. This one flip puts the mark back the way it
  // reads in the favicon.
  group.scale.y = -1.95
}
build()

const { renderer, scene } = useTresContext()
const { onBeforeRender } = useLoop()

// The generated environment, once. Disposed with the component.
const pmrem = new PMREMGenerator(renderer.instance)
scene.value.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
onBeforeUnmount(() => pmrem.dispose())

watch(
  () => props.material,
  (id) => {
    material.value.dispose()
    material.value = makeMaterial(id)
    // The swap. The group the canvas mounted is left untouched.
    if (mesh.value) mesh.value.material = material.value
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
  if (props.material === 'crystal') {
    // A near-white crystal that takes a hint of the accent, not a solid fill.
    material.value.color.set(accent.value).lerp({ r: 1, g: 1, b: 1 }, 0.72)
  } else {
    material.value.color.set(accent.value)
  }

  // The drag angle, then the magnetic return: held by the pointer while
  // dragging, easing back to zero the moment it is let go. The return is slower
  // than the hover so the settle is visible.
  const spinTarget = props.dragging ? props.spin : 0
  const spinEase = Math.min(1, delta * (props.dragging ? 14 : 2.6))
  smoothSpin += (spinTarget - smoothSpin) * spinEase

  // During a drag the hover is off: the spin is the whole story.
  const target = props.dragging ? { x: 0, y: 0 } : props.tilt
  const ease = Math.min(1, delta * 6)
  group.rotation.y +=
    (target.x * TILT_Y + Math.sin(elapsed * 0.45) * SWAY + smoothSpin - group.rotation.y) * ease
  group.rotation.x += (target.y * TILT_X - group.rotation.x) * ease
})
</script>

<template>
  <primitive :object="group" />
</template>
