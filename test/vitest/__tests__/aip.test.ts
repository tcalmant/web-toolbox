/**
 * Copyright (c) 2026 Thomas Calmant
 * All rights reserved.
 *
 * Tests for domain/aip.ts
 */

import { describe, expect, it } from 'vitest'

import { AIP } from '../../../src/domain/aip'
import { Line, Polygon, Position } from '../../../src/domain/geometry'

describe('AIP location parsing', () => {
  it('parses degrees-only coordinates', () => {
    const aip = new AIP('Reference point 45°N 005°E on the chart.')
    expect(aip.polygons.length).toEqual(1)
    expect(aip.polygons[0]).toBeInstanceOf(Position)
    const position = aip.polygons[0] as Position
    expect(position.location.lat).toBeCloseTo(45)
    expect(position.location.lng).toBeCloseTo(5)
  })

  it('parses degrees and minutes', () => {
    const aip = new AIP("Reference point 45°30'N, 005°45'E on the chart.")
    expect(aip.polygons.length).toEqual(1)
    const position = aip.polygons[0] as Position
    expect(position.location.lat).toBeCloseTo(45.5)
    expect(position.location.lng).toBeCloseTo(5.75)
  })

  it('parses degrees, minutes and seconds', () => {
    const aip = new AIP('Reference point 45°30\'30"N, 005°45\'45"E on the chart.')
    expect(aip.polygons.length).toEqual(1)
    const position = aip.polygons[0] as Position
    expect(position.location.lat).toBeCloseTo(45.508, 3)
    expect(position.location.lng).toBeCloseTo(5.7625, 3)
  })

  it('returns an empty list when there is no AIP-formatted location', () => {
    const aip = new AIP('No coordinates in this text.')
    expect(aip.polygons).toEqual([])
  })

  it('returns an empty list for undefined text', () => {
    const aip = new AIP('')
    expect(aip.findAIPPolygons(undefined)).toEqual([])
  })

  it('treats an isolated point as a single Position', () => {
    const aip = new AIP("Located near 45°30'N005°45'E in the valley.")
    expect(aip.polygons.length).toEqual(1)
    expect(aip.polygons[0]).toBeInstanceOf(Position)
  })

  it('groups two dash-separated points into a Line', () => {
    const aip = new AIP("45°30'N005°45'E-46°00'N006°00'E")
    expect(aip.polygons.length).toEqual(1)
    expect(aip.polygons[0]).toBeInstanceOf(Line)
    const line = aip.polygons[0] as Line
    expect(line.locations.length).toEqual(2)
    expect(line.locations[0]!.lat).toBeCloseTo(45.5)
    expect(line.locations[0]!.lng).toBeCloseTo(5.75)
    expect(line.locations[1]!.lat).toBeCloseTo(46)
    expect(line.locations[1]!.lng).toBeCloseTo(6)
  })

  it('groups 3+ dash-separated points into a Polygon', () => {
    const aip = new AIP("45°30'N005°45'E-46°00'N006°00'E-46°30'N006°30'E")
    expect(aip.polygons.length).toEqual(1)
    expect(aip.polygons[0]).toBeInstanceOf(Polygon)
    const polygon = aip.polygons[0] as Polygon
    expect(polygon.locations.length).toEqual(3)
    expect(polygon.locations[2]!.lat).toBeCloseTo(46.5)
    expect(polygon.locations[2]!.lng).toBeCloseTo(6.5)
  })

  it('applies the sign of S latitudes and W longitudes', () => {
    const aip = new AIP("Point 45°30'S, 005°45'W here")
    const position = aip.polygons[0] as Position
    expect(position.location.lat).toBeCloseTo(-45.5)
    expect(position.location.lng).toBeCloseTo(-5.75)
  })

  it('keeps the decimals of the seconds', () => {
    const aip = new AIP('Point 45°30\'30.6"N, 005°45\'45.9"E here')
    const position = aip.polygons[0] as Position
    expect(position.location.lat).toBeCloseTo(45 + 30 / 60 + 30.6 / 3600, 6)
    expect(position.location.lng).toBeCloseTo(5 + 45 / 60 + 45.9 / 3600, 6)
  })

  it('splits points separated by a single non-space character', () => {
    // The character right before the second point used to be ignored
    const aip = new AIP("45°30'N005°45'E/46°00'N006°00'E")
    expect(aip.polygons.length).toEqual(2)
    expect(aip.polygons[0]).toBeInstanceOf(Position)
    expect(aip.polygons[1]).toBeInstanceOf(Position)
  })
})
