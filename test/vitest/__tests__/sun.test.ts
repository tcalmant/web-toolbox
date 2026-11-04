/**
 * Copyright (c) 2026 Thomas Calmant
 * All rights reserved.
 *
 * Tests for domain/sun.ts
 */

import { describe, expect, it } from 'vitest'

import { roundToMinute, type SunCrossing, sunTimes } from '../../../src/domain/sun'

// Expected "ISO ISO" instants (morning, evening) or the polar state
function expectCrossing(c: SunCrossing, expected: string) {
  if (c.kind !== 'crossing') {
    expect(c.kind).toEqual(expected)
    return
  }
  const [rise, set] = expected.split(' ').map((s) => Date.parse(s))
  // USNO rounds to the minute, NOAA claims one minute of accuracy
  expect(Math.abs(c.rise.getTime() - rise!) / 60000).toBeLessThanOrEqual(1.5)
  expect(Math.abs(c.set.getTime() - set!) / 60000).toBeLessThanOrEqual(1.5)
}

describe('sunTimes', () => {
  // Reference: US Naval Observatory, Astronomical Applications API
  // (aa.usno.navy.mil/api/rstt/oneday, tz=0), queried on 2026-11-04; events
  // on another UTC date come from the query of that date
  it.each([
    [
      'LFPN',
      '2026-11-04T18:30Z',
      48.749722,
      2.111111,
      '2026-11-04T06:43Z 2026-11-04T16:27Z',
      '2026-11-04T06:09Z 2026-11-04T17:00Z',
    ],
    // Any instant of the UTC date gives the same solar day
    [
      'LFPN',
      '2026-11-04T00:00Z',
      48.749722,
      2.111111,
      '2026-11-04T06:43Z 2026-11-04T16:27Z',
      '2026-11-04T06:09Z 2026-11-04T17:00Z',
    ],
    [
      'LFPN',
      '2026-11-04T23:59Z',
      48.749722,
      2.111111,
      '2026-11-04T06:43Z 2026-11-04T16:27Z',
      '2026-11-04T06:09Z 2026-11-04T17:00Z',
    ],
    [
      'LFRB',
      '2026-06-21T18:30Z',
      48.446944,
      -4.421667,
      '2026-06-21T04:16Z 2026-06-21T20:23Z',
      '2026-06-21T03:34Z 2026-06-21T21:05Z',
    ],
    [
      'LFBO',
      '2026-12-21T18:30Z',
      43.635,
      1.367778,
      '2026-12-21T07:25Z 2026-12-21T16:21Z',
      '2026-12-21T06:52Z 2026-12-21T16:53Z',
    ],
    [
      'LFMN',
      '2026-03-20T18:30Z',
      43.665278,
      7.214722,
      '2026-03-20T05:35Z 2026-03-20T17:43Z',
      '2026-03-20T05:06Z 2026-03-20T18:12Z',
    ],
    [
      'FMEE',
      '2026-07-01T18:30Z',
      -20.889722,
      55.516111,
      '2026-07-01T02:55Z 2026-07-01T13:48Z',
      '2026-07-01T02:31Z 2026-07-01T14:12Z',
    ],
    // Morning events on the previous UTC date
    [
      'NWWW',
      '2026-12-21T18:30Z',
      -22.014444,
      166.213056,
      '2026-12-20T18:08Z 2026-12-21T07:38Z',
      '2026-12-20T17:43Z 2026-12-21T08:02Z',
    ],
    // Evening events on the next UTC date
    [
      'NTAA',
      '2026-12-21T18:30Z',
      -17.556667,
      -149.611389,
      '2026-12-21T15:21Z 2026-12-22T04:32Z',
      '2026-12-21T14:57Z 2026-12-22T04:56Z',
    ],
    [
      'Tromso',
      '2026-12-21T18:30Z',
      69.68,
      18.92,
      'alwaysBelow',
      '2026-12-21T08:32Z 2026-12-21T12:53Z',
    ],
    ['ENSB', '2026-12-21T18:30Z', 78.246, 15.466, 'alwaysBelow', 'alwaysBelow'],
    ['ENSB', '2026-06-21T18:30Z', 78.246, 15.466, 'alwaysAbove', 'alwaysAbove'],
  ])('%s at %s', (_name, instant, lat, lon, sun, civil) => {
    const times = sunTimes(lat, lon, new Date(instant))
    expectCrossing(times.sun, sun)
    expectCrossing(times.civil, civil)
  })
})

describe('roundToMinute', () => {
  it.each([
    ['2026-11-04T06:09:50Z', 'up', '2026-11-04T06:10:00Z'],
    ['2026-11-04T06:09:00Z', 'up', '2026-11-04T06:09:00Z'],
    ['2026-11-04T16:59:50Z', 'down', '2026-11-04T16:59:00Z'],
    ['2026-11-04T06:43:29Z', 'nearest', '2026-11-04T06:43:00Z'],
    ['2026-11-04T06:43:30Z', 'nearest', '2026-11-04T06:44:00Z'],
    ['2026-11-04T23:59:30Z', 'up', '2026-11-05T00:00:00Z'],
  ] as const)('%s %s', (at, mode, expected) => {
    expect(roundToMinute(new Date(at), mode).toISOString()).toEqual(
      new Date(expected).toISOString(),
    )
  })
})
