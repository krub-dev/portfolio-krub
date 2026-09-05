import { describe, expect, it } from 'vitest'

import { formatPeriod, wrapIndex } from '../../src/utils/format'

describe('formatPeriod', () => {
  it('uses the "now" label when the period is still open', () => {
    expect(formatPeriod({ from: '2024', to: null }, 'now')).toBe('2024 — now')
    expect(formatPeriod({ from: '2024', to: null }, 'hoy')).toBe('2024 — hoy')
  })

  it('prints a closed range with both years', () => {
    expect(formatPeriod({ from: '2018', to: '2024' }, 'now')).toBe('2018 — 2024')
  })

  it('prints a single year once, not as a range', () => {
    expect(formatPeriod({ from: '2025', to: '2025' }, 'now')).toBe('2025')
  })

  it('treats a missing `to` the same as an explicit null', () => {
    expect(formatPeriod({ from: '2026' }, 'now')).toBe('2026 — now')
  })
})

describe('wrapIndex', () => {
  it('moves forward and wraps past the end', () => {
    expect(wrapIndex(0, 1, 4)).toBe(1)
    expect(wrapIndex(3, 1, 4)).toBe(0)
  })

  it('moves backward and wraps past the start', () => {
    // The bug this guards: -1 % 4 is -1 in JavaScript, not 3.
    expect(wrapIndex(0, -1, 4)).toBe(3)
  })

  it('survives a step larger than the list in either direction', () => {
    expect(wrapIndex(0, -9, 4)).toBe(3)
    expect(wrapIndex(0, 10, 4)).toBe(2)
  })

  it('does not divide by zero on an empty list', () => {
    expect(wrapIndex(0, 1, 0)).toBe(0)
  })
})
