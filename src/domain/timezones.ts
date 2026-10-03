/*
 *   Copyright (c) 2026 Thomas Calmant
 *   All rights reserved.
 *
 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */

/**
 * Time zone helpers for the world clock and the time-of-day converter.
 * Framework-free: only relies on Intl.
 */

/** Wall-clock fields of an instant in some time zone. */
export interface ZonedParts {
  year: number
  month: number
  day: number
  hour: number
  minute: number
  second: number
}

/** Zones offered as one-click presets, in display order. */
export const PRESET_ZONES: readonly string[] = [
  'UTC',
  'Europe/Paris',
  'Europe/London',
  'Europe/Berlin',
  'America/New_York',
  'America/Los_Angeles',
  'Asia/Tokyo',
  'Australia/Sydney',
]

export function isValidTimeZone(tzName: string): boolean {
  if (!tzName) {
    return false
  }
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: tzName })
    return true
  } catch {
    return false
  }
}

/** Every zone name the browser knows, UTC first even if the browser omits it. */
export function allTimeZones(): string[] {
  const zones = Intl.supportedValuesOf('timeZone').filter((z) => z !== 'UTC')
  return ['UTC', ...zones]
}

export function localTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone
}

/** Wall-clock fields of the given instant in the given zone. */
export function zonedParts(date: Date, tzName: string): ZonedParts {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: tzName,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hourCycle: 'h23',
  })
  const values: Record<string, number> = {}
  for (const part of formatter.formatToParts(date)) {
    if (part.type !== 'literal') {
      values[part.type] = parseInt(part.value, 10)
    }
  }
  return {
    year: values['year'] ?? NaN,
    month: values['month'] ?? NaN,
    day: values['day'] ?? NaN,
    hour: values['hour'] ?? NaN,
    minute: values['minute'] ?? NaN,
    second: values['second'] ?? NaN,
  }
}

function partsAsUtcMs(parts: ZonedParts): number {
  return Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second)
}

/** Offset of the zone from UTC at the given instant, in minutes (east is positive). */
export function tzOffsetMinutes(date: Date, tzName: string): number {
  // Drop the milliseconds: the formatted parts are truncated to the second
  const wholeSeconds = Math.floor(date.getTime() / 1000) * 1000
  return Math.round((partsAsUtcMs(zonedParts(date, tzName)) - wholeSeconds) / 60000)
}

/**
 * The instant at which the wall clock of the given zone shows the given fields.
 * A time skipped by a DST change maps to the instant after the gap, an
 * ambiguous one to its first occurrence.
 */
export function zonedTimeToInstant(parts: ZonedParts, tzName: string): Date {
  const wallMs = partsAsUtcMs(parts)
  // Offsets a day before and after: they differ only around a DST change
  const offsetBefore = tzOffsetMinutes(new Date(wallMs - 86400000), tzName)
  const offsetAfter = tzOffsetMinutes(new Date(wallMs + 86400000), tzName)

  const candidates = [offsetBefore, offsetAfter]
    .map((offset) => ({ offset, instant: wallMs - offset * 60000 }))
    // A candidate is valid if the zone really is at that offset at that instant
    .filter(({ offset, instant }) => tzOffsetMinutes(new Date(instant), tzName) === offset)

  if (candidates.length > 0) {
    return new Date(Math.min(...candidates.map((c) => c.instant)))
  }
  // Skipped by a forward DST change: use the offset in force before the gap
  return new Date(wallMs - offsetBefore * 60000)
}

/** Calendar days between two zones' dates for the same instant (to minus from). */
export function dayShift(date: Date, tzName: string, fromTzName: string): number {
  const to = zonedParts(date, tzName)
  const from = zonedParts(date, fromTzName)
  const toDay = Date.UTC(to.year, to.month - 1, to.day)
  const fromDay = Date.UTC(from.year, from.month - 1, from.day)
  return Math.round((toDay - fromDay) / 86400000)
}

function pad2(value: number): string {
  return value.toString().padStart(2, '0')
}

/** HH:mm (or HH:mm:ss) wall time of the instant in the zone. */
export function formatClock(date: Date, tzName: string, withSeconds = false): string {
  const p = zonedParts(date, tzName)
  const base = `${pad2(p.hour)}:${pad2(p.minute)}`
  return withSeconds ? `${base}:${pad2(p.second)}` : base
}

/** YYYY-MM-DD date of the instant in the zone. */
export function formatDay(date: Date, tzName: string): string {
  const p = zonedParts(date, tzName)
  return `${p.year}-${pad2(p.month)}-${pad2(p.day)}`
}

/** "+01:00" style offset of the zone at the instant ("+00:00" for UTC). */
export function formatOffset(date: Date, tzName: string): string {
  const minutes = tzOffsetMinutes(date, tzName)
  const sign = minutes < 0 ? '-' : '+'
  const abs = Math.abs(minutes)
  return `${sign}${pad2(Math.floor(abs / 60))}:${pad2(abs % 60)}`
}

/** Last path segment of an IANA name, readable ("America/New_York" gives "New York"). */
export function zoneCity(tzName: string): string {
  const last = tzName.split('/').pop() ?? tzName
  return last.replace(/_/g, ' ')
}

/**
 * Parses "HH:mm" or "HH:mm:ss" and "YYYY-MM-DD" fields (as produced by
 * <input type="time"> and <input type="date">) into zone-agnostic parts.
 * Returns null when either field is malformed or out of range.
 */
export function parseDayAndTime(day: string, time: string): ZonedParts | null {
  const d = /^(\d{4})-(\d{2})-(\d{2})$/.exec(day.trim())
  const t = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(time.trim())
  if (!d || !t) {
    return null
  }
  const parts: ZonedParts = {
    year: parseInt(d[1] ?? '', 10),
    month: parseInt(d[2] ?? '', 10),
    day: parseInt(d[3] ?? '', 10),
    hour: parseInt(t[1] ?? '', 10),
    minute: parseInt(t[2] ?? '', 10),
    second: parseInt(t[3] ?? '0', 10),
  }
  const check = new Date(Date.UTC(parts.year, parts.month - 1, parts.day))
  const valid =
    check.getUTCFullYear() === parts.year &&
    check.getUTCMonth() === parts.month - 1 &&
    check.getUTCDate() === parts.day &&
    parts.hour < 24 &&
    parts.minute < 60 &&
    parts.second < 60
  return valid ? parts : null
}
