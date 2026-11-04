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
import { arcPoints } from './geo'

/**
 * An "arc centered at" phrase found in a text, with its span.
 */
export interface ArcDirective {
  start: number
  end: number
  center: GeoPoint
  clockwise: boolean
  /** No direction stated: drawn clockwise, the text must be read */
  uncertain: boolean
  /** The arc goes back to the first point of the outline */
  closing: boolean
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
const RADIUS = String.raw`${NUM}\s*(?:${UNIT})`
const EN_DIRECTION = String.raw`CLOCKWISE|(?:ANTI|COUNTER)-?\s?CLOCKWISE`
const FR_DIRECTION = String.raw`(?:ANTI-?)?HORAIRE|TRIGONOM[ÉE]TRIQUE|(?:INVERSE\s+)?DES\s+AIGUILLES\s+D['’]UNE\s+MONTRE|INVERSE`

/**
 * Accepted wordings of an arc, up to its center: an open list, add a row for
 * each phrasing met in real texts. A row may capture the direction in `dir`.
 */
const ARC_WORDINGS: string[] = [
  // "CLOCKWISE VIA A 30 NM ARC", "CLOCKWISE ALONG AN ARC OF 5NM RADIUS",
  // "ANTICLOCKWISE ARC RADIUS 5NM", "ALONG THE ARC OF A CIRCLE OF 15 NM RADIUS"
  String.raw`(?:(?<dir>${EN_DIRECTION})\s+)?(?:(?:VIA|ALONG)\s+)?(?:(?:A|AN|THE)\s+)?(?:${RADIUS}\s+(?:RADIUS\s+)?)?ARC(?:\s+OF\s+A\s+CIRCLE)?(?:\s+(?:OF\s+${RADIUS}\s+RADIUS|(?:OF\s+)?RADIUS\s+${RADIUS}|${RADIUS}\s+RADIUS|(?:DE\s+)?${RADIUS}))?`,
  // "arc de cercle de 5 NM de rayon", "arc horaire de 5 nm de rayon", never
  // after an English direction that the row above failed to take
  String.raw`(?<!CLOCKWISE\s+)ARC(?:\s+(?<dir>(?:ANTI-?)?HORAIRE|TRIGONOM[ÉE]TRIQUE))?(?:\s+DE\s+CERCLE)?(?:\s+(?:DE\s+)?${RADIUS}(?:\s+DE\s+RAYON)?)?`,
]

/**
 * Direction stated after the center: "dans le sens horaire",
 * "(COUNTER-CLOCKWISE)".
 */
const DIRECTION_AFTER = String.raw`(?:\s*,?\s*(?:(?:DANS\s+LE\s+)?SENS\s+(?<dirFr>${FR_DIRECTION})|\(\s*(?<dirEn>${EN_DIRECTION})\s*\)))?`

/**
 * Wordings of an arc going back to the first point of the outline: an open
 * list as well.
 */
const ARC_CLOSINGS: string[] = [
  String.raw`(?:BACK\s+)?TO\s+(?:THE\s+)?POINT\s+OF\s+ORIGIN`,
  String.raw`JUSQU['’]AU\s+POINT\s+(?:DE\s+D[ÉE]PART|D['’]ORIGINE)`,
]

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
  return direction === undefined || !/ANTI|COUNTER|TRIGO|INVERSE/i.test(direction)
}

/**
 * Closes an outline with an arc from its last point back to its first one.
 */
export function closeWithArc(points: GeoPoint[], arc: ArcDirective): GeoPoint[] {
  const first = points[0]
  const last = points[points.length - 1]
  if (first === undefined || last === undefined) {
    return points
  }
  return [...points, ...arcPoints(arc.center, last, first, arc.clockwise)]
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

  let match
  for (const wording of ARC_WORDINGS) {
    const arcPattern = new RegExp(
      `${wording}\\s+${CENTERED}\\s+${pointSource}${DIRECTION_AFTER}` +
        String.raw`(?:\s*,?\s*(?<closing>${ARC_CLOSINGS.join('|')}))?`,
      'gi',
    )
    // Searched in the cleaned text: an arc found by a row is not found again
    while ((match = arcPattern.exec(cleaned)) != null) {
      const groups = match.groups
      const center = groups ? parsePoint(groups) : null
      if (groups === undefined || center === null) {
        continue
      }
      const direction = groups['dir'] ?? groups['dirFr'] ?? groups['dirEn']
      const end = match.index + match[0].length
      arcs.push({
        start: match.index,
        end,
        center,
        clockwise: isClockwise(direction),
        uncertain: direction === undefined,
        closing: groups['closing'] !== undefined,
      })
      fill(match.index, end, ' ')
    }
  }
  arcs.sort((a, b) => a.start - b.start)

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
