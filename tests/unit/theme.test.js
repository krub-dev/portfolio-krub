import { beforeEach, describe, expect, it, vi } from 'vitest'

/*
  useTheme and useLang keep their state in module scope, on purpose — that is
  what makes every caller share one source of truth. It also means a plain
  import would carry state from one test into the next, so each test resets the
  module registry and imports a fresh copy.
*/
async function freshTheme() {
  vi.resetModules()
  return import('../../src/composables/useTheme')
}

beforeEach(() => {
  localStorage.clear()
  document.documentElement.removeAttribute('data-theme')
})

describe('useTheme', () => {
  it('starts dark, which is the absence of the attribute', async () => {
    const { initTheme, useTheme } = await freshTheme()
    initTheme()
    expect(useTheme().theme.value).toBe('dark')
    expect(document.documentElement.hasAttribute('data-theme')).toBe(false)
  })

  it('restores a saved light preference', async () => {
    localStorage.setItem('krub-theme', 'light')
    const { initTheme, useTheme } = await freshTheme()
    initTheme()
    expect(useTheme().theme.value).toBe('light')
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
  })

  it('ignores a stored value that is not a theme', async () => {
    localStorage.setItem('krub-theme', 'banana')
    const { initTheme, useTheme } = await freshTheme()
    initTheme()
    expect(useTheme().theme.value).toBe('dark')
  })

  it('toggles, writes the attribute, and persists the choice', async () => {
    const { initTheme, useTheme } = await freshTheme()
    initTheme()
    const { theme, toggle } = useTheme()

    toggle()
    expect(theme.value).toBe('light')
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
    expect(localStorage.getItem('krub-theme')).toBe('light')

    toggle()
    expect(theme.value).toBe('dark')
    expect(document.documentElement.hasAttribute('data-theme')).toBe(false)
    expect(localStorage.getItem('krub-theme')).toBe('dark')
  })

  it('every caller shares the same state', async () => {
    const { initTheme, useTheme } = await freshTheme()
    initTheme()
    const navbar = useTheme()
    const preview = useTheme()

    navbar.toggle()
    expect(preview.theme.value).toBe('light')
  })

  it('still works when localStorage throws, as in a locked-down browser', async () => {
    const getItem = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError')
    })
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('SecurityError')
    })

    const { initTheme, useTheme } = await freshTheme()
    expect(() => initTheme()).not.toThrow()
    const { theme, toggle } = useTheme()
    expect(() => toggle()).not.toThrow()
    // The choice applies for this visit; it just is not remembered.
    expect(theme.value).toBe('light')
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')

    getItem.mockRestore()
    setItem.mockRestore()
  })
})
