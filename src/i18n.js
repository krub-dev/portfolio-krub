import { createI18n } from 'vue-i18n'

import en from './locales/en.json'
import es from './locales/es.json'

export const SUPPORTED_LOCALES = ['en', 'es']

/*
  legacy: false puts vue-i18n in Composition API mode, which is what lets a
  component do `const { t } = useI18n()` inside <script setup>.

  The dictionaries are nested objects rather than flat "hero.badge" keys,
  because that is the shape vue-i18n resolves natively. Templates are unaffected:
  t('hero.badge') reads the same either way.

  Locale and fallback are both English. useLang() overwrites the locale on
  startup if there is a saved choice; the fallback stays English so a key that
  only exists in one dictionary renders real text instead of its own name.
*/
export const i18n = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages: { en, es },
})

export default i18n
