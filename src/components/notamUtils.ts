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
import L, { LatLng } from 'leaflet'

type PositionKind = 'POINT' | 'AVG'

class Position {
  location: LatLng
  kind: PositionKind
  category: string | undefined

  constructor(kind: PositionKind, location: LatLng, category?: string) {
    this.kind = kind
    this.location = location
    this.category = category
  }

  toLayer(): Layer | null {
    return this.kind === 'POINT'
      ? L.circle(this.location, { radius: 1, color: 'red', weight: 10 })
      : null
  }
}

class Line {
  locations: LatLng[]

  constructor(locations: LatLng[]) {
    this.locations = locations
  }

  toLayer(): Layer | null {
    if (this.locations.length === 0) {
      return null
    } else if (this.locations.length === 1) {
      return new Position('POINT', this.locations[0] as LatLng).toLayer()
    } else {
      return L.polyline(this.locations, { color: 'maroon', stroke: true, weight: 5 })
    }
  }
}

export class NOTAM {
  text: string
  sections: Map<string, string>
  center: LatLng | null
  radiusNM: number | null
  polygons: Layer[]

  constructor(fullText: string) {
    this.text = fullText
    this.sections = this.splitSections(fullText)
    const center = this.extractCenter(this.sections.get('Q'))
    this.center = center != null ? center.center : null
    this.radiusNM = center != null ? center.radius : null
    this.polygons = this.findPolygons(this.sections.get('E'))
  }

  extractCenter(qSection: string | null | undefined): { center: LatLng; radius: number } | null {
    if (qSection == null) {
      // No Q section
      console.log('No Q section')
      return null
    }

    const rawLocation = qSection.split('/').at(-1)?.trim()
    if (rawLocation == undefined) {
      // Empty Q section
      console.log('Empty Q section')
      return null
    }

    const pattern = /^(\d+)(N|S)(\d+)(W|E)(\d+)$/
    const match = pattern.exec(rawLocation)
    if (match == null) {
      // No location found in last segment
      console.log('No match with location', rawLocation)
      return null
    }

    const center = this.parseLocation(match.slice(1, 5).join(''))
    if (center == null) {
      return null
    }

    // Check radius
    const rawRadius = match[5]
    if (rawRadius == undefined) {
      console.error('No radius found in Q section')
      return null
    }

    return {
      center,
      radius: parseInt(rawRadius),
    }
  }

  parseLocation(strLocation: string): LatLng | null {
    const match = /(\d+)(N|S)(\d+)(W|E)/.exec(strLocation)
    if (match == null) {
      // No location found in last segment
      console.log('Invalid location %s', strLocation)
      return null
    }

    const latNumbers = match[1]
    const latNS = match[2]
    const lonNumbers = match[3]
    const lonEW = match[4]
    if (
      latNumbers == undefined ||
      latNS == undefined ||
      lonNumbers == undefined ||
      lonEW == undefined
    ) {
      console.warn('Invalid location %s', strLocation)
      return null
    }

    return new LatLng(this.parseQAngle(latNumbers, latNS), this.parseQAngle(lonNumbers, lonEW))
  }

  parseQAngle(strAngle: string, hemisphere: string): number {
    const nbDegreesDigits = 'NS'.includes(hemisphere) ? 2 : 3
    const degrees = parseInt(strAngle.substring(0, nbDegreesDigits))

    let minutes = 0
    let seconds = 0

    const nextPart = strAngle.substring(nbDegreesDigits)
    if (nextPart.length == 2) {
      // Minutes only
      minutes = parseInt(nextPart)
    } else if (nextPart.length == 4) {
      // Minutes and seconds
      minutes = parseInt(nextPart.substring(0, 2))
      seconds = parseInt(nextPart.substring(2))
    } else {
      console.warn("Couldn't parse minutes")
    }

    const angle = degrees + minutes / 60 + seconds / 3600
    return 'SW'.includes(hemisphere) ? -angle : angle
  }

