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
import { TresCanvas, useTresContext } from '@tresjs/core'
import { LoadingManager, PMREMGenerator } from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

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
  // Whether the halo is currently lit. Used to trigger the logo "pop" animation.
  haloOn: { type: Boolean, default: false },
  // How the tunnel fades out with depth.
  fog: { type: String, default: 'far' },
})

// Tells LogoStage the scene is up, so it can drop its 2D fallback.
const emit = defineEmits(['ready', 'progress'])

const root = ref(null)
const rig = ref(null)
const logoGroup = shallowRef(null)
const onScreen = ref(false)
const zoom = ref(1)
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

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

/*
  Load the GLB model. The file lives at public/assets/model/krub-logo.glb and
  contains two meshes (front and back) that LogoModel will address separately.
  Loading a GLB is a fetch and a parse of precomputed buffers — it does not
  block the main thread the way parsing an SVG and extruding it does.

  The LoadingManager reports real progress as the file downloads, so the stage
  can show a percentage instead of a fake bar.
*/
async function loadModel() {
  const manager = new LoadingManager()
  manager.onProgress = (url, loaded, total) => {
    emit('progress', Math.round((loaded / total) * 100))
  }

  const loader = new GLTFLoader(manager)
  const gltf = await loader.loadAsync('/assets/model/krub-logo.glb')
  logoGroup.value = gltf.scene
  emit('progress', 100)
  emit('ready')
}

requestAnimationFrame(() => requestAnimationFrame(loadModel))

defineExpose({ logoGroup })
</script>

<template>
  <div ref="root" class="scene" @wheel="onWheel">
    <TresCanvas :fps-limit="24" :dpr="[1, 1.5]" clear-color="#00000000" alpha>
      <TresPerspectiveCamera :position="[0, 0, camZ]" :fov="40" />

      <!-- Lights for the PBR material: ambient for base illumination, directional for volume. -->
      <TresAmbientLight :intensity="0.6" />
      <TresDirectionalLight :position="[0, 0, 10]" :intensity="1.5" />
      <TresDirectionalLight :position="[5, 5, 5]" :intensity="0.6" />

      <SceneRig ref="rig" :tilt="props.tilt" :cam-z="camZ" :fog="props.fog" />

      <LogoModel
        v-if="logoGroup"
        :logo-group="logoGroup"
        :tilt="props.tilt"
        :spin="props.spin"
        :spin-y="props.spinY"
        :dragging="props.dragging"
        :running="onScreen && !reduced"
        :logo="props.logo"
        :halo-on="props.haloOn"
        :environment="rig?.environment"
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
