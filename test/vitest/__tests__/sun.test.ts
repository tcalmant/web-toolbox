/**
 * Copyright (c) 2026 Thomas Calmant
 * All rights reserved.
 *
 * Tests for domain/sun.ts
 */

import { describe, expect, it } from 'vitest'

import { type SunCrossing, sunTimes } from '../../../src/domain/sun'

// Expected "HH:MM HH:MM" (morning, evening) or the polar state
function expectCrossing(c: SunCrossing, expected: string) {
  if (c.kind !== 'crossing') {
    expect(c.kind).toEqual(expected)
    return
  }
  const [rise, set] = expected
    .split(' ')
    .map((s) => Number(s.slice(0, 2)) * 60 + Number(s.slice(3)))
  const minutes = (d: Date) =>
    (d.getTime() - Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())) / 60000
  // USNO rounds to the minute, NOAA claims one minute of accuracy
  expect(Math.abs(minutes(c.rise) - rise!)).toBeLessThanOrEqual(1.5)
  expect(Math.abs(minutes(c.set) - set!)).toBeLessThanOrEqual(1.5)
}

describe('sunTimes', () => {
  // Reference: US Naval Observatory, Astronomical Applications API
  // (aa.usno.navy.mil/api/rstt/oneday, tz=0), queried on 2026-11-04
  it.each([
    ['LFPN', 48.749722, 2.111111, '2026-11-04', '06:43 16:27', '06:09 17:00'],
    ['LFRB', 48.446944, -4.421667, '2026-06-21', '04:16 20:23', '03:34 21:05'],
    ['LFBO', 43.635, 1.367778, '2026-12-21', '07:25 16:21', '06:52 16:53'],
    ['LFMN', 43.665278, 7.214722, '2026-03-20', '05:35 17:43', '05:06 18:12'],
    ['FMEE', -20.889722, 55.516111, '2026-07-01', '02:55 13:48', '02:31 14:12'],
    ['Tromso', 69.68, 18.92, '2026-12-21', 'alwaysBelow', '08:32 12:53'],
    ['ENSB', 78.246, 15.466, '2026-12-21', 'alwaysBelow', 'alwaysBelow'],
    ['ENSB', 78.246, 15.466, '2026-06-21', 'alwaysAbove', 'alwaysAbove'],
  ])('%s on %s', (_name, lat, lon, day, sun, civil) => {
    // Any instant of the UTC date gives the same day
    const times = sunTimes(lat, lon, new Date(`${day}T18:30:00Z`))
    expectCrossing(times.sun, sun)
    expectCrossing(times.civil, civil)
  })
})
