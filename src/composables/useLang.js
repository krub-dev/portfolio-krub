import { readonly, ref } from 'vue'

import { i18n, SUPPORTED_LOCALES } from '../i18n'

/*
  Site language: 'en' (the default) or 'es'.

  Same module-scope ref pattern as useTheme(): one shared source of truth for
  every component that asks for it.

  English is the default on purpose — see docs/decisions.md. There is no
  browser-language detection: a saved choice wins, otherwise English, so what a
  first-time visitor sees does not depend on their machine.
*/

const STORAGE_KEY = 'krub-lang'
const DEFAULT_LANG = 'en'

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
  lang.value = readStored() ?? DEFAULT_LANG
  apply(lang.value)
}

export function useLang() {
  return {
    lang: readonly(lang),
    toggle: () => set(lang.value === 'en' ? 'es' : 'en'),
    set,
  }
}
