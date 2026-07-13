/**
 * Copyright (c) 2026 Thomas Calmant
 * All rights reserved.
 *
 * Tests for domain/geometry.ts
 */

import { describe, expect, it } from 'vitest'

import { geoPointsEqual } from '../../../src/domain/geo'
import { Line, Polygon, Position } from '../../../src/domain/geometry'

describe('Position', () => {
  it('stores its kind, location and optional category', () => {
    const location = { lat: 45.2, lng: 5.8 }
    const position = new Position('POINT', location, 'obstacle')
    expect(position.kind).toEqual('POINT')
    expect(position.location).toEqual(location)
    expect(position.category).toEqual('obstacle')
  })

  it('defaults category to undefined', () => {
    const position = new Position('AREA', { lat: 0, lng: 0 })
    expect(position.category).toBeUndefined()
  })
})

describe('Line', () => {
  it('stores its list of locations', () => {
    const locations = [
      { lat: 45, lng: 5 },
      { lat: 46, lng: 6 },
    ]
    const line = new Line(locations)
    expect(line.locations).toEqual(locations)
  })

  it('accepts an empty list of locations', () => {
    const line = new Line([])
    expect(line.locations).toEqual([])
  })
})

describe('Polygon', () => {
  it('stores its list of locations', () => {
    const locations = [
      { lat: 45, lng: 5 },
      { lat: 46, lng: 6 },
      { lat: 47, lng: 7 },
    ]
    const polygon = new Polygon(locations)
    expect(polygon.locations).toEqual(locations)
  })
})

describe('geoPointsEqual', () => {
  it('considers identical points equal', () => {
    expect(geoPointsEqual({ lat: 45.123, lng: 5.456 }, { lat: 45.123, lng: 5.456 })).toBe(true)
  })

  it('considers points within epsilon equal', () => {
    expect(geoPointsEqual({ lat: 45.123, lng: 5.456 }, { lat: 45.1230001, lng: 5.4560001 })).toBe(
      true,
    )
  })

  it('considers distant points different', () => {
    expect(geoPointsEqual({ lat: 45.123, lng: 5.456 }, { lat: 45.2, lng: 5.456 })).toBe(false)
  })
})
