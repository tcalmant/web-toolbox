/**
 * Copyright (c) 2025 Thomas Calmant
 * All rights reserved.
 *
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

/**
 * Parser of the NOTAM field D (day/time schedule, ICAO Doc 8126 and
 * PANS-AIM Doc 10066 forms), and evaluation over a time window.
 */

/** Time interval, both bounds included */
export interface TimeWindow {
  from: Date
  to: Date
}

/** A day of the year; month (0-11) is null when the text omits it */
export interface DayOfYear {
  month: number | null
  day: number
}

/** Range of days, wrapping around when `from` is after `to` (FRI-MON, NOV 28-DEC 03) */
export type DaySelector =
  { kind: 'weekdays'; from: number; to: number } | { kind: 'dates'; from: DayOfYear; to: DayOfYear }

/** Minutes since 00:00 UTC; `end` <= `start` means the range ends the next day */
export interface TimeRange {
  start: number
  end: number
}

/** Time ranges applied on the selected days (every day if `days` is empty) */
export interface ScheduleRule {
  days: DaySelector[]
  except: DaySelector[]
  times: TimeRange[]
}

export type NotamSchedule =
  | { kind: 'rules'; rules: ScheduleRule[] }
  /** Sunrise or sunset is used: no ephemeris yet */
  | { kind: 'needsSunTimes' }
  | { kind: 'notUnderstood' }

const WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
const DAY_MINUTES = 24 * 60
const DAY_MS = DAY_MINUTES * 60_000

class NotUnderstood extends Error {}

/**
 * Parses a field D. Anything outside the supported forms gives
 * 'notUnderstood', never a guess.
 *
 * @param text Content of the D) section
 * @returns The parsed schedule
 */
export function parseNotamSchedule(text: string): NotamSchedule {
  const source = text.toUpperCase().trim()
  if (!source || /[^A-Z0-9\s,-]/.test(source)) {
    return { kind: 'notUnderstood' }
  }
  const tokens = source.match(/H24|[A-Z]+|\d+|[,-]/g) ?? []
  let pos = 0
  let month: number | null = null
  let needsSun = false

  const peek = (offset = 0) => tokens[pos + offset]
  const isHhmm = (token?: string) => token !== undefined && /^\d{4}$/.test(token)
  const isDay = (token?: string) => token !== undefined && /^\d{1,2}$/.test(token)
  const isSun = (token?: string) => token === 'SR' || token === 'SS'
  const isTimeStart = (token?: string) => isHhmm(token) || isSun(token) || token === 'H24'

  function minutes(token: string, isEnd: boolean): number {
    const hh = Number(token.slice(0, 2))
    const mm = Number(token.slice(2))
    // 2359 and 2400 both close the day
    if (isEnd && (token === '2359' || token === '2400')) {
      return DAY_MINUTES
    }
    if (hh > 23 || mm > 59) {
      throw new NotUnderstood()
    }
    return hh * 60 + mm
  }

  // A time bound, or null for a sunrise/sunset one
  function timeBound(isEnd: boolean): number | null {
    const token = tokens[pos++]
    if (isSun(token)) {
      needsSun = true
      if ((peek() === 'MINUS' || peek() === 'PLUS') && /^\d+$/.test(peek(1) ?? '')) {
        pos += 2
      }
      return null
    }
    if (!isHhmm(token)) {
      throw new NotUnderstood()
    }
    return minutes(token!, isEnd)
  }

  function timeRange(): TimeRange | null {
    if (peek() === 'H24') {
      pos++
      return { start: 0, end: DAY_MINUTES }
    }
    const start = timeBound(false)
    if (tokens[pos++] !== '-') {
      throw new NotUnderstood()
    }
    const end = timeBound(true)
    // "0000-0000" could be a full day or nothing
    if (start !== null && start === end) {
      throw new NotUnderstood()
    }
    return start === null || end === null ? null : { start, end }
  }

  function dayOfYear(): DayOfYear {
    const monthIdx = MONTHS.indexOf(peek() ?? '')
    if (monthIdx >= 0) {
      month = monthIdx
      pos++
    }
    const token = tokens[pos++]
    if (!isDay(token) || Number(token) < 1 || Number(token) > 31) {
      throw new NotUnderstood()
    }
    return { month, day: Number(token) }
  }

  function daySelector(): DaySelector {
    const weekday = WEEKDAYS.indexOf(peek() ?? '')
    if (weekday >= 0) {
      pos++
      let to = weekday
      if (peek() === '-') {
        pos++
        to = WEEKDAYS.indexOf(tokens[pos++] ?? '')
        if (to < 0) {
          throw new NotUnderstood()
        }
      }
      return { kind: 'weekdays', from: weekday, to }
    }
    const from = dayOfYear()
    let to = from
    // A dash followed by a time is not a day range
    if (peek() === '-' && !isTimeStart(peek(1))) {
      pos++
      const ownMonth = MONTHS.includes(peek() ?? '')
      to = dayOfYear()
      // "NOV 28-03" would wrap over the whole year
      if (
        (from.month === null) !== (to.month === null) ||
        (from.month !== null && !ownMonth && to.day < from.day)
      ) {
        throw new NotUnderstood()
      }
    }
    return { kind: 'dates', from, to }
  }

  try {
    const rules: ScheduleRule[] = []
    while (pos < tokens.length) {
      const rule: ScheduleRule = { days: [], except: [], times: [] }
      let excepting = false
      let exceptAfterTimes = false
      while (pos < tokens.length && peek() !== ',') {
        const token = peek()
        if (rule.times.length > 0 && !excepting && token !== 'EXC' && !isTimeStart(token)) {
          // A new day selection after times starts the next rule
          break
        } else if (token === 'DAILY') {
          if (excepting) {
            throw new NotUnderstood()
          }
          pos++
        } else if (token === 'EXC') {
          if (excepting) {
            throw new NotUnderstood()
          }
          excepting = true
          exceptAfterTimes = rule.times.length > 0 || needsSun
          pos++
        } else if (isTimeStart(token)) {
          // "0800-1700 EXC SUN 0900-1000" has no clear reading
          if (exceptAfterTimes || (excepting && rule.except.length === 0)) {
            throw new NotUnderstood()
          }
          excepting = false
          const range = timeRange()
          if (range) {
            rule.times.push(range)
          }
        } else {
          ;(excepting ? rule.except : rule.days).push(daySelector())
        }
      }
      if (excepting && rule.except.length === 0) {
        // An EXC without days to exclude
        throw new NotUnderstood()
      }
      if (peek() === ',') {
        pos++
        if (pos === tokens.length) {
          throw new NotUnderstood()
        }
      }
      if (rule.times.length === 0 && !needsSun) {
        // Days without times, or an empty period between commas
        throw new NotUnderstood()
      }
      rules.push(rule)
    }
    if (needsSun) {
      return { kind: 'needsSunTimes' }
    }
    return { kind: 'rules', rules }
  } catch (e) {
    if (e instanceof NotUnderstood) {
      return { kind: 'notUnderstood' }
    }
    throw e
  }
}

