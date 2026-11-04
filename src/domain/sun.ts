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

/*
 * Sunrise, sunset and civil twilight, after the NOAA Global Monitoring
 * Laboratory solar calculator (https://gml.noaa.gov/grad/solcalc/calcdetails.html,
 * equations of NOAA_Solar_Calculations_day.ods, themselves from Meeus,
 * "Astronomical Algorithms"; a US government work). NOAA states an accuracy
 * of one minute between 72 degrees north and south, valid from 1901 to 2099.
 */

/** Sun altitude of sunrise and sunset: 0.833 degree of refraction and semi-diameter (NOAA). */
export const SUNRISE_ALTITUDE = -0.833

/** Sun altitude ending evening civil twilight (Regulation (EU) 923/2012, Article 2(97)). */
export const CIVIL_TWILIGHT_ALTITUDE = -6

/** Morning and evening crossings of an altitude, or the reason there are none. */
export type SunCrossing =
  { kind: 'crossing'; rise: Date; set: Date } | { kind: 'alwaysAbove' } | { kind: 'alwaysBelow' }

export interface SunTimes {
  /** Sunrise and sunset. */
  sun: SunCrossing
  /** Civil dawn and dusk. */
  civil: SunCrossing
}

const DAY_MS = 86400000
const rad = (deg: number) => (deg * Math.PI) / 180
const deg = (r: number) => (r * 180) / Math.PI

/** Declination (degrees) and equation of time (minutes) at the instant. */
function solarPosition(instant: number): { declination: number; eqTime: number } {
  // Julian centuries since J2000.0 (JD 2440587.5 is the Unix epoch)
  const jc = (instant / DAY_MS + 2440587.5 - 2451545) / 36525
  const meanLong = (280.46646 + jc * (36000.76983 + jc * 0.0003032)) % 360
  const meanAnom = 357.52911 + jc * (35999.05029 - 0.0001537 * jc)
  const ecc = 0.016708634 - jc * (0.000042037 + 0.0000001267 * jc)
  const center =
    Math.sin(rad(meanAnom)) * (1.914602 - jc * (0.004817 + 0.000014 * jc)) +
    Math.sin(rad(2 * meanAnom)) * (0.019993 - 0.000101 * jc) +
    Math.sin(rad(3 * meanAnom)) * 0.000289
  const omega = rad(125.04 - 1934.136 * jc)
  const appLong = meanLong + center - 0.00569 - 0.00478 * Math.sin(omega)
  const meanObliq = 23 + (26 + (21.448 - jc * (46.815 + jc * (0.00059 - jc * 0.001813))) / 60) / 60
  const obliq = meanObliq + 0.00256 * Math.cos(omega)
  const declination = deg(Math.asin(Math.sin(rad(obliq)) * Math.sin(rad(appLong))))
  const y = Math.tan(rad(obliq / 2)) ** 2
  const l0 = rad(meanLong)
  const m = rad(meanAnom)
  const eqTime =
    4 *
    deg(
      y * Math.sin(2 * l0) -
        2 * ecc * Math.sin(m) +
        4 * ecc * y * Math.sin(m) * Math.cos(2 * l0) -
        0.5 * y * y * Math.sin(4 * l0) -
        1.25 * ecc * ecc * Math.sin(2 * m),
    )
  return { declination, eqTime }
}

/**
 * Instant the sun crosses the altitude on the morning (side -1) or evening
 * (side 1) of the solar day, or the polar state when it never does.
 */
function crossing(
  latitude: number,
  longitude: number,
  midnight: number,
  altitude: number,
  side: -1 | 1,
): number | 'alwaysAbove' | 'alwaysBelow' {
  // The NOAA sheet evaluates the sun at the event time: iterate from noon
  let minutes = 720
  for (let i = 0; i < 3; i++) {
    const { declination, eqTime } = solarPosition(midnight + minutes * 60000)
    const cosHourAngle =
      Math.cos(rad(90 - altitude)) / (Math.cos(rad(latitude)) * Math.cos(rad(declination))) -
      Math.tan(rad(latitude)) * Math.tan(rad(declination))
    if (cosHourAngle > 1) {
      return 'alwaysBelow'
    }
    if (cosHourAngle < -1) {
      return 'alwaysAbove'
    }
    minutes = 720 - 4 * longitude - eqTime + side * 4 * deg(Math.acos(cosHourAngle))
  }
  return midnight + Math.round(minutes * 60000)
}

function sunCrossing(
  latitude: number,
  longitude: number,
  midnight: number,
  altitude: number,
): SunCrossing {
  const rise = crossing(latitude, longitude, midnight, altitude, -1)
  const set = crossing(latitude, longitude, midnight, altitude, 1)
  // A rise without a set (or the reverse) only happens on the day a polar
  // period starts or ends: the valid crossing is dropped on purpose, the
  // whole day is reported with the polar state instead
  if (typeof rise !== 'number') {
    return { kind: rise }
  }
  if (typeof set !== 'number') {
    return { kind: set }
  }
  return { kind: 'crossing', rise: new Date(rise), set: new Date(set) }
}

/**
 * Sunrise, sunset and civil twilight of the solar day following UTC midnight
 * of `day` (noon at 720 - 4*lon - EoT minutes; latitude north and longitude
 * east positive, in degrees). Far from Greenwich an event can fall on the
 * previous or next UTC date.
 */
export function sunTimes(latitude: number, longitude: number, day: Date): SunTimes {
  const midnight = Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate())
  return {
    sun: sunCrossing(latitude, longitude, midnight, SUNRISE_ALTITUDE),
    civil: sunCrossing(latitude, longitude, midnight, CIVIL_TWILIGHT_ALTITUDE),
  }
}

/** The instant rounded to the minute, upwards, downwards or to the nearest. */
export function roundToMinute(at: Date, mode: 'up' | 'down' | 'nearest'): Date {
  const round = { up: Math.ceil, down: Math.floor, nearest: Math.round }[mode]
  return new Date(round(at.getTime() / 60000) * 60000)
}
