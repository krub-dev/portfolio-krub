import { readonly, ref } from 'vue'

import { accents } from '../data/accents.js'

/*
  The accent palette: which colour paints --acc. Chosen independently of the
  light/dark theme, and written on <html> as data-accent.

  Same shape as useTheme() and useLang(), and for the same reason: the ref is at
  module scope so every caller shares one source of truth, and initAccent() runs
  from main.js before the app mounts — the inline script in index.html has
  already painted the right accent, so this only brings the ref into agreement
  with what is on screen.
*/

const STORAGE_KEY = 'krub-accent'
const DEFAULT_ACCENT = 'yellow'
const IDS = accents.map((accent) => accent.id)

const accent = ref(DEFAULT_ACCENT)

/** Reads the saved choice. Returns null when there isn't a valid one. */
function readStored() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return IDS.includes(saved) ? saved : null
  } catch {
    // Private browsing and blocked site data both throw here. Not being able to
    // remember the choice is not a reason to fail to render.
    return null
  }
}

/*
  The attribute is always written, yellow included. There is no
  [data-accent='yellow'] block on purpose: yellow is the :root default, and the
  switcher needs a value it can mark as selected.
*/
function apply(next) {
  document.documentElement.setAttribute('data-accent', next)
}

function persist(next) {
  try {
    localStorage.setItem(STORAGE_KEY, next)
  } catch {
    // Ignore: the accent still works for this visit, it just won't be remembered.
  }
}

function set(next) {
  accent.value = IDS.includes(next) ? next : DEFAULT_ACCENT
  apply(accent.value)
  persist(accent.value)
}

/*
  The switcher's button cycles rather than opening a panel: one press, the next
  palette. The list is short and ordered, so wrapping at the end is enough.
*/
function cycle() {
  const at = IDS.indexOf(accent.value)
  set(IDS[(at + 1) % IDS.length])
}

export function initAccent() {
  accent.value = readStored() ?? DEFAULT_ACCENT
  apply(accent.value)
}

export function useAccent() {
  return {
    // readonly so a component cannot assign to it and skip the side effects
    // (writing the attribute, saving the choice). Go through set() or cycle().
    accent: readonly(accent),
    set,
    cycle,
  }
}
