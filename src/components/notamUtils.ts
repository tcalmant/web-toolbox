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
import KnownAirfields, { type Airfield } from './airfields'
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
  let extra = NaN
  if (dotIdx != -1) {
    extra = parseFloat(strAngle.substring(dotIdx))
    strAngle = strAngle.substring(0, dotIdx)
  }

  let minutes = 0
  let seconds = 0

  const nextPart = strAngle.substring(nbDegreesDigits)
  if (nextPart.length == 2) {
    // Minutes only
    minutes = parseInt(nextPart)
    if (Number.isFinite(extra)) {
      // Add decimal part as seconds
      seconds = Math.round(extra * 60)
    }
  } else if (nextPart.length == 4) {
    // Minutes and seconds
    minutes = parseInt(nextPart.substring(0, 2))
    seconds = parseInt(nextPart.substring(2))
    if (Number.isFinite(extra)) {
      // Add decimal part to seconds
      seconds += extra
    }
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
    return null
  }

  const latNumbers = match[1]
  const latNS = match[2]
  const lonNumbers = match[3]
  const lonEW = match[4]
  if (!latNumbers || !latNS || !lonNumbers || !lonEW) {
    return null
  }

  const latitude = parseQAngle(latNumbers, latNS)
  if (isNaN(latitude) || Math.abs(latitude) > 90) {
    return null
  }

  const longitude = parseQAngle(lonNumbers, lonEW)
  if (isNaN(longitude) || Math.abs(longitude) > 180) {
    return null
  }

  return new LatLng(latitude, longitude)
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
    if (parts.length != 8) {
      throw new Error('Invalid Q section: ' + sectionText)
    }

    if (parts.map((p) => p?.length != 0).filter((p) => p).length === 0) {
      // All parts are empty
      throw new Error('Empty Q section')
    }

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
      return { center: null, radius: null }
    }

    const center = parseLocation(match.slice(1, 5).join(''))
    if (center == null) {
      return { center: null, radius: null }
    }

    // Check radius
    const rawRadius = match[5]
    if (rawRadius == undefined) {
      return { center: null, radius: null }
    }

    return {
      center,
      radius: parseInt(rawRadius),
    }
  }
}

/**
 * Reference to a SUP AIP document
 */
export class SupAipRef {
  /**
   * SUP AIP number
   */
  readonly id: number

  /**
   * SUP AIP year
   */
  readonly year: number

  /**
   * Whether this SUP AIP is an AIRAC edition
   */
  readonly isAirac: boolean

  /**
   * @param id The SUP AIP number
   * @param year The SUP AIP year (4 digits)
   * @param isAirac Whether this SUP AIP is an AIRAC edition
   */
  constructor(id: number, year: number, isAirac: boolean = false) {
    this.id = id
    this.year = year
    this.isAirac = isAirac
  }

  toString(): string {
    const strId = `${this.id.toString().padStart(3, '0')}/${this.year - 2000}`
    if (this.isAirac) {
      return `SUP AIP AIRAC ${strId}`
    }
    return `SUP AIP ${strId}`
  }

  /**
   * @returns The name of the corresponding PDF file on the SIA website
   */
  toPdfName(): string {
    if (this.isAirac) {
      return `lf_sup_a_${this.year}_${this.id.toString().padStart(3, '0')}_fr.pdf`
    }
    return `lf_sup_${this.year}_${this.id.toString().padStart(3, '0')}_fr.pdf`
  }
}

/**
 * Reference to a SERA Implementing Regulation
 */
export class IrSeraRef {
  /**
   * IR SERA number
   */
  readonly id: number

  /**
   * IR SERA year
   */
  readonly year: number

  /**
   * @param id The IR SERA number
   * @param year The IR SERA year (4 digits)
   */
  constructor(id: number, year: number) {
    this.id = id
    this.year = year
  }

  toString(): string {
    return `IR SERA ${this.year}/${this.id.toString().padStart(3, '0')}`
  }

  toUrl(): string {
    return `https://eur-lex.europa.eu/eli/reg_impl/${this.year}/${this.id}/oj`
  }
}

