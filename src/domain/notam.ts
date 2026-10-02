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

import type { Airfield } from './airfields'
import KnownAirfields from '@/adapters/data/airfieldsRepository'
import type { GeoPoint } from './geo'
import { arcPoints, geoPointsEqual } from './geo'
import type { GeometryFeature, PositionKind } from './geometry'
import { Circle, Line, Polygon, Position } from './geometry'
import { findShapeDirectives } from './shapeDirectives'

// A single lat/lon pair in Q-code style (e.g. 4500N00500E or 450055N0050055E)
const LAT_LNG_SOURCE = String.raw`(?<lat>\d{4,6}(?:\.\d*)?)(?<latNS>N|S)\s*(?<lon>\d{5,7}(?:\.\d*)?)(?<lonEW>E|W)`

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
 * Reads lat/lon angle groups out of a regex match and turns them into a GeoPoint.
 *
 * @param groups Named capture groups, expected to contain lat/latNS/lon/lonEW
 * @returns The parsed point, or null if any group is missing
 */
function latLngFromGroups(groups: Record<string, string | undefined>): GeoPoint | null {
  const strLat = groups['lat']
  const strLatNS = groups['latNS']
  const strLon = groups['lon']
  const strLonEW = groups['lonEW']
  if (!strLat || !strLatNS || !strLon || !strLonEW) {
    return null
  }

  return {
    lat: parseQAngle(strLat, strLatNS),
    lng: parseQAngle(strLon, strLonEW),
  }
}

/**
 * Parses a location, i.e. two angles
 *
 * @param strLocation Location as a string
 * @returns The parsed location or null
 */
function parseLocation(strLocation: string): GeoPoint | null {
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

  return { lat: latitude, lng: longitude }
}

/**
 * Parses a "id/year" pair as found in SUP AIP and IR SERA references.
 *
 * @param strId The raw id
 * @param strYear The raw year (2 or 4 digits)
 * @param context Label used in debug messages (e.g. "SUP AIP" or "IR SERA")
 * @returns The parsed id/year, or null if invalid
 */
function parseIdYear(
  strId: string | undefined,
  strYear: string | undefined,
  context: string,
): { id: number; year: number } | null {
  if (!strId) {
    // No ID: ignore
    return null
  }
  if (!strYear) {
    // No year: ignore
    return null
  }

  const id = parseInt(strId)
  if (isNaN(id) || id < 1) {
    console.debug(`Ignoring invalid ${context} ID: ` + strId)
    return null
  }

  let year = parseInt(strYear)
  if (isNaN(year) || year < 0) {
    console.debug(`Ignoring invalid ${context} year: ` + strYear)
    return null
  }

  if (year < 100) {
    // Two-digit year: convert to four-digit
    year += 2000
  }

  return { id, year }
}

const MONTHS: Record<string, number> = {
  JAN: 0,
  FEB: 1,
  FEV: 1,
  MAR: 2,
  APR: 3,
  AVR: 3,
  MAY: 4,
  MAI: 4,
  JUN: 5,
  JUL: 6,
  AUG: 7,
  AOU: 7,
  SEP: 8,
  OCT: 9,
  NOV: 10,
  DEC: 11,
}

/**
 * Validity period of a NOTAM
 */
export interface NotamValidity {
  /** Start of validity, null if unknown */
  from: Date | null
  /** End of validity, null if unknown or permanent */
  to: Date | null
  /** True if the NOTAM never ends (PERM) */
  permanent: boolean
  /** True if the end date is estimated (EST) */
  estimated: boolean
}

export type NotamStatus = 'active' | 'future' | 'expired' | 'unknown'

/**
 * Parses a date as found in NOTAMs, always in UTC.
 *
 * Supported formats: ICAO (YYMMDDHHMM), Sofia Briefing ("26 02 2025 16:00")
 * and with a month name ("26 FEB 2025 16:00").
 *
 * @param text The raw date, without PERM/EST markers
 * @returns The parsed date, or null if unsupported
 */
