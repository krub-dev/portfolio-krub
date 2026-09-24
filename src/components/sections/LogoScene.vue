<script setup>
/*
  The 3D logo, inside the hero stage.

  The mark is the vector path from the favicon (public/assets/img/krub-logo.svg),
  parsed by Three's SVGLoader and extruded — which is the whole reason a vector
  copy exists: an ExtrudeGeometry needs outlines, and a raster PNG has none.

  It is deliberately cheap for what it is:

  - Lazy. TresJS and Three are a chunk of their own; LogoStage mounts the scene
    with defineAsyncComponent, so the initial bundle does not carry it.
  - Framed at 30fps (`fps-limit`) and capped at 2x DPR: a logo does not need 60
    frames a second, and a phone screen at 3x would triple the pixels for a shape
    that is already smooth.
  - Paused off-screen. An IntersectionObserver drives `running`, and the child
    stops the renderer's loop when the stage leaves the viewport.
  - Never on a phone: the stage itself is not mounted below 900px (decision 37),
    so the scene never loads there at all.

  When the real glTF is ready, this file swaps the SVGLoader/ExtrudeGeometry pair
  for a GLTFLoader and hands the loaded object to LogoModel instead of a geometry.
  The lights, the camera, the pause and the tilt are already here and stay.
*/
import { onMounted, onUnmounted, ref, shallowRef } from 'vue'
import { TresCanvas } from '@tresjs/core'
import { ExtrudeGeometry } from 'three'
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js'

import LogoModel from './LogoModel.vue'

const props = defineProps({
  // Pointer position over the stage, normalised to -1..1, from LogoStage.
  tilt: { type: Object, default: () => ({ x: 0, y: 0 }) },
})

const root = ref(null)
const geometry = shallowRef(null)
const onScreen = ref(false)
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

const DEPTH = 18

let observer = null

onMounted(() => {
  observer = new IntersectionObserver(([entry]) => (onScreen.value = entry.isIntersecting), {
    rootMargin: '100px',
  })
  observer.observe(root.value)
})

onUnmounted(() => observer?.disconnect())

async function build() {
  const svg = await fetch('/assets/img/krub-logo.svg').then((r) => r.text())
  const paths = new SVGLoader().parse(svg).paths
  const shapes = paths.flatMap((path) => SVGLoader.createShapes(path))

  const built = new ExtrudeGeometry(shapes, {
    depth: DEPTH,
    // A hair of a bevel: enough to catch the light on the edge, small enough
    // that the mark keeps the shape it has in the SVG. Anything more and the
    // strokes read inflated.
    bevelEnabled: true,
    bevelThickness: 0.8,
    bevelSize: 0.6,
    bevelSegments: 2,
    curveSegments: 8,
  })
  // Spin around its own middle rather than around a corner.
  built.center()
  geometry.value = built
}

build()
</script>

<template>
  <div ref="root" class="scene">
    <TresCanvas :fps-limit="30" :dpr="[1, 2]" clear-color="#00000000" alpha>
      <TresPerspectiveCamera :position="[0, 0, 260]" :fov="40" />
      <TresAmbientLight :intensity="1.1" />
      <TresDirectionalLight :position="[120, 160, 200]" :intensity="2.2" />
      <TresDirectionalLight :position="[-160, -80, 80]" :intensity="0.7" />
      <LogoModel
        v-if="geometry"
        :geometry="geometry"
        :tilt="props.tilt"
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
