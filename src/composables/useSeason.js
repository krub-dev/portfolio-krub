import { computed } from 'vue'

import { config } from '../data'
import { useAccent } from './useAccent'

/*
  Which seasonal layer, if any, is on, and the one place that decides it: the
  master switch in config.js and the accent on <html>. Halloween is the orange
  accent for now, so it costs the visitor nothing to try — pick orange, the layer
  comes on; pick another, it goes.

  Everything seasonal reads this: HalloweenFx stamps it on <html>, the Stack and
  the Testimonials filter their extra entries by it. Turning the switch off means
  deleting the seasonal bits, not hunting for conditionals.
*/
export function useSeason() {
  const { accent } = useAccent()

  const season = computed(() =>
    config.showHalloween && accent.value === 'orange' ? 'halloween' : null,
  )

  return { season }
}

export default useSeason
