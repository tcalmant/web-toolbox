/**
 * Copyright (c) 2026 Thomas Calmant
 * All rights reserved.
 *
 * Tests for domain/borders.ts
 */

import { describe, expect, it } from 'vitest'

import type { BorderData } from '../../../src/domain/borders'
import { borderKeyFromText, borderPath } from '../../../src/domain/borders'

// A border going north along longitude 1, with a bend to the east
const chain: [number, number][] = [
  [43.0, 1.0],
  [43.1, 1.0],
  [43.2, 1.1],
  [43.3, 1.1],
  [43.4, 1.0],
]
const data: BorderData = {
  espagnole: [chain],
  monegasque: [chain],
  eaux_territoriales: [chain],
}

describe('borderKeyFromText', () => {
  it('finds a land border from its adjective', () => {
    expect(borderKeyFromText('frontière franco-espagnole', data)).toEqual('espagnole')
    expect(borderKeyFromText('Frontière franco-Espagnole', data)).toEqual('espagnole')
  })

  it('ignores accents in the country name', () => {
    expect(borderKeyFromText('frontière franco-monégasque', data)).toEqual('monegasque')
  })

  it('finds the territorial waters limit, even over two lines', () => {
    expect(borderKeyFromText('limite des eaux territoriales\natlantique françaises', data)).toEqual(
      'eaux_territoriales',
    )
  })

  it('returns null for unknown borders and other texts', () => {
    expect(borderKeyFromText('frontière franco-martienne', data)).toBeNull()
    expect(borderKeyFromText('côte', data)).toBeNull()
    expect(borderKeyFromText('LIMITES LATÉRALES', data)).toBeNull()
  })
})

describe('borderPath', () => {
  it('returns the vertices between two points, in order', () => {
    const path = borderPath([chain], { lat: 43.05, lng: 1.0 }, { lat: 43.35, lng: 1.05 })
    expect(path).toEqual([
      { lat: 43.1, lng: 1.0 },
      { lat: 43.2, lng: 1.1 },
      { lat: 43.3, lng: 1.1 },
    ])
  })

  it('goes backwards when the end is before the start', () => {
    const path = borderPath([chain], { lat: 43.35, lng: 1.05 }, { lat: 43.05, lng: 1.0 })
    expect(path).toEqual([
      { lat: 43.3, lng: 1.1 },
      { lat: 43.2, lng: 1.1 },
      { lat: 43.1, lng: 1.0 },
    ])
  })

  it('returns an empty path for two points on the same segment', () => {
    expect(borderPath([chain], { lat: 43.02, lng: 1.0 }, { lat: 43.08, lng: 1.0 })).toEqual([])
  })

  it('picks the chain the points lie on', () => {
    const other: [number, number][] = [
      [47.0, 5.0],
      [47.1, 5.0],
      [47.2, 5.1],
    ]
    const path = borderPath([chain, other], { lat: 47.02, lng: 5.0 }, { lat: 47.15, lng: 5.05 })
    expect(path).toEqual([{ lat: 47.1, lng: 5.0 }])
  })

  it('gives up when the points are far from the border', () => {
    expect(borderPath([chain], { lat: 46, lng: 3 }, { lat: 46.5, lng: 3 })).toBeNull()
  })
})