  splitSections(text: string): Map<string, string> {
    let currentSection: string | null = null
    let currentLine: string | null = null
    const sections = new Map<string, string>()
    for (let line of text.split('\n')) {
      line = line.trim()
      const match = line.match(/^(\W*)(?<section>[A-GQ])\)/)
      if (match != null && match.groups != null) {
        const foundSection = match.groups['section']
        if (foundSection !== undefined) {
          // Start of new section
          if (currentSection != null && currentLine != null) {
            // Store current section
            sections.set(currentSection, currentLine)
            currentLine = null
          }
          currentSection = foundSection
        }
      }

      if (currentLine == null) {
        currentLine = line
      } else {
        currentLine = `${currentLine}\n${line}`
      }
    }

    if (currentSection != null && currentLine != null) {
      // Store last section
      sections.set(currentSection, currentLine)
    }
    return sections
  }

  findPolygons(text: string | undefined): Layer[] {
    if (text === undefined) {
      // No E section given
      return []
    }

    const layers: Layer[] = []

    // Look for PSNs
    const psnPattern =
      /(?:(?<psnEn>\w+)\s+)?PSN(?:\s+(?<psnFr>[^:]+))?\s*:\s*(?<lat>\d+)(?<latNS>N|S)\s*(?<lon>\d+)(?<lonEW>E|W)(?:\s*(?<radiusNM>\d+)|.*(?:(?<radius>\d+)\s*(?<radiusUnit>NM|M|KM)))?/g

    let match
    while ((match = psnPattern.exec(text)) != null) {
      if (match.groups === undefined) {
        // Unexpected
        console.warn('Match but no groups for position %s', match[0])
        continue
      }

      const strLat = match.groups['lat']
      const strLatNS = match.groups['latNS']
      const strLon = match.groups['lon']
      const strLonEW = match.groups['lonEW']
      if (
        strLat === undefined ||
        strLatNS === undefined ||
        strLon === undefined ||
        strLonEW === undefined
      ) {
        continue
      }

      const lat = this.parseQAngle(strLat, strLatNS)
      const lon = this.parseQAngle(strLon, strLonEW)

      let kind: PositionKind
      const strKind = match.groups['psnFr'] ?? match.groups['psnEn']
      if (strKind !== undefined && ['AVG', 'AVERAGE', 'MOYENNE'].includes(strKind)) {
        kind = 'AVG'
      } else {
        kind = 'POINT'
      }

      const layer = new Position(kind, new LatLng(lat, lon)).toLayer()
      if (layer !== null) {
        layers.push(layer)
      }
    }

    // Look for fixing
    const foundFixingPoints = []
    const fixingPattern =
      /(?:(?:ANCRAGE(?:\s+(?<ancrage>\w+))?)|(?:(?<fixing>\w+\s+)?FIXING))(\s+[^:]+)?\s*:\s*(?<lat>\d+)(?<latNS>N|S)\s*(?<lon>\d+)(?<lonEW>E|W)\s*(?:(?:ALTITUDE|ELEV)\s*(?<alt>\d+)\s*(?<altUnit>FT|M))?/g
    while ((match = fixingPattern.exec(text)) != null) {
      if (match.groups === undefined) {
        // Unexpected
        continue
      }

      const strLat = match.groups['lat']
      const strLatNS = match.groups['latNS']
      const strLon = match.groups['lon']
      const strLonEW = match.groups['lonEW']
      if (
        strLat === undefined ||
        strLatNS === undefined ||
        strLon === undefined ||
        strLonEW === undefined
      ) {
        continue
      }

      const lat = this.parseQAngle(strLat, strLatNS)
      const lon = this.parseQAngle(strLon, strLonEW)
      // const strFixingPlace = match.groups['ancrage'] ?? match.groups['fixing']
      foundFixingPoints.push(new LatLng(lat, lon))
    }

    const fixingLayer = new Line(foundFixingPoints).toLayer()
    if (fixingLayer !== null) {
      layers.push(fixingLayer)
    }

    return layers
  }
}
