/**
 * Copyright (c) 2026 Thomas Calmant
 * All rights reserved.
 *
 * Tests for domain/time.ts
 * Tests for domain/timezones.ts
 */

import { describe, expect, it } from 'vitest'

import type { LocalStorage } from 'quasar'

import { TimezoneListLocalStorageStore } from '../../../src/adapters/storage/timezoneListLocalStorageStore'

import {
  dayShift,
  formatClock,
  formatDay,
  formatOffset,
  isValidTimeZone,
  parseDayAndTime,
  tzOffsetMinutes,
  zoneCity,
  zonedParts,
  zonedTimeToInstant,
} from '../../../src/domain/timezones'

const at = (iso: string) => new Date(iso)

describe('isValidTimeZone', () => {
  it('accepts IANA names and rejects garbage', () => {
    expect(isValidTimeZone('Europe/Paris')).toBe(true)
    expect(isValidTimeZone('UTC')).toBe(true)
    expect(isValidTimeZone('Mars/Olympus')).toBe(false)
    expect(isValidTimeZone('')).toBe(false)
  })
})

describe('tzOffsetMinutes / formatOffset', () => {
  it('follows daylight saving time', () => {
    expect(tzOffsetMinutes(at('2026-01-15T12:00:00Z'), 'Europe/Paris')).toBe(60)
    expect(tzOffsetMinutes(at('2026-07-15T12:00:00Z'), 'Europe/Paris')).toBe(120)
  })

  it('handles negative and half-hour offsets', () => {
    expect(formatOffset(at('2026-01-15T12:00:00Z'), 'America/New_York')).toBe('-05:00')
    expect(formatOffset(at('2026-01-15T12:00:00Z'), 'Asia/Kolkata')).toBe('+05:30')
    expect(formatOffset(at('2026-01-15T12:00:00Z'), 'UTC')).toBe('+00:00')
  })

  it('ignores milliseconds', () => {
    expect(tzOffsetMinutes(at('2026-07-15T12:00:00.999Z'), 'Europe/Paris')).toBe(120)
  })
})

describe('zonedParts / formatClock / formatDay', () => {
  it('renders midnight as 00, never 24', () => {
    expect(zonedParts(at('2026-01-15T23:00:00Z'), 'Europe/Paris').hour).toBe(0)
    expect(formatClock(at('2026-01-15T23:00:00Z'), 'Europe/Paris')).toBe('00:00')
  })

  it('formats clock and day in the given zone', () => {
    const d = at('2026-07-15T22:30:45Z')
    expect(formatClock(d, 'UTC', true)).toBe('22:30:45')
    expect(formatClock(d, 'Asia/Tokyo')).toBe('07:30')
    expect(formatDay(d, 'Asia/Tokyo')).toBe('2026-07-16')
  })
})

describe('zonedTimeToInstant', () => {
  const parts = (h: number, m: number, day = 15, month = 7) => ({
    year: 2026,
    month,
    day,
    hour: h,
    minute: m,
    second: 0,
  })

  it('converts a summer wall time in Paris to UTC', () => {
    expect(zonedTimeToInstant(parts(14, 30), 'Europe/Paris').toISOString()).toBe(
      '2026-07-15T12:30:00.000Z',
    )
  })

  it('converts a winter wall time in New York to UTC', () => {
    expect(zonedTimeToInstant(parts(8, 0, 15, 1), 'America/New_York').toISOString()).toBe(
      '2026-01-15T13:00:00.000Z',
    )
  })

  it('is the identity for UTC', () => {
    expect(zonedTimeToInstant(parts(9, 5), 'UTC').toISOString()).toBe('2026-07-15T09:05:00.000Z')
  })

  it('round-trips through zonedParts for every hour of a year in Paris', () => {
    for (let h = 0; h < 24 * 365; h += 7) {
      const instant = new Date(Date.UTC(2026, 0, 1) + h * 3600000)
      const back = zonedTimeToInstant(zonedParts(instant, 'Europe/Paris'), 'Europe/Paris')
      // Ambiguous autumn hour: either occurrence is acceptable, never a wrong wall time
      expect(formatClock(back, 'Europe/Paris', true)).toBe(
        formatClock(instant, 'Europe/Paris', true),
      )
    }
  })

  it('maps a time skipped by the spring DST change after the gap', () => {
    // 2026-03-29 02:30 does not exist in Paris (clocks jump from 02:00 to 03:00)
    const d = zonedTimeToInstant(parts(2, 30, 29, 3), 'Europe/Paris')
    expect(formatClock(d, 'Europe/Paris')).toBe('03:30')
  })

  it('maps an ambiguous autumn time to its first occurrence', () => {
    // 2026-10-25 02:30 happens twice in Paris: 00:30Z (CEST) then 01:30Z (CET)
    const d = zonedTimeToInstant(parts(2, 30, 25, 10), 'Europe/Paris')
    expect(d.toISOString()).toBe('2026-10-25T00:30:00.000Z')
  })
})

