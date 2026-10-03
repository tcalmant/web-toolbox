/**
 * Copyright (c) 2026 Thomas Calmant
 * All rights reserved.
 *
 * Tests for domain/time.ts
 * Tests for domain/wind.ts
 */

import { describe, expect, it } from 'vitest'

import {
  densityAltitude,
  parseRunwayHeading,
  pressureAltitudeFt,
  reciprocalHeading,
  windComponents,
} from '../../../src/domain/wind'

describe('windComponents', () => {
  it('gives a pure headwind straight down the runway', () => {
    const w = windComponents(220, 220, 20)
    expect(w.headwind).toBeCloseTo(20)
    expect(w.crosswind).toBe(0)
    expect(w.crosswindSide).toBe('none')
  })

  it('gives a pure tailwind from behind', () => {
    const w = windComponents(220, 40, 10)
    expect(w.headwind).toBeCloseTo(-10)
    expect(w.crosswind).toBeCloseTo(0, 6)
  })

  it('gives a pure crosswind at 90 degrees, with its side', () => {
    const right = windComponents(220, 310, 15)
    expect(right.headwind).toBe(0)
    expect(right.crosswind).toBeCloseTo(15)
    expect(right.crosswindSide).toBe('right')
    const left = windComponents(220, 130, 15)
    expect(left.crosswindSide).toBe('left')
  })

  it('computes the 30 degree case (cos 30 and sin 30)', () => {
    const w = windComponents(220, 250, 20)
    expect(w.headwind).toBeCloseTo(17.32, 2)
    expect(w.crosswind).toBeCloseTo(10, 6)
    expect(w.crosswindSide).toBe('right')
  })

  it('wraps around north', () => {
    const w = windComponents(350, 20, 10)
    // 30 degrees to the right of the runway heading
    expect(w.crosswindSide).toBe('right')
    expect(w.crosswind).toBeCloseTo(5, 6)
  })
})

describe('parseRunwayHeading', () => {
  it('parses designators with and without side', () => {
    expect(parseRunwayHeading('22')).toBe(220)
    expect(parseRunwayHeading('04R')).toBe(40)
    expect(parseRunwayHeading('4l')).toBe(40)
    expect(parseRunwayHeading('36')).toBe(0)
  })

  it('parses a 3 digit heading', () => {
    expect(parseRunwayHeading('215')).toBe(215)
    expect(parseRunwayHeading('360')).toBe(0)
  })

  it('rejects anything else', () => {
    for (const bad of ['', '0', '37', '361', 'ab', '22X', '2200']) {
      expect(parseRunwayHeading(bad), bad).toBeNull()
    }
  })
})

describe('reciprocalHeading', () => {
  it('returns the opposite runway end', () => {
    expect(reciprocalHeading(220)).toBe(40)
    expect(reciprocalHeading(40)).toBe(220)
    expect(reciprocalHeading(0)).toBe(180)
  })
})

describe('pressure and density altitude', () => {
  it('is zero for the standard atmosphere at sea level', () => {
    const da = densityAltitude(0, 1013.25, 15)
    expect(da.pressureAltitudeFt).toBeCloseTo(0, 1)
    expect(da.densityAltitudeFt).toBeCloseTo(0, 0)
  })

  it('raises the pressure altitude when the QNH is low', () => {
    // About 27 ft per hPa
    expect(pressureAltitudeFt(0, 1003.25)).toBeGreaterThan(250)
    expect(pressureAltitudeFt(0, 1003.25)).toBeLessThan(300)
  })

  it('adds 120 ft per degree above ISA', () => {
    const da = densityAltitude(5000, 1013.25, 25)
    expect(da.pressureAltitudeFt).toBeCloseTo(5000, -1)
    expect(da.isaTemperatureC).toBeCloseTo(5.1, 0)
    expect(da.densityAltitudeFt).toBeCloseTo(5000 + 120 * (25 - da.isaTemperatureC), -1)
  })
})
