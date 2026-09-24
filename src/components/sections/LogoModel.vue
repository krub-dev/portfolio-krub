<script setup>
/*
  The extruded mark itself, and its slow sway.

  It is a child of LogoScene's <TresCanvas> on purpose: TresJS's `useLoop` and
  `useTresContext` both read the renderer from the context the canvas provides,
  so calling them in the component that renders the canvas throws.

  `running` is the whole optimisation: when the stage is off-screen (or the
  visitor asked for reduced motion) the renderer's loop is stopped, not just left
  to draw a still frame — a loop that keeps running for something nobody can see
  is the one real cost of a WebGL canvas on a page like this. Stopped, the last
  frame stays on screen.
*/
import { computed, onBeforeUnmount, watch } from 'vue'
import { useLoop, useTresContext } from '@tresjs/core'
import { Group, Mesh, MeshStandardMaterial } from 'three'

const props = defineProps({
  geometry: { type: Object, required: true },
  running: { type: Boolean, default: true },
})

// The brand yellow, as a value: the material is not CSS, so it cannot read a
// token. It is the same `--acc` the rest of the site paints with.
const YELLOW = '#ffc800'
// Small: at 90 degrees the word stops being a word. The cursor tilt that
// LogoStage already puts on the canvas is what gives the depth; this only keeps
// it alive when the pointer is still.
const SWAY = 0.16

const group = computed(() => {
  const mesh = new Mesh(
    props.geometry,
    new MeshStandardMaterial({ color: YELLOW, metalness: 0.2, roughness: 0.32 }),
  )
  const wrapper = new Group()
  wrapper.add(mesh)
  wrapper.scale.setScalar(1.55)
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

onBeforeRender(({ elapsed }) => {
  group.value.rotation.y = Math.sin(elapsed * 0.45) * SWAY
})
</script>

<template>
  <primitive :object="group" />
</template>
