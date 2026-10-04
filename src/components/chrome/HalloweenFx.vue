<script setup>
/*
  The seasonal layer, mounted once in App.vue behind the config switch.

  All it does is stamp data-season="halloween" on <html> while the season is on
  (the orange accent, per useSeason), and take it off when it is not. Every
  seasonal style hangs off that one attribute, so this component is the whole
  wiring: no page component knows the season exists. The stylesheet is imported
  here on purpose — it ships and dies with this component.

  Removing Halloween: delete this component, styles/halloween.css, the config
  line, and the two `season` flags in the data. Nothing else refers to it.
*/
import { onBeforeUnmount, watchEffect } from 'vue'

import { useSeason } from '../../composables/useSeason'
import '../../styles/halloween.css'

const { season } = useSeason()

watchEffect(() => {
  const root = document.documentElement
  if (season.value) root.setAttribute('data-season', season.value)
  else root.removeAttribute('data-season')
})

// Leave nothing behind if the app tears down mid-season.
onBeforeUnmount(() => document.documentElement.removeAttribute('data-season'))
</script>

<template>
  <slot />
</template>
