/**
 * Copyright (c) 2025 Thomas Calmant
 * All rights reserved.
 *
 * Tests for domain/time.ts
 */

import { describe, expect, it } from 'vitest'

import {
  dateToString,
  dateToUTCString,
  formatTzOffset,
  parseTzOffsetMinutes,
  TimePeriod,
} from '../../../src/domain/time'

describe('TimePeriod.toString', () => {
  it('formats a positive duration as H:MM', () => {
    expect(new TimePeriod(3600).toString()).toEqual('1:00')
    expect(new TimePeriod(5400).toString()).toEqual('1:30')
    expect(new TimePeriod(59 * 60).toString()).toEqual('0:59')
  })

  it('formats a negative duration with the sign in front (regression)', () => {
    // -1h30 previously rendered as "-2:30" because only minutes were abs()'d
    expect(new TimePeriod(-5400).toString()).toEqual('-1:30')
    expect(new TimePeriod(-3600).toString()).toEqual('-1:00')
    expect(new TimePeriod(-30).toString()).toEqual('-0:00')
  })

  it('formats a zero duration', () => {
    expect(new TimePeriod(0).toString()).toEqual('0:00')
  })
})

describe('dateToString / dateToUTCString', () => {
  it('formats a date in the given timezone', () => {
    const date = new Date(Date.UTC(2026, 0, 15, 12, 30, 45))
    expect(dateToString(date, 'UTC')).toEqual('2026-01-15 12:30:45')
  })

  it('dateToUTCString is a UTC shortcut', () => {
    const date = new Date(Date.UTC(2026, 6, 1, 8, 0, 0))
    expect(dateToUTCString(date)).toEqual(dateToString(date, 'UTC'))
  })
})

describe('formatTzOffset / parseTzOffsetMinutes', () => {
  it('formats UTC as +00:00', () => {
    const date = new Date(Date.UTC(2026, 0, 1))
    expect(formatTzOffset(date, 'UTC')).toEqual('+00:00')
  })

  it('round-trips through parseTzOffsetMinutes', () => {
    const date = new Date(Date.UTC(2026, 6, 1))
    expect(parseTzOffsetMinutes(formatTzOffset(date, 'Europe/Paris'))).toEqual(120) // CEST, UTC+2
    expect(parseTzOffsetMinutes(formatTzOffset(date, 'America/New_York'))).toEqual(-240) // EDT, UTC-4
  })

  it('handles ICU implementations that prefix the offset with GMT instead of UTC (regression: Chromium under en-US)', () => {
    const OriginalDateTimeFormat = Intl.DateTimeFormat
    class StubDateTimeFormat {
      format() {
        return '7/10/2026, GMT-04:00'
      }
    }
    // @ts-expect-error stubbing the global for this test only
    Intl.DateTimeFormat = StubDateTimeFormat
    try {
      expect(formatTzOffset(new Date(), 'America/New_York')).toEqual('-04:00')
    } finally {
      Intl.DateTimeFormat = OriginalDateTimeFormat
    }
  })

  it('parses a positive and negative offset string', () => {
    expect(parseTzOffsetMinutes('+02:00')).toEqual(120)
    expect(parseTzOffsetMinutes('-04:30')).toEqual(-270)
    expect(parseTzOffsetMinutes('+00:00')).toEqual(0)
  })

  it('returns 0 for an unparsable offset', () => {
    expect(parseTzOffsetMinutes('')).toEqual(0)
    expect(parseTzOffsetMinutes('garbage')).toEqual(0)
  })
})
