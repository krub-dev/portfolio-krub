<script setup>
/*
  The 3D logo, inside the hero stage.

  The mark is the vector path from the favicon (public/assets/img/krub-logo.svg),
  parsed by Three's SVGLoader and extruded — which is the whole reason a vector
  copy exists: an ExtrudeGeometry needs outlines, and a raster PNG has none.

  It is deliberately cheap for what it is:

  - Lazy. TresJS and Three are a chunk of their own; LogoStage mounts the scene
    with defineAsyncComponent, so the initial bundle does not carry it.
  - Framed at 20fps (`fps-limit`) and capped at 1.5x DPR. A logo does not need
    60 frames a second, and the reflections make every frame cost more than a
    flat colour would.
  - Paused off-screen: an IntersectionObserver drives `running`.
  - Never on a phone: the stage is not mounted below 900px (decision 37).

  The wheel zooms the camera, not the mesh, so the perspective stays honest. It
  is clamped, and it only takes the gesture while it can still move — at either
  end the page keeps its scroll.

  The material row is a temporary chooser, here to compare finishes before one is
  picked; it is not meant to ship.
*/
import { computed, onMounted, onUnmounted, ref, shallowRef } from 'vue'
import { TresCanvas } from '@tresjs/core'
import { ExtrudeGeometry } from 'three'
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js'
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

import LogoModel from './LogoModel.vue'

const props = defineProps({
  // Pointer position over the stage, normalised to -1..1, from LogoStage.
  tilt: { type: Object, default: () => ({ x: 0, y: 0 }) },
  spin: { type: Number, default: 0 },
  dragging: { type: Boolean, default: false },
})

const MATERIALS = [
  { id: 'metal', label: 'Metal' },
  { id: 'crystal', label: 'Cristal' },
]

const root = ref(null)
const geometry = shallowRef(null)
const onScreen = ref(false)
const material = ref('metal')
const zoom = ref(1)
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

const DEPTH = 12
const CAM_Z = 205
const ZOOM_MIN = 0.82
const ZOOM_MAX = 1.22

const camZ = computed(() => CAM_Z / zoom.value)

let observer = null

onMounted(() => {
  observer = new IntersectionObserver(([entry]) => (onScreen.value = entry.isIntersecting), {
    rootMargin: '100px',
  })
  observer.observe(root.value)
})

onUnmounted(() => observer?.disconnect())

function onWheel(event) {
  const next = zoom.value * (event.deltaY > 0 ? 0.94 : 1.06)
  const clamped = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, next))
  if (clamped === zoom.value) return // at a limit, let the page have the scroll
  event.preventDefault()
  zoom.value = clamped
}

async function build() {
  const svg = await fetch('/assets/img/krub-logo.svg').then((r) => r.text())
  const paths = new SVGLoader().parse(svg).paths
  const shapes = paths.flatMap((path) => SVGLoader.createShapes(path))

  let built = new ExtrudeGeometry(shapes, {
    depth: DEPTH,
    // A hair of a bevel: enough to catch the light on the edge, small enough
    // that the mark keeps the shape it has in the SVG.
    bevelEnabled: true,
    bevelThickness: 0.8,
    bevelSize: 0.6,
    bevelSegments: 2,
    curveSegments: 24,
  })

  /*
    Smooth the wall without rounding the edges.

    ExtrudeGeometry does not share vertices between the segments of a curve, so
    every facet of the wall carries its own normal and the polished metal shows
    each polygon. `mergeVertices` alone does nothing here — it compares the
    whole vertex, normals included, and they all differ. Dropping the normals
    first lets it weld by position, and the recomputed normals average across
    the curve. The bevel keeps its hard edge because its faces meet at a real
    angle, not a shallow one, so the average does not wash it out.
  */
  built.deleteAttribute('normal')
  built = mergeVertices(built, 1e-3)
  built.computeVertexNormals()
  built.center()
  geometry.value = built
}

build()
</script>

<template>
  <div ref="root" class="scene" @wheel="onWheel">
    <TresCanvas :fps-limit="20" :dpr="[1, 1.5]" clear-color="#00000000" alpha>
      <TresPerspectiveCamera :position="[0, 0, camZ]" :fov="40" />

      <!--
        The "portal": a grid floor that recedes toward a vanishing point behind
        the mark, so the box reads as a small room with depth rather than as a
        flat card. It is one GridHelper — lines, no geometry, no texture — and
        it parallaxes for free because it lives in the scene with the camera.
      -->
      <TresGridHelper
        :args="[900, 30, '#ffc800', '#3a3a3c']"
        :position="[0, -150, -260]"
        :rotation="[-Math.PI / 2, 0, 0]"
        :material-opacity="0.22"
        :material-transparent="true"
      />

      <TresDirectionalLight :position="[120, 160, 200]" :intensity="1.6" />
      <LogoModel
        v-if="geometry"
        :geometry="geometry"
        :tilt="props.tilt"
        :spin="props.spin"
        :dragging="props.dragging"
        :material="material"
        :running="onScreen && !reduced"
      />
    </TresCanvas>

    <div class="materials">
      <button
        v-for="option in MATERIALS"
        :key="option.id"
        type="button"
        :class="{ on: material === option.id }"
        @click="material = option.id"
      >
        {{ option.label }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.scene {
  position: absolute;
  inset: 0;
}

/*
  The temporary material chooser, pinned to the bottom of the box. Small and
  quiet: it is a comparison aid, not part of the design.
*/
.materials {
  position: absolute;
  /* Above the canvas, which is a sibling that paints over it otherwise. */
  z-index: 2;
  bottom: 12px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 4px;
  padding: 4px;
  border-radius: 8px;
  background: color-mix(in srgb, var(--ink) 70%, transparent);
}

.materials button {
  padding: 4px 8px;
  border: 0;
  border-radius: 5px;
  background: none;
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--fg-3);
  cursor: pointer;
}

.materials button.on {
  background: var(--acc);
  color: var(--on-acc);
}
</style>
