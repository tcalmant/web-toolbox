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

import type { GeoPoint } from './geo'
import type { GeometryFeature } from './geometry'
import { Line, Polygon, Position } from './geometry'

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

  constructor(fullText: string) {
    this.text = fullText
    this.polygons = this.findAIPPolygons(fullText)
  }

  parseAIPLocation(aipRegexMatch: RegExpMatchArray): GeoPoint | null {
    if (aipRegexMatch.groups == null) {
      return null
    }

    const strLatDeg = aipRegexMatch.groups['latDeg']
    const strLatMin = aipRegexMatch.groups['latMin']
    const strLatSec = aipRegexMatch.groups['latSec']
    const strLatNS = aipRegexMatch.groups['latNS']
    const strLonDeg = aipRegexMatch.groups['lonDeg']
    const strLonMin = aipRegexMatch.groups['lonMin']
    const strLonSec = aipRegexMatch.groups['lonSec']
    const strLonEW = aipRegexMatch.groups['lonEW']
    if (
      strLatDeg === undefined ||
      strLatNS === undefined ||
      strLonDeg === undefined ||
      strLonEW === undefined
    ) {
      return null
    }

    let lat = parseInt(strLatDeg)
    if (strLatMin !== undefined) {
      lat += parseInt(strLatMin) / 60
      if (strLatSec !== undefined) {
        lat += parseInt(strLatSec) / 3600
      }
    }

    let lon = parseInt(strLonDeg)
    if (strLonMin !== undefined) {
      lon += parseInt(strLonMin) / 60
      if (strLonSec !== undefined) {
        lon += parseInt(strLonSec) / 3600
      }
    }

    return { lat, lng: lon }
  }

  findAIPPolygons(text: string | undefined): GeometryFeature[] {
    if (text === undefined) {
      // No text given
      return []
    }

    // Look for AIP-formatted locations
    const aipLocation =
      /(?<latDeg>\d{2})°(?:(?:(?<latMin>\d{1,2})(?:'|’))(?:(?<latSec>\d{1,2})(?:\.\d+)?(?:"|(?:'|’){2}))?)?\s*(?<latNS>N|S),?\s*-?\s*(?<lonDeg>\d{1,3}°(?:(?:(?<lonMin>\d{1,2})(?:'|’))(?:(?<lonSec>\d{1,2})(?:\.\d+)?(?:"|(?:'|’){2}))?)?)\s*(?<lonEW>[EW])/g

    const features: GeometryFeature[] = []
    let currentList: GeoPoint[] = []
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
        continue
      }

      if (text.substring(lastEndIdx, match.index - 1).trim().length != 0) {
        // Found text between previous and current number
        const feature = toGeometryFeature(currentList)
        if (feature !== null) {
          features.push(feature)
        }

        currentList = []
      }

      currentList.push(location)
      lastEndIdx = match.index + match[0].length
    }

    // Handle what's left
    const feature = toGeometryFeature(currentList)
    if (feature !== null) {
      features.push(feature)
    }

    return features
  }
}
