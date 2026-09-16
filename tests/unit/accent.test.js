import { beforeEach, describe, expect, it, vi } from 'vitest'

/*
  useAccent keeps its state in module scope, like useTheme and useLang, so a
  plain import would carry state between tests. Each test resets the module
  registry and imports a fresh copy.
*/
async function freshAccent() {
  vi.resetModules()
  return import('../../src/composables/useAccent')
}

beforeEach(() => {
  localStorage.clear()
  document.documentElement.removeAttribute('data-accent')
})

describe('useAccent', () => {
  it('starts yellow, which is the default', async () => {
    const { initAccent, useAccent } = await freshAccent()
    initAccent()
    expect(useAccent().accent.value).toBe('yellow')
    expect(document.documentElement.getAttribute('data-accent')).toBe('yellow')
  })

  it('restores a saved palette', async () => {
    localStorage.setItem('krub-accent', 'aqua')
    const { initAccent, useAccent } = await freshAccent()
    initAccent()
    expect(useAccent().accent.value).toBe('aqua')
    expect(document.documentElement.getAttribute('data-accent')).toBe('aqua')
  })

  it('ignores a stored value that is not a palette', async () => {
    localStorage.setItem('krub-accent', 'banana')
    const { initAccent, useAccent } = await freshAccent()
    initAccent()
    expect(useAccent().accent.value).toBe('yellow')
  })

  it('sets a palette, writes the attribute, and persists it', async () => {
    const { initAccent, useAccent } = await freshAccent()
    initAccent()
    const { accent, set } = useAccent()

    set('pink')
    expect(accent.value).toBe('pink')
    expect(document.documentElement.getAttribute('data-accent')).toBe('pink')
    expect(localStorage.getItem('krub-accent')).toBe('pink')

    // Junk falls back to the default rather than writing it through.
    set('banana')
    expect(accent.value).toBe('yellow')
    expect(document.documentElement.getAttribute('data-accent')).toBe('yellow')
  })

  it('every caller shares the same state', async () => {
    const { initAccent, useAccent } = await freshAccent()
    initAccent()
    const rail = useAccent()
    const menu = useAccent()

    rail.set('mint')
    expect(menu.accent.value).toBe('mint')
  })

  it('cycles to the next palette and wraps at the end', async () => {
    const { initAccent, useAccent } = await freshAccent()
    initAccent()
    const { accent, cycle } = useAccent()

    cycle()
    expect(accent.value).toBe('aqua')

    cycle()
    cycle()
    cycle()
    expect(accent.value).toBe('pink')

    // The list is yellow, aqua, rose, mint, pink — so one more wraps to yellow.
    cycle()
    expect(accent.value).toBe('yellow')
    expect(document.documentElement.getAttribute('data-accent')).toBe('yellow')
  })

  it('still works when localStorage throws, as in a locked-down browser', async () => {
    const getItem = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError')
    })
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('SecurityError')
    })

    const { initAccent, useAccent } = await freshAccent()
    expect(() => initAccent()).not.toThrow()
    const { accent, set } = useAccent()
    expect(() => set('aqua')).not.toThrow()
    // The choice applies for this visit; it just is not remembered.
    expect(accent.value).toBe('aqua')
    expect(document.documentElement.getAttribute('data-accent')).toBe('aqua')

    getItem.mockRestore()
    setItem.mockRestore()
  })
})
