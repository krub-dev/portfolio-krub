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
  - Paused off-screen. An IntersectionObserver in the wrapper drives `running`,
    and the child stops the renderer's loop when the stage leaves the viewport.
  - Never on a phone: the stage itself is not mounted below 900px (decision 37),
    so the scene never loads there at all.

  Everything about placement — the box, the cursor tilt, the reduced-motion
  behaviour — stays in LogoStage, so the scene knows nothing about the page.
*/
import { onMounted, onUnmounted, ref, shallowRef } from 'vue'
import { TresCanvas } from '@tresjs/core'
import { ExtrudeGeometry } from 'three'
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js'

import LogoModel from './LogoModel.vue'

const root = ref(null)
const geometry = shallowRef(null)
const onScreen = ref(false)
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

const DEPTH = 26

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
    bevelEnabled: true,
    bevelThickness: 3,
    bevelSize: 2,
    bevelSegments: 4,
    // Low on purpose: the outlines are already smooth, and this is the curve
    // resolution of the bevel, not of the mark.
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
