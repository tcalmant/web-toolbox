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
 * Wind and density altitude helpers. Framework-free, unit-agnostic for speeds
 * (the result is in the unit of the input speed).
 */

export interface WindComponents {
  /** Positive: wind on the nose, negative: tailwind. */
  headwind: number
  /** Always positive, see crosswindSide. */
  crosswind: number
  crosswindSide: 'left' | 'right' | 'none'
}

/** Knots to km/h and back, both rounded by the caller. */
export const KMH_PER_KNOT = 1.852

function normalizeAngle(deg: number): number {
  const wrapped = ((((deg + 180) % 360) + 360) % 360) - 180
  // Map -180 to 180 so a wind exactly behind is a pure tailwind either way
  return wrapped === -180 ? 180 : wrapped
}

/**
 * Head/tail and crosswind components of a wind on a runway.
 * @param runwayHeadingDeg Magnetic heading of the runway in the landing direction
 * @param windFromDeg Direction the wind blows from, same reference as the runway
 * @param speed Wind speed (or gust)
 */
export function windComponents(
  runwayHeadingDeg: number,
  windFromDeg: number,
  speed: number,
): WindComponents {
  const angle = (normalizeAngle(windFromDeg - runwayHeadingDeg) * Math.PI) / 180
  const headwind = speed * Math.cos(angle)
  const cross = speed * Math.sin(angle)
  // Absorb floating point noise (cos(90 deg) is 6e-17, not 0)
  const clean = (v: number) => (Math.abs(v) < 1e-9 ? 0 : v)
  const crosswind = clean(Math.abs(cross))
  return {
    headwind: clean(headwind),
    crosswind,
    crosswindSide: crosswind === 0 ? 'none' : cross > 0 ? 'right' : 'left',
  }
}

/** Sector of a variable wind direction, clockwise from `fromDeg` to `toDeg` (METAR 240V300). */
export interface WindSector {
  fromDeg: number
  toDeg: number
}

/**
 * Worst components of a wind whose direction is only known to lie in a sector,
 * or anywhere when the sector is null (VRB): the largest crosswind and the
 * least headwind (most tailwind) over every possible direction.
 */
export function worstWindComponents(
  runwayHeadingDeg: number,
  sector: WindSector | null,
  speed: number,
): Pick<WindComponents, 'headwind' | 'crosswind'> {
  if (sector === null) {
    return { headwind: -speed, crosswind: speed }
  }
  const mod = (deg: number) => ((deg % 360) + 360) % 360
  const width = mod(sector.toDeg - sector.fromDeg)
  const inSector = (deg: number) => mod(deg - sector.fromDeg) <= width
  // Extremes are at the sector ends, or at the beam and tail directions when inside it
  const candidates = [
    sector.fromDeg,
    sector.toDeg,
    ...[90, 180, 270].map((d) => runwayHeadingDeg + d),
  ]
    .filter(inSector)
    .map((deg) => windComponents(runwayHeadingDeg, deg, speed))
  return {
    headwind: Math.min(...candidates.map((c) => c.headwind)),
    crosswind: Math.max(...candidates.map((c) => c.crosswind)),
  }
}

/**
 * Parses a runway designator ("22", "04R", "4L") or a 3 digit heading ("220")
 * into a heading in degrees. Returns null when it is neither.
 */
export function parseRunwayHeading(input: string): number | null {
  const text = input.trim().toUpperCase()
  const designator = /^(\d{1,2})[LRC]?$/.exec(text)
  if (designator) {
    const number = parseInt(designator[1] ?? '', 10)
    return number >= 1 && number <= 36 ? (number % 36) * 10 : null
  }
  const heading = /^(\d{3})$/.exec(text)
  if (heading) {
    const deg = parseInt(heading[1] ?? '', 10)
    return deg <= 360 ? deg % 360 : null
  }
  return null
}

/** The opposite end of a runway. */
export function reciprocalHeading(headingDeg: number): number {
  return (headingDeg + 180) % 360
}

const ISA_SEA_LEVEL_TEMP_C = 15
const ISA_SEA_LEVEL_HPA = 1013.25
const ISA_LAPSE_C_PER_FT = 0.0019812

/** Pressure altitude (ft) of a field, from its elevation (ft) and the QNH (hPa). */
export function pressureAltitudeFt(elevationFt: number, qnhHpa: number): number {
  // Station pressure from QNH (ISA), then the altitude at which ISA has that pressure
  const stationHpa = qnhHpa * Math.pow(1 - 6.8755856e-6 * elevationFt, 5.255877)
  return 145366.45 * (1 - Math.pow(stationHpa / ISA_SEA_LEVEL_HPA, 0.190284))
}

/** ISA temperature (degrees C) at the given pressure altitude (ft). */
export function isaTemperatureC(pressureAltitude: number): number {
  return ISA_SEA_LEVEL_TEMP_C - ISA_LAPSE_C_PER_FT * pressureAltitude
}

export interface DensityAltitude {
  pressureAltitudeFt: number
  isaTemperatureC: number
  isaDeviationC: number
  densityAltitudeFt: number
}

/** Density altitude, with the usual 120 ft per degree of ISA deviation. */
export function densityAltitude(
  elevationFt: number,
  qnhHpa: number,
  outsideTempC: number,
): DensityAltitude {
  const pa = pressureAltitudeFt(elevationFt, qnhHpa)
  const isa = isaTemperatureC(pa)
  const deviation = outsideTempC - isa
  return {
    pressureAltitudeFt: pa,
    isaTemperatureC: isa,
    isaDeviationC: deviation,
    densityAltitudeFt: pa + 120 * deviation,
  }
}
