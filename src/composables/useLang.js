import { readonly, ref } from 'vue'

import { i18n, SUPPORTED_LOCALES } from '../i18n'

/*
  Site language: 'en' or 'es'.

  Same module-scope ref pattern as useTheme(): one shared source of truth for
  every component that asks for it.

  The first visit follows the browser, so a visitor whose browser asks for
  Spanish lands in Spanish and everyone else in English. From then on the saved
  choice wins, which is why the browser is consulted once and never again: after
  the first visit it is the toggle, not the machine, that decides. See
  docs/decisions.md 2.
*/

const STORAGE_KEY = 'krub-lang'
const DEFAULT_LANG = 'en'

/* The browser's own preference, read only when there is nothing saved. */
function detect() {
  const asked = navigator.languages?.length ? navigator.languages : [navigator.language]
  return asked.some((tag) => String(tag).toLowerCase().startsWith('es')) ? 'es' : DEFAULT_LANG
}

const lang = ref(DEFAULT_LANG)

function readStored() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return SUPPORTED_LOCALES.includes(saved) ? saved : null
  } catch {
    return null
  }
}

/*
  Two things have to move together with the ref:
  - vue-i18n's locale, which is what every t() call reads;
  - <html lang>, which is what screen readers and search engines read. Getting
    this wrong makes a screen reader pronounce Spanish text with English rules.
*/
function apply(next) {
  i18n.global.locale.value = next
  document.documentElement.setAttribute('lang', next)
}

function persist(next) {
  try {
    localStorage.setItem(STORAGE_KEY, next)
  } catch {
    // Ignore: works for this visit, just not remembered.
  }
}

function set(next) {
  lang.value = SUPPORTED_LOCALES.includes(next) ? next : DEFAULT_LANG
  apply(lang.value)
  persist(lang.value)
}

/** Called once from main.js, before the app mounts. */
export function initLang() {
  lang.value = readStored() ?? detect()
  apply(lang.value)
}

export function useLang() {
  return {
    lang: readonly(lang),
    toggle: () => set(lang.value === 'en' ? 'es' : 'en'),
    set,
  }
}