/**
 * Relative location from a point, e.g. 030/5NM
 */
export class RelativeLocation {
  /**
   * Azimuth in degrees (0-360)
   */
  readonly azimuth: number

  /**
   * Distance in NM
   */
  readonly distanceNM: number

  /**
   * Base airfield used as reference
   */
  readonly baseAirfield: Airfield

  /**
   * @param azimuth Azimuth in degrees (0-360)
   * @param distanceNM Distance in NM
   * @param baseAirfield Base airfield ICAO code
   */
  constructor(azimuth: number, distanceNM: number, baseAirfield: Airfield) {
    this.azimuth = azimuth
    this.distanceNM = distanceNM
    this.baseAirfield = baseAirfield
  }

  /**
   * Converts the relative location to a LatLng object.
   *
   * @returns The referenced location as LatLng or null if inputs are invalid.
   */
  toLatLng(): LatLng | null {
    // Validate inputs
    if (this.distanceNM <= 0 || this.distanceNM > 1000) {
      console.warn('Invalid distance: must be between 0 and 1000 NM')
      return null
    }
    if (this.azimuth < 0 || this.azimuth >= 360) {
      console.warn('Invalid azimuth: must be between 0 and 360 degrees')
      return null
    }

    // Constants
    const EARTH_RADIUS_NM = 3440.065 // Earth radius in nautical miles
    // Convert degrees to radians
    const bearingRad = (this.azimuth * Math.PI) / 180
    const lat1Rad = (this.baseAirfield.latitude * Math.PI) / 180
    const lon1Rad = (this.baseAirfield.longitude * Math.PI) / 180

    // Calculate the destination latitude
    const angularDistance = this.distanceNM / EARTH_RADIUS_NM
    const lat2Rad = Math.asin(
      Math.sin(lat1Rad) * Math.cos(angularDistance) +
        Math.cos(lat1Rad) * Math.sin(angularDistance) * Math.cos(bearingRad),
    )

    // Calculate the destination longitude
    const lon2Rad =
      lon1Rad +
      Math.atan2(
        Math.sin(bearingRad) * Math.sin(angularDistance) * Math.cos(lat1Rad),
        Math.cos(angularDistance) - Math.sin(lat1Rad) * Math.sin(lat2Rad),
      )

    // Convert back to degrees and normalize longitude
    const lat2Deg = (lat2Rad * 180) / Math.PI
    const lon2Deg = (((lon2Rad * 180) / Math.PI + 540) % 360) - 180

    return new LatLng(lat2Deg, lon2Deg)
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
  readonly linkedSupAIPs: SupAipRef[] = []
  readonly linkedIrSera: IrSeraRef[] = []

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
    this.polygons = this.findPolygons(this.sectionA?.target, this.rawSections.get('E'))

    // Find linked SUP/AIP references
    this.linkedSupAIPs = this.findSupAIPRefs(this.rawSections.get('E'))
    // ... and IR SERA references
    this.linkedIrSera = this.findIrSeraRefs(this.rawSections.get('E'))
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
      const match = row.match(/([A-Za-z0-9/-]{4,})$/)
      if (match != null && match[1]) {
        return match[1]
      }
    }
    return idx.toString()
  }

  knownPoint(knownPoints: LatLng[], point: LatLng): boolean {
    return knownPoints.find((p) => p.equals(point, 1e-5)) !== undefined
  }

  findPolygons(target: string | undefined, text: string | undefined): Layer[] {
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
      const strKind = (match.groups['psnFr'] ?? match.groups['psnEn'])?.trim()?.toUpperCase()
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
      /(?:(?:ANCRAGE(?:\s+(?<ancrage>\w+))?)|(?:(?<fixing>\w+\s+)?FIXING))[\W]*(?<lat>\d+(\.\d+)?)(?<latNS>N|S)\s*(?<lon>\d+(\.\d+)?)(?<lonEW>E|W)\s*(?:(?:ALTITUDE|ELEV)\s*(?<alt>\d+)\s*(?<altUnit>FT|M))?/g
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

    // Concatenate known points to ignore them later
    const allKnownPoints = foundPSNPoints.concat(foundFixingPoints)

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

      if (this.knownPoint(allKnownPoints, latLng)) {
        // Ignore known points
        continue
      }

      const separator = text.substring(lastEndIdx, match.index - 1).trim()
      // Consider spaces, commas and "TO" as polygon separators
      if (
        lastEndIdx != 0 &&
        separator.length != 0 &&
        !separator.match(/\s*(?:AS|FROM|TO|AT|,|;|-)\s*$/)
      ) {
        // Found text between previous and current number: consider the current list as a polygon
        if (currentList.length == 0) {
          // Single point found between markers
          currentList.push(latLng)
        }

        if (currentList.length == 1) {
          // Check if the point is already represented as a position
          if (!this.knownPoint(allKnownPoints, currentList[0]!)) {
            // New point detected
            const layer = new Position('POINT', currentList[0]!).toLayer()
            if (layer !== null) {
              layers.push(layer)
            }
          }
        } else if (currentList.length == 2) {
          // Check if the line is already represented as a fixing
          if (
            !this.knownPoint(allKnownPoints, currentList[0]!) &&
            !this.knownPoint(allKnownPoints, currentList[1]!)
          ) {
            // New line detected
            const layer = new Line(currentList).toLayer()
            if (layer !== null) {
              layers.push(layer)
            }
          }
        } else if (currentList.length > 2) {
          const layer = new Polygon(currentList).toLayer()
          if (layer !== null) {
            layers.push(layer)
          }
        }

        currentList = []
      }

      // Store the last point
      currentList.push(latLng)

      lastEndIdx = match.index + match[0].length
    }

    // Handle what's left
    if (currentList.length != 0) {
      const layer = new Polygon(currentList).toLayer()
      if (layer !== null) {
        layers.push(layer)
      }
    }

    // Look for relative locations, only if no other location has been found
    if (layers.length == 0) {
      const relativePlacePattern =
        /RDL\s*(?<azimuth>\d{2,3})\s*\/\s*(?<distance>\d+([.,]\d+))\s*(?<unit>\w+)/gm

      while ((match = relativePlacePattern.exec(text)) != null) {
        if (match.groups === undefined) {
          // Unexpected
          continue
        }

        const strAzimuth = match.groups['azimuth']
        const strDistance = match.groups['distance']
        const strUnit = match.groups['unit']
        if (!strAzimuth || !strDistance || !strUnit) {
          continue
        }

        const azimuth = parseInt(strAzimuth)
        if (isNaN(azimuth) || azimuth < 0 || azimuth >= 360) {
          // Invalid azimuth
          continue
        }

        let distance = parseFloat(strDistance.replace(',', '.'))
        if (isNaN(distance) || distance <= 0) {
          // Invalid distance
          continue
        }

        const unit = strUnit.toUpperCase()
        if (unit == 'M' || unit == 'METERS' || unit == 'METRES') {
          // Convert meters to NM
          distance /= 1852
        } else if (unit == 'KM' || unit == 'KILOMETERS' || unit == 'KILOMETRES') {
          // Convert kilometers to NM
          distance /= 1.852
        } else if (unit != 'NM' && unit != 'NAUTICALMILES') {
          // Unknown unit
          continue
        }

        // Find the base airfield: look for the ICAO code right after the match
        const afterMatch = text.substring(match.index + match[0].length)
        const airfieldMatch = afterMatch.match(/\b([A-Z]{4})\b/)
        let baseAirfield: string
        if (
          airfieldMatch == null ||
          airfieldMatch.index === undefined ||
          airfieldMatch[1] === undefined ||
          airfieldMatch?.index > 10
        ) {
          if (!target) {
            // No target airfield given: ignore
            continue
          }
          // No airfield found, or airfield index is too far: use section A
          baseAirfield = target
        } else {
          // Use the found airfield
          baseAirfield = airfieldMatch[1]
        }

        if (!baseAirfield || ['FATO', 'LFFF', 'LFXX'].includes(baseAirfield)) {
          // Ignore FATO references and nation-wide NOTAMs
          continue
        }

        // Check if the base airfield is known
        const airfieldData = KnownAirfields[baseAirfield]
        if (airfieldData === undefined) {
          // Unknown airfield
          continue
        }

        // Create the relative location
        const relativeLocation = new RelativeLocation(azimuth, distance, airfieldData)
        const center = relativeLocation.toLatLng()
        if (center !== null) {
          const layer = new Position('AREA', center).toLayer()
          if (layer !== null) {
            layers.push(layer)
          }
        }
      }
    }

    return layers
  }

  /**
   * Looks for SUP AIP references in the given text.
   *
   * @param text Section E text
   * @returns The list of SUP AIP references found in the text
   */
  findSupAIPRefs(text: string | undefined): SupAipRef[] {
    if (!text) {
      return []
    }

    const supAipPattern = /SUP\s*AIP\s*(?<airac>AIRAC)?\s*(?<id>\d+)\s*\/\s*(?<year>\d+)/gim

    let match

    const foundSupAipRefs: SupAipRef[] = []
    while ((match = supAipPattern.exec(text)) !== null) {
      if (match.groups === undefined) {
        // Unexpected
        continue
      }

      const strId = match.groups['id']
      if (!strId) {
        // No ID: ignore
        continue
      }

      const strYear = match.groups['year']
      if (!strYear) {
        // No year: ignore
        continue
      }

      const id = parseInt(strId)
      if (isNaN(id) || id < 1) {
        // Invalid ID
        console.debug('Ignoring invalid SUP AIP ID: ' + strId)
        continue
      }

      let year = parseInt(strYear)
      if (isNaN(year) || year < 0) {
        // Invalid year
        console.debug('Ignoring invalid SUP AIP year: ' + strYear)
        continue
      }

      if (year < 100) {
        // Two-digit year: convert to four-digit
        year += 2000
      }

      const isAirac = match.groups['airac'] !== undefined

      const supAip = new SupAipRef(id, year, isAirac)
      // Avoid duplicates
      if (foundSupAipRefs.find((s) => s.id == supAip.id && s.year == supAip.year) !== undefined) {
        continue
      }

      foundSupAipRefs.push(supAip)
    }

    // Sort by year then ID
    foundSupAipRefs.sort((a, b) => {
      if (a.year != b.year) {
        return a.year - b.year
      }
      return a.id - b.id
    })

    return foundSupAipRefs
  }

  /**
   * Looks for IR SERA references in the given text.
   *
   * @param text Section E text
   * @returns The list of IR SERA references found in the text
   */
  findIrSeraRefs(text: string | undefined): IrSeraRef[] {
    if (!text) {
      return []
    }

    const irSeraPattern = /IR SERA\s*(?<year>\d{2,4})\/(?<id>\d+)/gim

    let match

    const foundIrSeraRefs: IrSeraRef[] = []
    while ((match = irSeraPattern.exec(text)) !== null) {
      if (match.groups === undefined) {
        // Unexpected
        continue
      }

      const strId = match.groups['id']
      if (!strId) {
        // No ID: ignore
        continue
      }

      const strYear = match.groups['year']
      if (!strYear) {
        // No year: ignore
        continue
      }

      const id = parseInt(strId)
      if (isNaN(id) || id < 1) {
        // Invalid ID
        console.debug('Ignoring invalid SUP AIP ID: ' + strId)
        continue
      }

      let year = parseInt(strYear)
      if (isNaN(year) || year < 0) {
        // Invalid year
        console.debug('Ignoring invalid SUP AIP year: ' + strYear)
        continue
      }

      if (year < 100) {
        // Two-digit year: convert to four-digit
        year += 2000
      }

      const irSera = new IrSeraRef(id, year)
      // Avoid duplicates
      if (foundIrSeraRefs.find((s) => s.id == irSera.id && s.year == irSera.year) !== undefined) {
        continue
      }

      foundIrSeraRefs.push(irSera)
    }

    // Sort by year then ID
    foundIrSeraRefs.sort((a, b) => {
      if (a.year != b.year) {
        return a.year - b.year
      }
      return a.id - b.id
    })

    return foundIrSeraRefs
  }
}
