/**
 * Copyright (c) 2026 Thomas Calmant
 * All rights reserved.
 *
 * Tests for domain/aip.ts
 */

import { describe, expect, it } from 'vitest'

import { AIP } from '../../../src/domain/aip'
import { Circle, Line, Polygon, Position } from '../../../src/domain/geometry'

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

  it('parses a circle around a center', () => {
    const aip = new AIP("Zone: cercle de 3 NM de rayon centré sur 45°30'N 005°45'E.")
    expect(aip.polygons.length).toEqual(1)
    const circle = aip.polygons[0] as Circle
    expect(circle).toBeInstanceOf(Circle)
    expect(circle.radiusMeters).toBeCloseTo(3 * 1852)
    expect(circle.center.lat).toBeCloseTo(45.5)
    expect(circle.center.lng).toBeCloseTo(5.75)
  })

  it('expands an arc into a polygon outline without the center point', () => {
    const aip = new AIP(
      "45°00'N 005°00'E-45°00'N 005°20'E-arc de cercle de 10 NM de rayon centré sur 45°00'N 005°10'E dans le sens horaire-45°10'N 005°10'E",
    )
    expect(aip.polygons.length).toEqual(1)
    const polygon = aip.polygons[0] as Polygon
    expect(polygon).toBeInstanceOf(Polygon)
    // 3 corners + intermediate arc points, and no vertex at the center
    expect(polygon.locations.length).toBeGreaterThan(10)
    expect(
      polygon.locations.some((p) => Math.abs(p.lat - 45) < 1e-3 && Math.abs(p.lng - 5.1667) < 1e-3),
    ).toBe(false)
  })

  it('keeps an outline in one piece across a border stretch', () => {
    const aip = new AIP(`43°29'00'' N,001°08'00'' W
43°13'00'' N,001°13'43'' W
43°03'17'' N,001°15'02'' W
frontière franco-espagnole
43°13'46'' N,001°23'20'' W

LIMITES VERTICALES`)
    expect(aip.polygons.length).toEqual(1)
    expect((aip.polygons[0] as Polygon).locations.length).toEqual(4)
  })

  it('keeps an outline in one piece across a multi-line coast stretch', () => {
    const aip = new AIP(`44°58'05'' N,001°31'31'' W
44°28'32'' N,001°32'57'' W
limite des eaux territoriales
atlantique françaises
44°23'19'' N,001°33'45'' W
44°58'05'' N,001°31'31'' W`)
    expect(aip.polygons.length).toEqual(1)
    expect((aip.polygons[0] as Polygon).locations.length).toEqual(4)
  })

  it('still splits shapes on unrelated text', () => {
    const aip = new AIP(`43°29'00'' N,001°08'00'' W
43°13'00'' N,001°13'43'' W
LIMITES LATÉRALES
43°03'17'' N,001°15'02'' W
43°13'46'' N,001°23'20'' W`)
    expect(aip.polygons.length).toEqual(2)
  })

  it('parses "arc horaire" and "arc anti-horaire" wordings with the center on the next line', () => {
    const text = (dir: string) => `43°47'20.62'' N,006°58'01.12'' E
43°49'27.47'' N,006°29'32.42'' E
43°43'41'' N,006°40'11'' E
43°41'55.42'' N,007°02'27.40'' E
arc ${dir} de 5 nm de rayon centré
sur 043°46'32'' N,007°04'53'' E
43°47'20.62'' N,006°58'01.12'' E`
    const clockwise = new AIP(text('horaire'))
    const counter = new AIP(text('anti-horaire'))
    expect(clockwise.polygons.length).toEqual(1)
    expect(counter.polygons.length).toEqual(1)
    const cw = (clockwise.polygons[0] as Polygon).locations.length
    const ccw = (counter.polygons[0] as Polygon).locations.length
    // Both are arcs, going opposite ways around the center: different sweeps
    expect(cw).toBeGreaterThan(7)
    expect(ccw).toBeGreaterThan(7)
    expect(cw).not.toEqual(ccw)
  })
})
