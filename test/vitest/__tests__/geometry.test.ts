/**
 * Copyright (c) 2026 Thomas Calmant
 * All rights reserved.
 *
 * Tests for domain/geometry.ts
 */

import { describe, expect, it } from 'vitest'

import {
  arcPoints,
  bearingDegrees,
  destinationPoint,
  geoPointsEqual,
  haversineDistanceMeters,
} from '../../../src/domain/geo'
import { Circle, Line, Polygon, Position } from '../../../src/domain/geometry'

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

describe('Circle', () => {
  it('stores its center and radius', () => {
    const circle = new Circle({ lat: 45, lng: 5 }, 1852)
    expect(circle.center).toEqual({ lat: 45, lng: 5 })
    expect(circle.radiusMeters).toEqual(1852)
  })
})

describe('arcPoints', () => {
  const center = { lat: 45, lng: 5 }

  it('round-trips bearing and distance', () => {
    const p = destinationPoint(center, 90, 10000)
    expect(bearingDegrees(center, p)).toBeCloseTo(90, 1)
    expect(haversineDistanceMeters(center, p)).toBeCloseTo(10000, 0)
  })

  it('stays on the circle and covers a quarter turn clockwise', () => {
    const start = destinationPoint(center, 0, 20000)
    const end = destinationPoint(center, 90, 20000)
    const points = arcPoints(center, start, end, true)
    expect(points.length).toBeGreaterThanOrEqual(10)
    for (const p of points) {
      expect(haversineDistanceMeters(center, p)).toBeCloseTo(20000, -1)
      const b = bearingDegrees(center, p)
      expect(b).toBeGreaterThan(0)
      expect(b).toBeLessThan(90)
    }
  })

  it('goes the long way when counter-clockwise', () => {
    const start = destinationPoint(center, 0, 20000)
    const end = destinationPoint(center, 90, 20000)
    const points = arcPoints(center, start, end, false)
    expect(points.some((p) => bearingDegrees(center, p) > 200)).toBe(true)
  })

  it('gives a full turn for coinciding endpoints', () => {
    const start = destinationPoint(center, 0, 20000)
    expect(arcPoints(center, start, start, true).length).toBeGreaterThan(60)
  })
})
