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
 * @param showOffset Whether or not to include the timezone offset
 * @returns A string representation of the given date
 */
export function dateToString(date: Date, showOffset: boolean = false): string {
  if (date === undefined || date === null) {
    throw new Error('Invalid Date')
  }

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
  const second = String(date.getSeconds()).padStart(2, '0')

  let result = `${year}-${month}-${day} ${hour}:${minute}:${second}`

  if (showOffset) {
    // Handling timezone offset
    const offsetMinutes = date.getTimezoneOffset()
    const hoursOffset = Math.abs(offsetMinutes / 60)
    const minutesOffset = offsetMinutes % 60

    let offsetSign = ''
    if (offsetMinutes < 0) {
      offsetSign = '+'
    } else {
      offsetSign = '-'
    }

    result += ` ${offsetSign}${String(hoursOffset).padStart(2, '0')}:${String(minutesOffset).padStart(2, '0')}`
  }

  return result
}

/**
 * Converts the given string to a date string in YYYY-MM-dd HH:mm:ss format in the UTC timezone.
 * @param date The date to convert
 * @returns A string representation of the given date in UTC
 */
export function dateToUTCString(date: Date): string {
  if (date === undefined || date === null) {
    throw new Error('Invalid Date')
  }

  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')
  const hour = String(date.getUTCHours()).padStart(2, '0')
  const minute = String(date.getUTCMinutes()).padStart(2, '0')
  const second = String(date.getSeconds()).padStart(2, '0')

  return `${year}-${month}-${day} ${hour}:${minute}:${second}`
}