function inRange(value: number, from: number, to: number): boolean {
  return from <= to ? from <= value && value <= to : value >= from || value <= to
}

function selectorMatches(selector: DaySelector, date: Date): boolean {
  if (selector.kind === 'weekdays') {
    return inRange(date.getUTCDay(), selector.from, selector.to)
  }
  const ordinal = (d: DayOfYear, month: number) => (d.month ?? month) * 32 + d.day
  const month = date.getUTCMonth()
  return inRange(
    ordinal({ month, day: date.getUTCDate() }, month),
    ordinal(selector.from, month),
    ordinal(selector.to, month),
  )
}

/**
 * Tells if a schedule has an active period intersecting the window, within
 * the validity bounds.
 *
 * @param rules Parsed schedule rules
 * @param validityFrom Start of validity (B), null if unknown
 * @param validityTo End of validity (C), null if unknown or permanent
 * @param window Time window to check
 * @returns The answer, or null when the schedule cannot be placed in time
 */
export function scheduleIntersects(
  rules: ScheduleRule[],
  validityFrom: Date | null,
  validityTo: Date | null,
  window: TimeWindow,
): boolean | null {
  // Days without a month are only unambiguous within a validity shorter than a month
  const monthless = rules.some((rule) =>
    [...rule.days, ...rule.except].some((s) => s.kind === 'dates' && s.from.month === null),
  )
  if (
    monthless &&
    (!validityFrom || !validityTo || validityTo.getTime() - validityFrom.getTime() > 28 * DAY_MS)
  ) {
    return null
  }

  const lower = Math.max(window.from.getTime(), validityFrom?.getTime() ?? -Infinity)
  const upper = Math.min(window.to.getTime(), validityTo?.getTime() ?? Infinity)
  if (lower > upper) {
    return false
  }
  // Start a day early for periods crossing midnight
  const firstDay = Math.floor(lower / DAY_MS) * DAY_MS - DAY_MS
  for (let day = firstDay; day <= upper; day += DAY_MS) {
    const date = new Date(day)
    for (const rule of rules) {
      if (
        (rule.days.length > 0 && !rule.days.some((s) => selectorMatches(s, date))) ||
        rule.except.some((s) => selectorMatches(s, date))
      ) {
        continue
      }
      for (const { start, end } of rule.times) {
        const periodStart = day + start * 60_000
        const periodEnd = day + (end > start ? end : end + DAY_MINUTES) * 60_000
        // Both bounds included, on the safe side
        if (periodStart <= upper && periodEnd >= lower) {
          return true
        }
      }
    }
  }
  return false
}
