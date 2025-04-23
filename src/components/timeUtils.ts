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

  const utcIdx = formattedDate.indexOf('UTC')
  if (utcIdx == -1) {
    // Timezone not found
    return ''
  }

  return formattedDate.substring(utcIdx + 'UTC'.length)
}

export class TimePeriod {
  duration_s: number

  constructor(duration_s: number) {
    this.duration_s = duration_s
  }

  toString(): string {
    return `${Math.floor(this.duration_s / 3600)
      .toString()
      .padStart(1, '0')}:${Math.abs(Math.floor((this.duration_s % 3600) / 60))
      .toString()
      .padStart(2, '0')}`
  }
}
