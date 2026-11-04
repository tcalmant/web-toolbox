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

import { borderKeyFromText, borderPath } from './borders'
import type { GeoPoint } from './geo'
import { arcPoints } from './geo'
import type { GeometryFeature } from './geometry'
import { Circle, Line, Polygon, Position } from './geometry'
import type { BorderSource } from './ports/borderSource'
import { closeWithArc, findShapeDirectives } from './shapeDirectives'

// A single AIP-formatted lat/lon pair (e.g. 45°30'15"N 005°45'E)
const AIP_LOCATION_SOURCE = String.raw`0?(?<latDeg>\d{2})°(?:(?:(?<latMin>\d{1,2})(?:'|’))(?:(?<latSec>\d{1,2}(?:\.\d+)?)(?:"|(?:'|’){2}))?)?\s*(?<latNS>N|S),?\s*-?\s*(?<lonDeg>\d{1,3}°(?:(?:(?<lonMin>\d{1,2})(?:'|’))(?:(?<lonSec>\d{1,2}(?:\.\d+)?)(?:"|(?:'|’){2}))?)?)\s*(?<lonEW>[EW])`

// Border or coast stretches between two outline points, e.g. "frontière
// franco-espagnole" or "limite des eaux territoriales atlantique françaises".
// When the course is not in the border data, the outline goes straight
// between the points.
const BORDER_TEXT = /^(?:fronti[èe]re|limite\s+des\s+eaux|c[ôo]te|littoral)\b[^\d°]{0,80}$/i

/**
 * Turns a list of points into the most specific geometry feature it
 * represents (a single point, a line, or a polygon).
 */
function toGeometryFeature(points: GeoPoint[]): GeometryFeature | null {
  if (points.length == 1) {
    return new Position('POINT', points[0]!)
  } else if (points.length == 2) {
    return new Line(points)
  } else if (points.length > 2) {
    return new Polygon(points)
  }
  return null
}

export class AIP {
  text: string
  polygons: GeometryFeature[]
  /**
   * An arc has no stated direction or a coordinate was rejected: the drawing
   * must be checked against the text
   */
  geometryUncertain = false
  /** The features whose outline is concerned, when it is known */
  uncertainFeatures = new Set<GeometryFeature>()
  private readonly borders: BorderSource

  constructor(fullText: string, borders: BorderSource) {
    this.text = fullText
    this.borders = borders
    this.polygons = this.findAIPPolygons(fullText)
  }

  parseAIPLocation(aipRegexMatch: RegExpMatchArray): GeoPoint | null {
    if (aipRegexMatch.groups == null) {
      return null
    }
    return this.parseAIPGroups(aipRegexMatch.groups)
  }

  parseAIPGroups(groups: Record<string, string | undefined>): GeoPoint | null {
    const strLatDeg = groups['latDeg']
    const strLatMin = groups['latMin']
    const strLatSec = groups['latSec']
    const strLatNS = groups['latNS']
    const strLonDeg = groups['lonDeg']
    const strLonMin = groups['lonMin']
    const strLonSec = groups['lonSec']
    const strLonEW = groups['lonEW']
    if (
      strLatDeg === undefined ||
      strLatNS === undefined ||
      strLonDeg === undefined ||
      strLonEW === undefined
    ) {
      return null
    }

    const minutes = [strLatMin, strLatSec, strLonMin, strLonSec].map((v) =>
      v === undefined ? 0 : parseFloat(v),
    )
    if (minutes.some((v) => v >= 60)) {
      return null
    }

    let lat = parseInt(strLatDeg)
    if (strLatMin !== undefined) {
      lat += parseInt(strLatMin) / 60
      if (strLatSec !== undefined) {
        lat += parseFloat(strLatSec) / 3600
      }
    }

    let lon = parseInt(strLonDeg)
    if (strLonMin !== undefined) {
      lon += parseInt(strLonMin) / 60
      if (strLonSec !== undefined) {
        lon += parseFloat(strLonSec) / 3600
      }
    }
    if (lat > 90 || lon > 180) {
      return null
    }

    // South and west are negative
    return {
      lat: strLatNS.toUpperCase() === 'S' ? -lat : lat,
      lng: strLonEW.toUpperCase() === 'W' ? -lon : lon,
    }
  }

  findAIPPolygons(text: string | undefined): GeometryFeature[] {
    if (text === undefined) {
      // No text given
      return []
    }

    // Circles and arcs: their centers must not be taken for outline points
    const directives = findShapeDirectives(text, AIP_LOCATION_SOURCE, (g) => this.parseAIPGroups(g))
    text = directives.cleaned
    this.geometryUncertain = directives.arcs.some((a) => a.uncertain)

    const knownBorders = this.borders.borders()

    // Look for AIP-formatted locations
    const aipLocation = new RegExp(AIP_LOCATION_SOURCE, 'g')

    const features: GeometryFeature[] = directives.circles.map(
      (c) => new Circle(c.center, c.radiusMeters),
    )
    let currentList: GeoPoint[] = []
    // A rejected point may belong to the outline before or after it: flag both
    let listUncertain = false
    let nextUncertain = false
    const flush = (points: GeoPoint[]) => {
      const feature = toGeometryFeature(points)
      if (feature !== null) {
        features.push(feature)
        if (listUncertain) {
          this.uncertainFeatures.add(feature)
        }
      }
      listUncertain = nextUncertain
      nextUncertain = false
      currentList = []
    }
    let lastEndIdx = 0
    let match
    while ((match = aipLocation.exec(text)) != null) {
      if (match.groups === undefined) {
        // Unexpected
        continue
      }

      const location = this.parseAIPLocation(match)
      if (location === null) {
        console.warn("Couldn't parse location %s", match[0])
        this.geometryUncertain = true
        listUncertain = true
        nextUncertain = true
        continue
      }

      // An arc between the previous point and this one: the outline goes on
      const arc = directives.arcs.find((a) => a.start >= lastEndIdx && a.end <= match!.index)

      // Dashes, commas and semicolons only separate the points of a same shape
      const between = text.substring(lastEndIdx, match.index).trim()
      const onlySeparators = between.replace(/[\s,;-]/g, '').length == 0
      if (arc?.closing === true) {
        // The arc ended the previous outline, this point starts a new one
        listUncertain ||= arc.uncertain
        flush(closeWithArc(currentList, arc))
      } else if (arc === undefined && !onlySeparators && !BORDER_TEXT.test(between)) {
        // Found text between previous and current number
        flush(currentList)
      }

      const previous = currentList[currentList.length - 1]
      if (arc !== undefined && previous !== undefined) {
        listUncertain ||= arc.uncertain
        currentList.push(...arcPoints(arc.center, previous, location, arc.clockwise))
      } else if (previous !== undefined && !onlySeparators) {
        // Follow the border between the two points, if we know it
        const key = borderKeyFromText(between, knownBorders)
        const chains = key !== null ? knownBorders[key] : undefined
        const path = chains !== undefined ? borderPath(chains, previous, location) : null
        if (path !== null) {
          currentList.push(...path)
        }
      }

      currentList.push(location)
      lastEndIdx = match.index + match[0].length
    }

    // Handle what's left
    const closing = directives.arcs.find((a) => a.closing && a.start >= lastEndIdx)
    listUncertain ||= closing?.uncertain === true
    flush(closing !== undefined ? closeWithArc(currentList, closing) : currentList)

    return features
  }
}
