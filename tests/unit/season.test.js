import { beforeEach, describe, expect, it, vi } from 'vitest'

/*
  useSeason is one computed over two module-scope refs, so the modules have to be
  reset between cases. Everything is imported after the reset, and the config is
  the very object useSeason reads, because a fresh import would otherwise hand
  back a different one and the mutation would be invisible to it.
*/
async function fresh() {
  vi.resetModules()
  const { config } = await import('../../src/data')
  const { useAccent } = await import('../../src/composables/useAccent')
  const { useSeason } = await import('../../src/composables/useSeason')
  return { config, useAccent, useSeason }
}

beforeEach(() => {
  localStorage.clear()
  document.documentElement.removeAttribute('data-accent')
})

describe('useSeason', () => {
  it('is on with the switch and the orange accent', async () => {
    const { useAccent, useSeason } = await fresh()
    useAccent().set('orange')
    expect(useSeason().season.value).toBe('halloween')
  })

  it('is off with any other accent', async () => {
    const { useAccent, useSeason } = await fresh()
    useAccent().set('yellow')
    expect(useSeason().season.value).toBe(null)
  })

  it('is off when the switch is off, even choosing orange', async () => {
    const { config, useAccent, useSeason } = await fresh()
    config.showHalloween = false
    useAccent().set('orange')
    expect(useSeason().season.value).toBe(null)
    // And back on the moment the switch is flipped again.
    config.showHalloween = true
    expect(useSeason().season.value).toBe('halloween')
  })
})
