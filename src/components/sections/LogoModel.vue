<script setup>
/*
  The extruded mark: its materials, its colour and its movement.

  A child of LogoScene's <TresCanvas> on purpose — TresJS's `useLoop`,
  `useTresContext` and the environment all need the renderer the canvas
  provides, and calling them in the component that renders the canvas throws.

  The two finishes are three's own, none invented:

  - **Metal** — `MeshStandardMaterial`, full metalness, a tight roughness. The
    environment does the reflecting.
  - **Crystal** — `MeshPhysicalMaterial` with `transmission`. This is the one
    that needs a backdrop: transmission refracts whatever is *behind* the
    object, so with an empty scene it comes out as a flat grey mass. LogoScene
    puts a gradient plane behind it for exactly that reason.

  The mesh is built once and never rebuilt; the finish swaps `mesh.material`, so
  the object the canvas mounted is left alone.

  When the real glTF arrives, the mesh is taken from the loaded scene instead of
  built from `props.geometry`. Lights, environment, colour, movement and pause
  stay.
*/
import { onBeforeUnmount, ref, shallowRef, watch } from 'vue'
import { useLoop, useTresContext } from '@tresjs/core'
import {
  Color,
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
  material: { type: String, default: 'crystal' },
})

// How far the hover turns it, in radians. Small and readable, not a globe.
const TILT_Y = 0.5
const TILT_X = 0.32
const SWAY = 0.12

const accent = ref('#ffc800')
const WHITE = new Color('#ffffff')
let smoothSpin = 0

function makeMaterial(id) {
  if (id === 'crystal') {
    return new MeshPhysicalMaterial({
      metalness: 0,
      roughness: 0.03,
      transmission: 1,
      thickness: 9,
      ior: 1.52,
      // The env map is what gives glass its edge highlights; the transmission
      // gives it what is behind.
      envMapIntensity: 1.6,
      clearcoat: 1,
      clearcoatRoughness: 0.04,
    })
  }
  return new MeshStandardMaterial({ metalness: 1, roughness: 0.15 })
}

const material = ref(makeMaterial(props.material))

const mesh = shallowRef(null)
const group = new Group()
const built = new Mesh(props.geometry, material.value)
mesh.value = built
group.add(built)
group.scale.set(1.95)
// SVGLoader lays the shapes out in SVG space (y down), so they come out mirrored
// in three's y-up world. This one flip puts the mark back the way it reads in
// the favicon.
group.scale.y = -1.95

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
    built.material = material.value
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
    // Near-clear, with the faintest accent so it is not a colourless void.
    material.value.color.set(accent.value).lerp(WHITE, 0.86)
  } else {
    material.value.color.set(accent.value)
  }

  // The drag angle, then the magnetic return: held by the pointer while
  // dragging, easing back to zero the moment it is let go.
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