describe('dayShift', () => {
  it('flags the next and previous day relative to a reference zone', () => {
    const d = at('2026-07-15T22:30:00Z')
    expect(dayShift(d, 'Asia/Tokyo', 'UTC')).toBe(1)
    expect(dayShift(d, 'America/Los_Angeles', 'UTC')).toBe(0)
    expect(dayShift(at('2026-07-15T03:00:00Z'), 'America/Los_Angeles', 'UTC')).toBe(-1)
    expect(dayShift(d, 'UTC', 'UTC')).toBe(0)
  })

  it('works across a month and year boundary', () => {
    expect(dayShift(at('2025-12-31T23:30:00Z'), 'Asia/Tokyo', 'UTC')).toBe(1)
  })
})

describe('parseDayAndTime', () => {
  it('parses valid fields', () => {
    expect(parseDayAndTime('2026-07-15', '14:30')).toEqual({
      year: 2026,
      month: 7,
      day: 15,
      hour: 14,
      minute: 30,
      second: 0,
    })
    expect(parseDayAndTime('2026-07-15', '09:05:07')?.second).toBe(7)
  })

  it('rejects malformed or out of range input', () => {
    expect(parseDayAndTime('2026-02-30', '12:00')).toBeNull()
    expect(parseDayAndTime('2026-07-15', '24:00')).toBeNull()
    expect(parseDayAndTime('2026-07-15', '12:60')).toBeNull()
    expect(parseDayAndTime('15/07/2026', '12:00')).toBeNull()
    expect(parseDayAndTime('2026-07-15', '')).toBeNull()
  })
})

describe('zoneCity', () => {
  it('keeps the readable last segment', () => {
    expect(zoneCity('America/New_York')).toBe('New York')
    expect(zoneCity('America/Argentina/Buenos_Aires')).toBe('Buenos Aires')
    expect(zoneCity('UTC')).toBe('UTC')
  })
})

describe('TimezoneListLocalStorageStore', () => {
  function fakeStorage(getItem: () => unknown, setItem: () => void = () => {}): LocalStorage {
    return { getItem, setItem } as unknown as LocalStorage
  }

  it('returns null for missing, invalid or non-array data and a throwing storage', () => {
    for (const raw of [null, '', '{oops', '{"a":1}', '"str"', '42']) {
      expect(new TimezoneListLocalStorageStore(fakeStorage(() => raw)).load()).toBeNull()
    }
    const throwing = fakeStorage(() => {
      throw new Error('blocked')
    })
    expect(new TimezoneListLocalStorageStore(throwing).load()).toBeNull()
  })

  it('keeps only valid, distinct zone names', () => {
    const raw = JSON.stringify(['UTC', 'Europe/Paris', 'UTC', 'Mars/Olympus', 3, null])
    expect(new TimezoneListLocalStorageStore(fakeStorage(() => raw)).load()).toEqual([
      'UTC',
      'Europe/Paris',
    ])
  })

  it('keeps an explicitly empty list but rejects a list with no valid entry', () => {
    expect(new TimezoneListLocalStorageStore(fakeStorage(() => '[]')).load()).toEqual([])
    expect(
      new TimezoneListLocalStorageStore(fakeStorage(() => '["Mars/Olympus", 3]')).load(),
    ).toBeNull()
  })

  it('saves as JSON and does not throw when saving fails', () => {
    let saved: unknown
    const ok = { getItem: () => null, setItem: (_k: string, v: unknown) => (saved = v) }
    new TimezoneListLocalStorageStore(ok as unknown as LocalStorage).save(['UTC'])
    expect(saved).toBe('["UTC"]')

    const full = fakeStorage(
      () => null,
      () => {
        throw new Error('QuotaExceededError')
      },
    )
    expect(() => new TimezoneListLocalStorageStore(full).save(['UTC'])).not.toThrow()
  })
})
