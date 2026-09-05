<script setup>
/*
  The Madrid clock in the footer.

  Two things have to be right and neither is guessable from the machine's own
  clock: the time in Madrid, and whether Madrid is currently on CET or CEST.

  Intl gives us the first directly. For the second, we work out Madrid's offset
  from UTC at this instant — format "now" in that timezone, read it back as if
  it were UTC, and the difference is the offset. 60 minutes means CET, 120
  means summer time. That is the only honest way: a hardcoded +1 is wrong for
  half the year, and the switchover dates move.
*/
import { onMounted, onUnmounted, ref } from 'vue'

const props = defineProps({
  timezone: { type: String, default: 'Europe/Madrid' },
})

const time = ref('--:--:--')
const zone = ref('')

let timer = null

const timeFormat = new Intl.DateTimeFormat('en-GB', {
  timeZone: props.timezone,
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
})

const partsFormat = new Intl.DateTimeFormat('en-US', {
  timeZone: props.timezone,
  hour12: false,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
})

function offsetMinutes(date) {
  const p = Object.fromEntries(partsFormat.formatToParts(date).map((x) => [x.type, x.value]))
  // Intl can report hour "24" for midnight; Date.UTC wants 0.
  const hour = p.hour === '24' ? 0 : Number(p.hour)
  const asUTC = Date.UTC(Number(p.year), Number(p.month) - 1, Number(p.day), hour, Number(p.minute), Number(p.second))
  return Math.round((asUTC - Math.floor(date.getTime() / 1000) * 1000) / 60000)
}

function tick() {
  const now = new Date()
  time.value = timeFormat.format(now)
  const offset = offsetMinutes(now)
  zone.value = offset === 120 ? 'CEST (UTC+2)' : 'CET (UTC+1)'
}

onMounted(() => {
  tick()
  timer = setInterval(tick, 1000)
})

// Without this the interval keeps running after the component is gone.
onUnmounted(() => clearInterval(timer))
</script>

<template>
  <span class="clock">
    <span class="time">{{ time }}</span>
    <span>{{ zone }}</span>
  </span>
</template>

<style scoped>
.clock {
  display: inline-flex;
  gap: 6px;
}

.time {
  color: var(--fg-2);
  /* Digits are not all the same width in JetBrains Mono's proportional
     figures; this stops the line jittering every second. */
  font-variant-numeric: tabular-nums;
}
</style>