export function parseNotamDate(text: string): Date | null {
  text = text.trim()

  let year: number, month: number, day: number, hour: number, minute: number
  let match = /^(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/.exec(text)
  if (match) {
    year = 2000 + parseInt(match[1]!)
    month = parseInt(match[2]!) - 1
    day = parseInt(match[3]!)
    hour = parseInt(match[4]!)
    minute = parseInt(match[5]!)
  } else if (
    (match = /^(\d{1,2})[\s/.-](\d{1,2})[\s/.-](\d{4})\s+(\d{1,2})[:Hh]?(\d{2})$/.exec(text))
  ) {
    day = parseInt(match[1]!)
    month = parseInt(match[2]!) - 1
    year = parseInt(match[3]!)
    hour = parseInt(match[4]!)
    minute = parseInt(match[5]!)
  } else if (
    (match = /^(\d{1,2})\s+([A-Za-z]{3})[A-Za-z]*\.?\s+(\d{4})\s+(\d{1,2})[:Hh]?(\d{2})$/.exec(
      text,
    ))
  ) {
    const monthIdx = MONTHS[match[2]!.toUpperCase()]
    if (monthIdx === undefined) {
      return null
    }
    day = parseInt(match[1]!)
    month = monthIdx
    year = parseInt(match[3]!)
    hour = parseInt(match[4]!)
    minute = parseInt(match[5]!)
  } else {
    return null
  }

  if (month < 0 || month > 11 || day < 1 || day > 31 || hour > 24 || minute > 59) {
    return null
  }
  const date = new Date(Date.UTC(year, month, day, hour, minute))
  // Reject overflowing days (e.g. 31 February)
  return date.getUTCDate() === day || hour === 24 ? date : null
}

/**
 * Formats a date for display, in UTC
 *
 * @param date The date to format
 * @returns "YYYY-MM-DD HH:MMZ", or an empty string for null
 */
export function formatNotamDate(date: Date | null): string {
  if (date === null) {
    return ''
  }
  return date.toISOString().substring(0, 16).replace('T', ' ') + 'Z'
}

/**
 * Parses one bound of a validity period.
 *
 * @param text Raw value, e.g. "26 02 2025 16:00 EST" or "PERM"
 * @returns The date, plus the PERM and EST markers
 */
function parseValidityBound(text: string | undefined): {
  date: Date | null
  perm: boolean
  est: boolean
} {
  if (!text) {
    return { date: null, perm: false, est: false }
  }
  const perm = /\bPERM\b/i.test(text)
  const est = /\bEST\b/i.test(text)
  const cleaned = text.replace(/\b(PERM|EST)\b/gi, '').trim()
  return { date: perm ? null : parseNotamDate(cleaned), perm, est }
}

/**
 * Builds the validity of a NOTAM from the B)/C) sections, or from the
 * "DU: ... AU: ..." line written by Sofia Briefing in the header.
 */
function parseValidity(
  header: string | undefined,
  sectionB: string | undefined,
  sectionC: string | undefined,
): NotamValidity | null {
  let rawFrom = sectionB?.trim()
  let rawTo = sectionC?.trim()

  if (!rawFrom && !rawTo && header) {
    const match = /\bDU\s*:?\s*(?<from>.+?)\s+AU\s*:?\s*(?<to>.+)$/im.exec(header)
    rawFrom = match?.groups?.['from']
    rawTo = match?.groups?.['to']
  }
  if (!rawFrom && !rawTo) {
    return null
  }

  const from = parseValidityBound(rawFrom)
  const to = parseValidityBound(rawTo)
  return {
    from: from.date,
    to: to.date,
    permanent: to.perm,
    estimated: to.est,
  }
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
  readonly center: GeoPoint | null
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
    center: GeoPoint | null
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
   * @param lang Language code ('fr' or 'en')
   * @returns The names of the corresponding PDF file on the SIA website, in order of probability
   */
  toPdfNames(lang: 'fr' | 'en' = 'fr'): string[] {
    const airacName = `lf_sup_a_${this.year}_${this.id.toString().padStart(3, '0')}_${lang}.pdf`
    if (this.isAirac) {
      return [airacName]
    } else {
      return [`lf_sup_${this.year}_${this.id.toString().padStart(3, '0')}_${lang}.pdf`, airacName]
    }
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
   * Converts the relative location to a GeoPoint.
   *
   * @returns The referenced location, or null if inputs are invalid.
   */
  toPoint(): GeoPoint | null {
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

    return { lat: lat2Deg, lng: lon2Deg }
  }
}

export class NOTAM {
  readonly idx: number
  readonly id: string
  readonly text: string
  readonly rawSections: Map<string, string>
  readonly polygons: GeometryFeature[]
  readonly sectionA: SectionA | null
  readonly sectionQ: SectionQ | null
  readonly linkedSupAIPs: SupAipRef[] = []
  readonly linkedIrSera: IrSeraRef[] = []
  readonly validity: NotamValidity | null
  /** Section D: activity schedule */
  readonly schedule: string | null
  /** Section F: lower limit */
  readonly lowerLimit: string | null
  /** Section G: upper limit */
  readonly upperLimit: string | null

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

    // Validity, schedule and limits
    this.validity = parseValidity(
      this.rawSections.get('HEADER'),
      this.rawSections.get('B'),
      this.rawSections.get('C'),
    )
    this.schedule = this.rawSections.get('D') ?? null
    this.lowerLimit = this.rawSections.get('F') ?? null
    this.upperLimit = this.rawSections.get('G') ?? null

    // Find polygons
    this.polygons = this.findPolygons(this.sectionA?.target, this.rawSections.get('E'))

    // Find linked SUP/AIP references
    this.linkedSupAIPs = this.findSupAIPRefs(this.rawSections.get('E'))
    // ... and IR SERA references
    this.linkedIrSera = this.findIrSeraRefs(this.rawSections.get('E'))
  }

  /**
   * Returns true if the NOTAM matches the given search string.
   *
   * @param search Search string
   * @returns True if the NOTAM matches the search string
   */
  public matchesSearch(search: string): boolean {
    // Normalize search string
    search = search.toLowerCase()

    // Check ID
    if (this.id.toLowerCase().includes(search)) {
      return true
    }

    // Check text
    return this.text.toLowerCase().includes(search)
  }

  /**
   * Computes the status of the NOTAM at the given time.
   *
   * @param now Reference time
   * @returns The status, 'unknown' if no usable validity was found
   */
  public statusAt(now: Date = new Date()): NotamStatus {
    const validity = this.validity
    if (!validity || (!validity.from && !validity.to && !validity.permanent)) {
      return 'unknown'
    }
    if (validity.from && now < validity.from) {
      return 'future'
    }
    if (validity.to && now > validity.to) {
      return 'expired'
    }
    return validity.from || validity.to || validity.permanent ? 'active' : 'unknown'
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

        // ICAO layout: "A) LFBB B) 2501211522 C) PERM" on a single line
        let inline: RegExpMatchArray | null
        while (
          'ABC'.includes(currentSection) &&
          (inline = line.match(/(?:^|\s)(?<next>[B-D])\)\s*/)) != null &&
          inline.groups?.['next'] !== undefined &&
          inline.groups['next'] > currentSection
        ) {
          currentBlock.push(line.substring(0, inline.index).trim())
          sections.set(currentSection, currentBlock.filter((s) => s.length != 0).join('\n'))
          currentBlock = []
          currentSection = inline.groups['next']
          line = line.substring((inline.index ?? 0) + inline[0].length).trim()
        }
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

  knownPoint(knownPoints: GeoPoint[], point: GeoPoint): boolean {
    return knownPoints.find((p) => geoPointsEqual(p, point)) !== undefined
  }

  findPolygons(target: string | undefined, text: string | undefined): GeometryFeature[] {
    if (!text) {
      // No E section given
      return []
    }

    const features: GeometryFeature[] = []

    // Circles and arcs: their centers must not be taken for outline points
    const directives = findShapeDirectives(text, LAT_LNG_SOURCE, latLngFromGroups)
    text = directives.cleaned
    for (const circle of directives.circles) {
      features.push(new Circle(circle.center, circle.radiusMeters))
    }

    // Look for PSNs
    const psnPattern =
      /(?:(?<psnEn>\w+)\s+)?PSN(?:\s+(?<psnFr>[^:]+))?\s*:\s*(?<lat>\d+(\.\d+)?)(?<latNS>N|S)\s*(?<lon>\d+(\.\d+)?)(?<lonEW>E|W)(?:\s*(?<radiusNM>\d+)|.*(?:(?<radius>\d+)\s*(?<radiusUnit>NM|M|KM)))?/g

    let match

    const foundPSNPoints: GeoPoint[] = []
    while ((match = psnPattern.exec(text)) != null) {
      if (match.groups === undefined) {
        // Unexpected
        continue
      }

      const psn = latLngFromGroups(match.groups)
      if (psn === null) {
        continue
      }

      let kind: PositionKind
      const strKind = (match.groups['psnFr'] ?? match.groups['psnEn'])?.trim()?.toUpperCase()
      if (strKind !== undefined && ['AVG', 'AVERAGE', 'MOYENNE'].includes(strKind)) {
        kind = 'AVG'
      } else {
        kind = 'POINT'
      }

      foundPSNPoints.push(psn)
      features.push(new Position(kind, psn))
    }

    // Look for fixing
    const foundFixingPoints: GeoPoint[] = []
    const fixingPattern =
      /(?:(?:ANCRAGE(?:\s+(?<ancrage>\w+))?)|(?:(?<fixing>\w+\s+)?FIXING))[\W]*(?<lat>\d+(\.\d+)?)(?<latNS>N|S)\s*(?<lon>\d+(\.\d+)?)(?<lonEW>E|W)\s*(?:(?:ALTITUDE|ELEV)\s*(?<alt>\d+)\s*(?<altUnit>FT|M))?/g
    while ((match = fixingPattern.exec(text)) != null) {
      if (match.groups === undefined) {
        // Unexpected
        continue
      }

      const point = latLngFromGroups(match.groups)
      if (point === null) {
        continue
      }

      foundFixingPoints.push(point)
    }

    if (foundFixingPoints.length != 0) {
      features.push(new Line(foundFixingPoints))
    }

    // Concatenate known points to ignore them later
    const allKnownPoints = foundPSNPoints.concat(foundFixingPoints)

    // Look for other locations
    const latLngPattern = new RegExp(LAT_LNG_SOURCE, 'g')

    let currentList: GeoPoint[] = []
    let lastEndIdx = 0
    while ((match = latLngPattern.exec(text)) != null) {
      if (match.groups === undefined) {
        // Unexpected
        continue
      }

      const latLng = latLngFromGroups(match.groups)
      if (latLng === null) {
        continue
      }

      if (this.knownPoint(allKnownPoints, latLng)) {
        // Ignore known points
        continue
      }

      // An arc between the previous point and this one: the outline goes on
      const arc = directives.arcs.find((a) => a.start >= lastEndIdx && a.end <= match!.index)

      const separator = text.substring(lastEndIdx, match.index - 1).trim()
      // Consider spaces, commas and "TO" as polygon separators
      if (
        arc === undefined &&
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
            features.push(new Position('POINT', currentList[0]!))
          }
        } else if (currentList.length == 2) {
          // Check if the line is already represented as a fixing
          if (
            !this.knownPoint(allKnownPoints, currentList[0]!) &&
            !this.knownPoint(allKnownPoints, currentList[1]!)
          ) {
            // New line detected
            features.push(new Line(currentList))
          }
        } else if (currentList.length > 2) {
          features.push(new Polygon(currentList))
        }

        currentList = []
      }

      const previous = currentList[currentList.length - 1]
      if (arc !== undefined && previous !== undefined) {
        currentList.push(...arcPoints(arc.center, previous, latLng, arc.clockwise))
      }

      // Store the last point
      currentList.push(latLng)

      lastEndIdx = match.index + match[0].length
    }

    // Handle what's left
    if (currentList.length == 1) {
      features.push(new Position('POINT', currentList[0]!))
    } else if (currentList.length == 2) {
      features.push(new Line(currentList))
    } else if (currentList.length > 2) {
      features.push(new Polygon(currentList))
    }

    // Look for relative locations, only if no other location has been found
    if (features.length == 0) {
      const relativePlacePattern =
        /RDL(\/D)?\s*:?\s*(?<azimuth>\d{2,3})\s*\/\s*(?<distance>\d+([.,]\d+)?)\s*(?<unit>\w+)/gm

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
        // Ignore FATO and FIR references
        const airfieldMatch = afterMatch.match(
          /\b(?!FATO|LFXX|LFBB|LFEE|LFFF|LFMM|LFRR\b)([A-Z]{4})\b/,
        )
        const nextSeparatorIdx = afterMatch.search(/[\n,;:$]/)
        let baseAirfield: string
        if (
          airfieldMatch === null ||
          airfieldMatch === undefined ||
          airfieldMatch.index === undefined ||
          airfieldMatch[1] === undefined ||
          (nextSeparatorIdx == -1 && airfieldMatch.index > 10) ||
          (nextSeparatorIdx != -1 && airfieldMatch.index > match.index + nextSeparatorIdx)
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

        if (!baseAirfield) {
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
        const center = relativeLocation.toPoint()
        if (center !== null) {
          features.push(new Position('AREA', center))
        }
      }
    }

    return features
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

      const parsed = parseIdYear(match.groups['id'], match.groups['year'], 'SUP AIP')
      if (parsed === null) {
        continue
      }

      const isAirac = match.groups['airac'] !== undefined
      const supAip = new SupAipRef(parsed.id, parsed.year, isAirac)
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

      const parsed = parseIdYear(match.groups['id'], match.groups['year'], 'IR SERA')
      if (parsed === null) {
        continue
      }

      const irSera = new IrSeraRef(parsed.id, parsed.year)
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

/**
 * Matches the line holding a NOTAM identifier, e.g. "LFFA-D0911/25" or "A1234/26 NOTAMN"
 */
const NOTAM_ID_LINE = /^\W*(?:[A-Z]{4}[-\s])?[A-Z]\d{4}\/\d{2}\b/

/**
 * Page chrome copied along with the NOTAMs from Sofia Briefing: category headings
 * (always mixed case, unlike NOTAM text), aerodrome section titles and footer.
 */
const SOFIA_CHROME_LINE = new RegExp(
  '^(?:' +
    [
      "Aérodromes? (?:de|d'|sélectionnés).*",
      'EN-ROUTE',
      'Installations et services',
      'Aire de manœuvre',
      'Aire de trafic',
      'Balisage',
      "Aides à l'atterrissage, installations radionavigation et GNSS",
      'Procédures',
      "Organisation de l'espace aérien (?:et .*)?",
      'Météorologie et équipements',
      "Restrictions de l'espace aérien",
      'Avertissements',
      'Obstacles',
      'Autres informations',
      'Services de la circulation aérienne et VOLMET',
      'Installations de communication et de surveillance',
      'GNSS - installations de radionavigation',
      'FAQ \\| Contact.*',
      'SIA \\| DGAC',
      'version \\d+(?:\\.\\d+)* ©.*',
    ].join('|') +
    ')\\s*:?$',
  'i',
)

/**
 * Splits a text copied from Sofia Briefing (or any NOTAM listing) and parses its NOTAMs.
 *
 * NOTAMs are separated by blank lines, or by a new identifier line once the
 * current NOTAM has started its sections. Blocks without a valid Q section
 * (page headers, footers, ...) are ignored.
 *
 * @param fullText The whole text
 * @returns The parsed NOTAMs
 */
export function parseNotams(fullText: string): NOTAM[] {
  const blocks: string[][] = []
  let current: string[] = []
  let hasSection = false
  const flush = () => {
    if (current.length != 0) {
      blocks.push(current)
    }
    current = []
    hasSection = false
  }

  // After a page heading, everything is page chrome until the next NOTAM or blank line
  let inChrome = false
  for (const line of fullText.replaceAll('\r', '').split('\n')) {
    if (line.trim().length == 0) {
      flush()
      inChrome = false
      continue
    }
    if (SOFIA_CHROME_LINE.test(line.trim())) {
      flush()
      inChrome = true
      continue
    }
    if (inChrome) {
      if (!NOTAM_ID_LINE.test(line)) {
        continue
      }
      inChrome = false
    }
    if (hasSection && NOTAM_ID_LINE.test(line)) {
      flush()
    }
    if (/^\W*[A-GQ]\)/.test(line)) {
      hasSection = true
    }
    current.push(line)
  }
  flush()

  const notams: NOTAM[] = []
  let notamIdx = 0
  for (const [blockIdx, block] of blocks.entries()) {
    if (!block.some((l) => /^\W*[A-GQ]\)/.test(l))) {
      continue
    }

    // Sofia prints an "ICAO NAME" title before each group of NOTAMs: when it
    // trails this block and the next NOTAM is about that aerodrome, it's a title
    const lastLine = block[block.length - 1]?.trim() ?? ''
    const titleMatch = /^(?<icao>[A-Z]{4}) [A-Z][A-Z0-9' .-]+$/.exec(lastLine)
    const nextBlock = blocks[blockIdx + 1]
    if (
      block.length > 1 &&
      titleMatch?.groups?.['icao'] &&
      nextBlock?.some((l) => new RegExp(`^\\W*A\\)\\s*${titleMatch.groups?.['icao']}\\b`).test(l))
    ) {
      block.pop()
    }
    const notam = new NOTAM(block.join('\n').trim(), notamIdx + 1)
    // The same NOTAM is listed once per aerodrome/route section on Sofia
    if (notam.sectionQ != null && !notams.some((n) => n.id === notam.id)) {
      notamIdx++
      notams.push(notam)
    }
  }
  return notams
}
