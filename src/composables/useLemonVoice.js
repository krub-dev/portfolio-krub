import { computed, shallowRef } from 'vue'

/*
  What Limonacho is saying, and whether anyone is there to say it.

  Module scope, like useAcho's flag, because the two ends are far apart: the
  lemon lives in App.vue and the Stack is buried in the page. A prop chain
  between them would be plumbing for one string.

  `listening` is the important half. The Stack needs to know whether there is a
  voice at all, and it must not have to know WHY there might not be one —
  showLemon switched off, a route without the hero, the lemon removed some day.
  So the lemon registers itself on mount and the Stack reads the count. No
  config is duplicated, and the Stack's own readout comes back on its own the
  moment the lemon is not there.

  `spoken` carries WHO is speaking, which is not decoration. The four Stack
  groups run the same per-frame loop, so on any given frame one of them has the
  cursor and three do not: without an owner, the three would clear what the
  first just said and the bubble would never appear. Only the component that
  said something may take it back.

  It is a shallowRef, and that is not a micro-optimisation. A plain ref wraps
  whatever object it holds in a reactive proxy, so `spoken.value.by` would come
  back as a proxy of the caller's token rather than the token itself — and the
  ownership test is an identity test, which would then never match. The owner
  would never be able to take its own message back. Nothing here needs deep
  reactivity: the object is replaced whole, never mutated.
*/
const spoken = shallowRef(null) // { by, text } or null
const message = computed(() => spoken.value?.text ?? '')
const listening = shallowRef(0)

export function useLemonVoice() {
  // This caller's identity, for as long as the component lives.
  const me = {}

  // Show or replace what he says. Saying the same thing twice is a no-op, so a
  // component can call it on every frame without re-rendering anything.
  function say(text) {
    const next = text || ''
    if (spoken.value?.by === me && spoken.value.text === next) return
    spoken.value = next ? { by: me, text: next } : null
  }

  // Only the one who spoke may clear it.
  function hush() {
    if (spoken.value?.by === me) spoken.value = null
  }

  // Called by the lemon. Returns its own cleanup, so unmounting takes the voice
  // away with it.
  function listen() {
    listening.value += 1

    return () => {
      listening.value -= 1
      spoken.value = null
    }
  }

  return { message, listening, say, hush, listen }
}
