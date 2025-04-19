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
import type { PositionKind } from './geometry'
import { Line, Polygon, Position } from './geometry'

/**
 * Parses an angle as seen in the Q section, e.g. 4500N or 00500E
 *
 * Also supports longer formats with seconds (450055N or 0050055E) and ignores
 * additional precision
 *
 * @param strAngle String representation of the angle
 * @param hemisphere Target hemisphere (N, S, E or W)
 * @returns The value of the parsed angle
 */
function parseQAngle(strAngle: string, hemisphere: string): number {
  const nbDegreesDigits = 'NS'.includes(hemisphere) ? 2 : 3
  const degrees = parseInt(strAngle.substring(0, nbDegreesDigits))

  // Ignore decimals on ultra-precise locations
  const dotIdx = strAngle.indexOf('.', nbDegreesDigits)
  if (dotIdx != -1) {
    strAngle = strAngle.substring(0, dotIdx)
  }

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

/**
 * Parses a location, i.e. two angles
 *
 * @param strLocation Location as a string
 * @returns The parsed location or null
 */
function parseLocation(strLocation: string): LatLng | null {
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
  if (!latNumbers || !latNS || !lonNumbers || !lonEW) {
    console.warn('Invalid location %s', strLocation)
    return null
  }

  return new LatLng(parseQAngle(latNumbers, latNS), parseQAngle(lonNumbers, lonEW))
}

export class SectionA {
  readonly target: string

  constructor(sectionText: string) {
    this.target = sectionText.trim()
  }
}

export class SectionQ {
  readonly fir: string
  readonly qCode: string | null
  readonly trafic: string | null // 'I' | 'V' | 'IV'
  readonly object: string | null // 'N' | 'B' | 'O' | 'M'
  readonly scope: string | null // 'A' | 'E' | 'W' | 'AE' | 'AW'
  readonly limitLow: string | null
  readonly limitHigh: string | null
  readonly center: LatLng | null
  readonly radiusNM: number | null

  constructor(sectionText: string) {
    const parts = sectionText.split('/').map((s) => s.trim())
    this.fir = parts[0] ?? ''
    this.qCode = parts[1] ?? null
    this.trafic = parts[2] ?? null
    this.object = parts[3] ?? null
    this.scope = parts[4] ?? null
    this.limitLow = parts[5] ?? null
    this.limitHigh = parts[6] ?? null

    const { center, radius } = this.extractCenter(parts[7])
    this.center = center
    this.radiusNM = radius
  }

  extractCenter(locationPart: string | null | undefined): {
    center: LatLng | null
    radius: number | null
  } {
    if (!locationPart) {
      return { center: null, radius: null }
    }

    const pattern = /^(\d+)(N|S)(\d+)(W|E)(\d+)$/
    const match = pattern.exec(locationPart)
    if (match == null) {
      // No location found in last segment
      console.log('No match with location', locationPart)
      return { center: null, radius: null }
    }

    const center = parseLocation(match.slice(1, 5).join(''))
    if (center == null) {
      return { center: null, radius: null }
    }

    // Check radius
    const rawRadius = match[5]
    if (rawRadius == undefined) {
      console.error('No radius found in Q section')
      return { center: null, radius: null }
    }

    return {
      center,
      radius: parseInt(rawRadius),
    }
  }
}

export class NOTAM {
  readonly idx: number
  readonly id: string
  readonly text: string
  readonly rawSections: Map<string, string>
  readonly polygons: Layer[]
  readonly sectionA: SectionA | null
  readonly sectionQ: SectionQ | null

  constructor(fullText: string, idx: number) {
    this.idx = idx

    // Parse block
    this.text = fullText
    this.rawSections = this.splitSections(fullText)

    // Compute ID
    this.id = this.extractId(idx, this.rawSections.get('HEADER'))

    // Parse sections
    let sectionContent = this.rawSections.get('A')
    this.sectionA = sectionContent ? new SectionA(sectionContent) : null

    sectionContent = this.rawSections.get('Q')
    this.sectionQ = sectionContent ? new SectionQ(sectionContent) : null

    // Find polygons
    this.polygons = this.findPolygons(this.rawSections.get('E'))
  }

  splitSections(text: string): Map<string, string> {
    let currentSection: string = 'HEADER'
    let currentBlock: string[] = []
    const sections = new Map<string, string>()
    for (let line of text.split('\n')) {
      line = line.trim()
      const match = line.match(/^(\W*)(?<section>[A-GQ])\)/)
      if (match != null && match.groups != null && match.index !== undefined) {
        const foundSection = match.groups['section']
        if (foundSection !== undefined) {
          // Start of new section: update & store the current block
          currentBlock.push(line.substring(0, match.index).trim())
          sections.set(currentSection, currentBlock.filter((s) => s.length != 0).join('\n'))

          // Reset content
          currentBlock = []
          currentSection = foundSection
        }

        line = line.substring(match.index + match[0].length).trim()
      }

      currentBlock.push(line)
    }

    if (currentBlock.length > 0) {
      // Store last section
      sections.set(currentSection, currentBlock.filter((s) => s.length != 0).join('\n'))
    }
    return sections
  }

  extractId(idx: number, header: string | undefined): string {
    if (!header) {
      return idx.toString()
    }

    for (let row of header.split('\n')) {
      row = row.trim()
      const match = row.match(/^([A-Za-z0-9/-]{4,})$/)
      if (match != null && match[1]) {
        return match[1]
      }
    }
    return idx.toString()
  }

  findPolygons(text: string | undefined): Layer[] {
    if (!text) {
      // No E section given
      return []
    }

    const layers: Layer[] = []

    // Look for PSNs
    const psnPattern =
      /(?:(?<psnEn>\w+)\s+)?PSN(?:\s+(?<psnFr>[^:]+))?\s*:\s*(?<lat>\d+(.\d+)?)(?<latNS>N|S)\s*(?<lon>\d+(.\d+)?)(?<lonEW>E|W)(?:\s*(?<radiusNM>\d+)|.*(?:(?<radius>\d+)\s*(?<radiusUnit>NM|M|KM)))?/g

    let match

    const foundPSNPoints: LatLng[] = []
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
      if (!strLat || !strLatNS || !strLon || !strLonEW) {
        continue
      }

      const lat = parseQAngle(strLat, strLatNS)
      const lon = parseQAngle(strLon, strLonEW)

      let kind: PositionKind
      const strKind = match.groups['psnFr'] ?? match.groups['psnEn']
      if (strKind !== undefined && ['AVG', 'AVERAGE', 'MOYENNE'].includes(strKind)) {
        kind = 'AVG'
      } else {
        kind = 'POINT'
      }

      const psn = new LatLng(lat, lon)
      foundPSNPoints.push(psn)

      const layer = new Position(kind, psn).toLayer()
      if (layer !== null) {
        layers.push(layer)
      }
    }

    // Look for fixing
    const foundFixingPoints: LatLng[] = []
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
      if (!strLat || !strLatNS || !strLon || !strLonEW) {
        continue
      }

      const lat = parseQAngle(strLat, strLatNS)
      const lon = parseQAngle(strLon, strLonEW)
      foundFixingPoints.push(new LatLng(lat, lon))
    }

    const fixingLayer = new Line(foundFixingPoints).toLayer()
    if (fixingLayer !== null) {
      layers.push(fixingLayer)
    }

    // Look for other locations
    const latLngPattern =
      /(?<lat>\d{4,6}(?:.\d*)?)(?<latNS>N|S)\s*(?<lon>\d{5,7}(?:.\d*)?)(?<lonEW>E|W)/g

    let currentList: LatLng[] = []
    let lastEndIdx = 0
    while ((match = latLngPattern.exec(text)) != null) {
      if (match.groups === undefined) {
        // Unexpected
        continue
      }

      const strLat = match.groups['lat']
      const strLatNS = match.groups['latNS']
      const strLon = match.groups['lon']
      const strLonEW = match.groups['lonEW']
      if (!strLat || !strLatNS || !strLon || !strLonEW) {
        continue
      }

      const lat = parseQAngle(strLat, strLatNS)
      const lon = parseQAngle(strLon, strLonEW)
      const latLng = new LatLng(lat, lon)

      if (foundPSNPoints.includes(latLng) || foundFixingPoints.includes(latLng)) {
        // Ignore known points
        continue
      }

      // Store the new point
      currentList.push(latLng)

      const separator = text.substring(lastEndIdx, match.index - 1).trim()
      // Consider spaces, commas and "TO" as polygon separators
      if (separator.length != 0 && !separator.match(/\s*(?:AS|FROM|TO|AT|,|;|-)\s*$/)) {
        // Found text between previous and current number
        const layer = new Polygon(currentList).toLayer()
        if (layer !== null) {
          layers.push(layer)
        }

        currentList = []
      }

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
