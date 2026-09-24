<script setup>
/*
  The 3D logo, inside the hero stage.

  The mark is the vector path from the favicon (public/assets/img/krub-logo.svg),
  parsed by Three's SVGLoader and extruded — which is the whole reason a vector
  copy exists: an ExtrudeGeometry needs outlines, and a raster PNG has none.

  **The box is a window, not a card.** A large plane sits behind the mark with a
  soft radial gradient, so the stage reads as a small space with depth rather
  than as a flat panel — and, more concretely, so the crystal has something
  behind it to refract. Transmission without a backdrop is a grey mass; this is
  what makes the glass look like glass. The plane is one quad and one texture.

  It is deliberately cheap for what it is:

  - Lazy. TresJS and Three are a chunk of their own; LogoStage mounts the scene
    with defineAsyncComponent, so the initial bundle does not carry it.
  - **The loop only runs while the stage is mostly on screen** (60%), so the
    reflections cost nothing during the scroll.
  - Framed at 24fps and capped at 1.5x DPR.
  - Never on a phone: the stage is not mounted below 900px (decision 37).

  The wheel zooms the camera, not the mesh, so the perspective stays honest. It
  is clamped, and it only takes the gesture while it can still move — at either
  end the page keeps its scroll.
*/
import { computed, onMounted, onUnmounted, ref, shallowRef } from 'vue'
import { TresCanvas } from '@tresjs/core'
import { CanvasTexture, ExtrudeGeometry, SRGBColorSpace } from 'three'
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js'
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

import LogoModel from './LogoModel.vue'

const props = defineProps({
  // Pointer position over the stage, normalised to -1..1, from LogoStage.
  tilt: { type: Object, default: () => ({ x: 0, y: 0 }) },
  spin: { type: Number, default: 0 },
  dragging: { type: Boolean, default: false },
})

// Tells LogoStage the scene is up, so it can drop its 2D fallback.
const emit = defineEmits(['ready'])

const MATERIALS = [
  { id: 'metal', label: 'Metal' },
  { id: 'crystal', label: 'Cristal' },
]

const root = ref(null)
const geometry = shallowRef(null)
const backdrop = ref(null)
const onScreen = ref(false)
const material = ref('crystal')
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

function onWheel(event) {
  const next = zoom.value * (event.deltaY > 0 ? 0.94 : 1.06)
  const clamped = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, next))
  if (clamped === zoom.value) return // at a limit, let the page have the scroll
  event.preventDefault()
  zoom.value = clamped
}

/*
  The backdrop: a soft radial gradient drawn once into a canvas. It is what the
  crystal refracts and what gives the box its depth. A texture rather than a
  shader, because it never changes.
*/
function buildBackdrop() {
  const size = 512
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')

  const gradient = ctx.createRadialGradient(
    size * 0.5,
    size * 0.42,
    size * 0.04,
    size * 0.5,
    size * 0.5,
    size * 0.62,
  )
  gradient.addColorStop(0, '#3a3a40')
  gradient.addColorStop(0.55, '#1c1c20')
  gradient.addColorStop(1, '#0c0c0d')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)

  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  backdrop.value = texture
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

buildBackdrop()
build()
</script>

<template>
  <div ref="root" class="scene" @wheel="onWheel">
    <TresCanvas :fps-limit="24" :dpr="[1, 1.5]" clear-color="#00000000" alpha>
      <TresPerspectiveCamera :position="[0, 0, camZ]" :fov="40" />
      <TresDirectionalLight :position="[120, 160, 200]" :intensity="1.6" />

      <!-- The window: a gradient plane behind the mark, the thing the crystal
           refracts and what gives the box its depth. -->
      <TresMesh v-if="backdrop" :position="[0, 0, -180]">
        <TresPlaneGeometry :args="[1400, 1400]" />
        <TresMeshBasicMaterial :map="backdrop" :tone-mapped="false" />
      </TresMesh>

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
