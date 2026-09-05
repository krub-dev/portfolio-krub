import { beforeEach, describe, expect, it, vi } from 'vitest'

async function freshLang() {
  vi.resetModules()
  return {
    lang: await import('../../src/composables/useLang'),
    i18n: (await import('../../src/i18n')).i18n,
  }
}

beforeEach(() => {
  localStorage.clear()
  document.documentElement.setAttribute('lang', 'en')
})

describe('useLang', () => {
  it('defaults to English rather than sniffing the browser', async () => {
    const { lang } = await freshLang()
    lang.initLang()
    expect(lang.useLang().lang.value).toBe('en')
    expect(document.documentElement.getAttribute('lang')).toBe('en')
  })

  it('restores a saved Spanish preference', async () => {
    localStorage.setItem('krub-lang', 'es')
    const { lang } = await freshLang()
    lang.initLang()
    expect(lang.useLang().lang.value).toBe('es')
    expect(document.documentElement.getAttribute('lang')).toBe('es')
  })

  it('ignores a stored value that is not a supported locale', async () => {
    localStorage.setItem('krub-lang', 'fr')
    const { lang } = await freshLang()
    lang.initLang()
    expect(lang.useLang().lang.value).toBe('en')
  })

  /*
    The one that matters most: <html lang> is what a screen reader uses to pick
    pronunciation rules. Spanish text read with English rules is unintelligible,
    and nothing on screen would reveal the bug.
  */
  it('moves vue-i18n and <html lang> together', async () => {
    const { lang, i18n } = await freshLang()
    lang.initLang()
    lang.useLang().toggle()

    expect(i18n.global.locale.value).toBe('es')
    expect(document.documentElement.getAttribute('lang')).toBe('es')
    expect(localStorage.getItem('krub-lang')).toBe('es')
  })

  it('actually returns Spanish strings after the toggle', async () => {
    const { lang, i18n } = await freshLang()
    lang.initLang()
    expect(i18n.global.t('tab.exp')).toBe('/experience')
    lang.useLang().toggle()
    expect(i18n.global.t('tab.exp')).toBe('/experiencia')
  })

  it('survives localStorage throwing', async () => {
    const spy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError')
    })
    const { lang } = await freshLang()
    expect(() => lang.initLang()).not.toThrow()
    expect(lang.useLang().lang.value).toBe('en')
    spy.mockRestore()
  })
})
