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

import type { Layer } from 'leaflet'
import { LatLng } from 'leaflet'
import { Polygon } from './geometry'

export class AIP {
  text: string
  polygons: Layer[]

  constructor(fullText: string) {
    this.text = fullText
    this.polygons = this.findAIPPolygons(fullText)
  }

  parseAIPLocation(aipRegexMatch: RegExpMatchArray): LatLng | null {
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

    return new LatLng(lat, lon)
  }

  findAIPPolygons(text: string | undefined): Layer[] {
    if (text === undefined) {
      // No text given
      return []
    }

    // Look for AIP-formatted locations
    const aipLocation =
      /(?<latDeg>\d{2})°(?:(?:(?<latMin>\d{1,2})(?:'|’))(?:(?<latSec>\d{1,2})(?:"|(?:'|’){2}))?)?\s*(?<latNS>N|S),?\s*(?<lonDeg>\d{1,3}°(?:(?:(?<lonMin>\d{1,2})(?:'|’))(?:(?<lonSec>\d{1,2})(?:"|(?:'|’){2}))?)?)\s*(?<lonEW>[EW])/g

    const layers = []
    let currentList: LatLng[] = []
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
        const layer = new Polygon(currentList).toLayer()
        if (layer !== null) {
          layers.push(layer)
        }

        currentList = []
      }

      currentList.push(location)
      lastEndIdx = match.index + match[0].length
    }

    // Handle what's left
    if (currentList.length != 0) {
      const layer = new Polygon(currentList).toLayer()
      if (layer !== null) {
        layers.push(layer)
      }
    }

    return layers
  }
}
