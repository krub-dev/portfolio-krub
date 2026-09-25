<script setup>
/*
  The 3D logo, inside the hero stage.

  The mark is the vector path from the favicon (public/assets/img/krub-logo.svg),
  parsed by Three's SVGLoader and extruded — which is the whole reason a vector
  copy exists: an ExtrudeGeometry needs outlines, and a raster PNG has none.

  The scene is the mark and the rig around it (SceneRig): a deep box open at the
  front, its grid fading into the page's background, and a camera that leans a
  little with the pointer. The box's opening is cut to land exactly on the stage,
  so its grid lines fall on the page's own grid at the frame.

  It is deliberately cheap for what it is:

  - Lazy. TresJS and Three are a chunk of their own; LogoStage mounts the scene
    with defineAsyncComponent, so the initial bundle does not carry it.
  - **The loop only runs while the stage is mostly on screen** (60%), so the
    reflections cost nothing during the scroll.
  - Framed at 24fps and capped at 1.5x DPR.
  - The room is one unlit box of ten triangles and one small grid texture.
  - Never on a phone: the stage is not mounted below 900px (decision 37).

  The camera zooms; the room scales with it, which keeps its opening on the
  stage and its grid on the page's, so the zoom moves the mark and nothing else.
*/
import { computed, onMounted, onUnmounted, ref, shallowRef, watch } from 'vue'
import { TresCanvas } from '@tresjs/core'
import { ExtrudeGeometry } from 'three'
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js'
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

import LogoModel from './LogoModel.vue'
import SceneRig from './SceneRig.vue'

const props = defineProps({
  // Pointer position over the stage, normalised to -1..1, from LogoStage.
  tilt: { type: Object, default: () => ({ x: 0, y: 0 }) },
  spin: { type: Number, default: 0 },
  spinY: { type: Number, default: 0 },
  dragging: { type: Boolean, default: false },
  // Bumped by a double press in LogoStage: bring the zoom home.
  reset: { type: Number, default: 0 },
  // The lab hides the mark to show what is behind it. On in the site.
  logo: { type: Boolean, default: true },
  // Same, for the halo the rig puts behind the mark.
  halo: { type: Boolean, default: true },
})

// Tells LogoStage the scene is up, so it can drop its 2D fallback.
const emit = defineEmits(['ready'])

const root = ref(null)
const geometry = shallowRef(null)
const onScreen = ref(false)
const zoom = ref(1)
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

const DEPTH = 12
const CAM_Z = 205
const ZOOM_MIN = 0.82
const ZOOM_MAX = 1.22

const camZ = computed(() => CAM_Z / zoom.value)

let observer = null

onMounted(() => {
  // 0.6, not "any pixel": the loop is what costs, so it waits until the box is
  // properly in view rather than waking up as it grazes the edge of the screen.
  observer = new IntersectionObserver(([entry]) => (onScreen.value = entry.isIntersecting), {
    threshold: 0.6,
  })
  observer.observe(root.value)
})

onUnmounted(() => observer?.disconnect())

// A double press in LogoStage (its `reset` token) brings the zoom back to rest.
watch(
  () => props.reset,
  () => {
    zoom.value = 1
  },
)

/*
  The wheel zooms the camera. The room keeps its opening on the stage by scaling
  with the distance (SceneRig), so the zoom moves the mark without taking the
  grid off the page's.
*/
function onWheel(event) {
  const next = zoom.value * (event.deltaY > 0 ? 0.94 : 1.06)
  const clamped = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, next))
  if (clamped === zoom.value) return // at a limit, let the page have the scroll
  event.preventDefault()
  zoom.value = clamped
}

// Away immediately, so the wait for it overlaps the work below rather than
// holding it up.
const svgText = fetch('/assets/img/krub-logo.svg').then((response) => response.text())

async function build() {
  const svg = await svgText
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
    Smooth the wall without rounding the edges. ExtrudeGeometry does not share
    vertices between the segments of a curve, so every facet of the wall carries
    its own normal and the polished metal shows each polygon. `mergeVertices`
    alone does nothing here — it compares the whole vertex, normals included, and
    they all differ. Dropping the normals first lets it weld by position, and the
    recomputed normals average across the curve.
  */
  built.deleteAttribute('normal')
  built = mergeVertices(built, 1e-3)
  built.computeVertexNormals()
  built.center()
  geometry.value = built
  emit('ready')
}

/*
  Two frames before the heavy half: parsing the SVG and extruding it blocks the
  main thread — around half a second, measured — and the frame has no business
  waiting on that. The fetch is already away and the room is built by SceneRig, so
  what this defers is only the parse, the extrude and the weld.

  When the mark arrives as a glTF this goes: loading one is a fetch and a parse of
  precomputed buffers, which does not block.
*/
requestAnimationFrame(() => requestAnimationFrame(build))
</script>

<template>
  <div ref="root" class="scene" @wheel="onWheel">
    <TresCanvas :fps-limit="24" :dpr="[1, 1.5]" clear-color="#00000000" alpha>
      <TresPerspectiveCamera :position="[0, 0, camZ]" :fov="40" />
      <TresDirectionalLight :position="[120, 160, 200]" :intensity="1" />

      <SceneRig :tilt="props.tilt" :cam-z="camZ" :halo="props.halo" />

      <LogoModel
        v-if="geometry"
        :geometry="geometry"
        :tilt="props.tilt"
        :spin="props.spin"
        :spin-y="props.spinY"
        :dragging="props.dragging"
        :running="onScreen && !reduced"
        :logo="props.logo"
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
