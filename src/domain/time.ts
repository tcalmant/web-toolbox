/*
 *   Copyright (c) 2025 Thomas Calmant
 *   All rights reserved.

 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at

 *   http://www.apache.org/licenses/LICENSE-2.0

 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */

/**
 * Converts the given string to a date string in YYYY-MM-dd HH:mm:ss format, with the timezone.
 * @param date The date to convert
 * @param tzName Name of the timezone to convert the date to
 * @returns A string representation of the given date
 */
export function dateToString(date: Date, tzName: string): string {
  if (date === undefined || date === null) {
    throw new Error('Invalid Date')
  }

  const options: Intl.DateTimeFormatOptions = {
    timeZone: tzName,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }

  // Convert to FR locale: DD/MM/YYYY HH:mm:ss
  const formatter = new Intl.DateTimeFormat('en-US', options)

  let partsArray
  try {
    partsArray = formatter.formatToParts(date)
  } catch (e) {
    console.error(`Error parsing date: ${(e as Error).message}`)
    return ''
  }

  const parts: Record<string, string> = {}
  for (const item of partsArray) {
    parts[item.type] = item.value
  }

  // Convert it to ISO format
  return `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}:${parts.second}`
}

/**
 * Converts the given string to a date string in YYYY-MM-dd HH:mm:ss format in the UTC timezone.
 * @param date The date to convert
 * @returns A string representation of the given date in UTC
 */
export function dateToUTCString(date: Date): string {
  return dateToString(date, 'UTC')
}

/**
 * Converts a date offset to a string like +01:00 or +00:00 or -00:30
 * @param date Date representation
 * @param tzName Name of the timezone
 * @returns String representation of the timezone offset
 */
export function formatTzOffset(date: Date, tzName: string): string {
  const options: Intl.DateTimeFormatOptions = {
    timeZone: tzName,
    timeZoneName: 'longOffset',
  }

  const formatter = new Intl.DateTimeFormat(undefined, options)
  let formattedDate
  try {
    formattedDate = formatter.format(date)
  } catch (e) {
    console.error(`Error computing timezone offset: ${(e as Error).message}`)
    return ''
  }

  // The long offset format is prefixed with "UTC" or "GMT" depending on
  // the browser (Chromium under the en-US locale uses "GMT")
  const match = /(?:UTC|GMT)([+\u2212-]\d{1,2}:\d{2})/.exec(formattedDate)
  return match?.[1] ?? ''
}

/**
 * Parses an offset string like "+01:00", "-00:30" or "" (UTC) into minutes.
 * Inverse of the suffix produced by formatTzOffset.
 * @param offset Offset string
 * @returns The offset in minutes (positive means ahead of UTC), else 0
 */
export function parseTzOffsetMinutes(offset: string): number {
  // Intl's longOffset format may use the Unicode minus sign (U+2212)
  // instead of a plain ASCII hyphen for negative offsets.
  const match = /^([+\u2212-])(\d{1,2}):(\d{2})$/.exec(offset.trim())
  if (match == null) {
    return 0
  }

  const sign = match[1] === '+' ? 1 : -1
  const hours = parseInt(match[2] ?? '0')
  const minutes = parseInt(match[3] ?? '0')
  return sign * (hours * 60 + minutes)
}

export class TimePeriod {
  duration_s: number

  constructor(duration_s: number) {
    this.duration_s = duration_s
  }

  toString(): string {
    const sign = this.duration_s < 0 ? '-' : ''
    const absSeconds = Math.abs(this.duration_s)
    const hours = Math.floor(absSeconds / 3600)
    const minutes = Math.floor((absSeconds % 3600) / 60)
    return `${sign}${hours}:${minutes.toString().padStart(2, '0')}`
  }
}
