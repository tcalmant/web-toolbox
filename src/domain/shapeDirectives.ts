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

import type { GeoPoint } from './geo'

/**
 * An "arc centered at" phrase found in a text, with its span.
 */
export interface ArcDirective {
  start: number
  end: number
  center: GeoPoint
  clockwise: boolean
}

/**
 * A "circle of radius R centered at" phrase found in a text, with its span.
 */
export interface CircleDirective {
  start: number
  end: number
  center: GeoPoint
  radiusMeters: number
}

export interface ShapeDirectives {
  arcs: ArcDirective[]
  circles: CircleDirective[]
  /**
   * The input text where every directive is blanked out (same length, so
   * indices stay valid), so that the center points are not mistaken for
   * outline points.
   */
  cleaned: string
}

const NUM = String.raw`\d+(?:[.,]\d+)?`
const UNIT = String.raw`NM|KM|M`
const CENTERED = String.raw`(?:CENTERED|CENTRED|CENTR[ÉE]E?)\s+(?:AT|ON|SUR|[ÀA])`
const FR_DIRECTION = String.raw`(?:DANS\s+LE\s+)?SENS\s+(?<frDir>(?:ANTI-?)?HORAIRE|TRIGONOM[ÉE]TRIQUE|(?:INVERSE\s+)?DES\s+AIGUILLES\s+D['’]UNE\s+MONTRE|INVERSE)`

function toMeters(value: string | undefined, unit: string | undefined): number | null {
  if (value === undefined || unit === undefined) {
    return null
  }
  const parsed = parseFloat(value.replace(',', '.'))
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null
  }
  switch (unit.toUpperCase()) {
    case 'NM':
      return parsed * 1852
    case 'KM':
      return parsed * 1000
    default:
      return parsed
  }
}

function isClockwise(direction: string | undefined): boolean {
  // Clockwise is the default when nothing is said
  return direction === undefined || !/ANTI|COUNTER|TRIGO|INVERSE/i.test(direction)
}

/**
 * Finds arcs ("CLOCKWISE VIA A 30 NM ARC CENTERED AT <point>", "arc de cercle
 * de 5 NM de rayon centré sur <point>") and circles ("CIRCLE RADIUS 5 NM
 * CENTERED AT <point>", "cercle de 3 NM de rayon centré sur <point>").
 *
 * @param text Text to search
 * @param pointSource Regex source matching a single point, with the named
 *   groups expected by `parsePoint`
 * @param parsePoint Turns the named groups of a point match into a location
 */
export function findShapeDirectives(
  text: string,
  pointSource: string,
  parsePoint: (groups: Record<string, string | undefined>) => GeoPoint | null,
): ShapeDirectives {
  const arcs: ArcDirective[] = []
  const circles: CircleDirective[] = []
  let cleaned = text
  const fill = (start: number, end: number, char: string) => {
    cleaned = cleaned.substring(0, start) + char.repeat(end - start) + cleaned.substring(end)
  }

  const arcPattern = new RegExp(
    String.raw`(?:(?<dirPre>CLOCKWISE|(?:ANTI|COUNTER)-?\s?CLOCKWISE)\s+(?:VIA\s+)?(?:A\s+)?)?` +
      String.raw`(?:(?:${NUM})\s*(?:${UNIT})\s+(?:RADIUS\s+)?)?` +
      String.raw`ARC\s+(?:(?<dirArc>(?:ANTI-?)?HORAIRE|TRIGONOM[ÉE]TRIQUE)\s+)?(?:DE\s+CERCLE\s+)?(?:(?:DE\s+)?(?:${NUM})\s*(?:${UNIT})(?:\s+DE\s+RAYON|\s+RADIUS)?\s+)?` +
      `${CENTERED}\\s+${pointSource}` +
      String.raw`(?:\s*,?\s*${FR_DIRECTION})?`,
    'gi',
  )
  let match
  while ((match = arcPattern.exec(text)) != null) {
    const groups = match.groups
    const center = groups ? parsePoint(groups) : null
    if (groups === undefined || center === null) {
      continue
    }
    const end = match.index + match[0].length
    arcs.push({
      start: match.index,
      end,
      center,
      clockwise: isClockwise(groups['dirPre'] ?? groups['dirArc'] ?? groups['frDir']),
    })
    fill(match.index, end, ' ')
  }

  // Circles are searched after arcs: "arc de cercle" must not count as a circle
  const circlePattern = new RegExp(
    String.raw`(?:(?<r1>${NUM})\s*(?<u1>${UNIT})\s+(?:RADIUS\s+)?(?:CIRCLE|CERCLE)` +
      String.raw`|(?:CIRCLE|CERCLE)\s+(?:OF\s+|DE\s+)?(?:(?:RADIUS|RAYON)\s+)?(?<r2>${NUM})\s*(?<u2>${UNIT})(?:\s+(?:DE\s+)?(?:RADIUS|RAYON))?)` +
      `\\s+${CENTERED}\\s+${pointSource}`,
    'gi',
  )
  while ((match = circlePattern.exec(cleaned)) != null) {
    const groups = match.groups
    if (groups === undefined) {
      continue
    }
    const radiusMeters = toMeters(groups['r1'] ?? groups['r2'], groups['u1'] ?? groups['u2'])
    const center = parsePoint(groups)
    if (radiusMeters === null || center === null) {
      continue
    }
    const end = match.index + match[0].length
    circles.push({ start: match.index, end, center, radiusMeters })
    // Not blanks: a circle must break any outline list around it
    fill(match.index, end, '#')
  }

  return { arcs, circles, cleaned }
}
