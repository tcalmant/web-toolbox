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
 * Decoder for raw METAR/SPECI and TAF reports (ICAO Annex 3 and the common US
 * variants). Tolerant: groups it does not understand end up in `unparsed`
 * instead of failing the whole report.
 */

export type WindUnit = 'KT' | 'MPS' | 'KMH'

export interface Wind {
  /** Degrees the wind blows from, null when variable (VRB). */
  directionDeg: number | null
  speed: number
  gust: number | null
  unit: WindUnit
}

export interface CloudLayer {
  cover: 'FEW' | 'SCT' | 'BKN' | 'OVC' | 'VV'
  /** Height above the aerodrome in feet, null when not reported. */
  heightFt: number | null
  type: 'CB' | 'TCU' | null
}

export interface WeatherPhenomenon {
  /** "-" light, "+" heavy, "VC" in the vicinity, "" moderate. */
  intensity: '-' | '+' | 'VC' | ''
  descriptors: string[]
  phenomena: string[]
}

export interface DayTime {
  day: number
  hour: number
  minute: number
}

/** Conditions common to METAR and to each TAF group. */
export interface Conditions {
  wind: Wind | null
  /** Extremes of a variable wind direction (e.g. 240V300), when reported. */
  windVariation: { fromDeg: number; toDeg: number } | null
  /** Visibility in metres, null when not reported or CAVOK. */
  visibilityM: number | null
  cavok: boolean
  weather: WeatherPhenomenon[]
  /** NSW: no significant weather (TAF). */
  noSignificantWeather: boolean
  clouds: CloudLayer[]
  /** NSC, NCD, SKC or CLR when stated instead of layers. */
  skyClear: 'NSC' | 'NCD' | 'SKC' | 'CLR' | null
  unparsed: string[]
}

export interface Metar extends Conditions {
  kind: 'METAR' | 'SPECI'
  station: string
  time: DayTime
  auto: boolean
  correction: boolean
  temperatureC: number | null
  dewPointC: number | null
  qnhHpa: number | null
  /** Trend group (NOSIG, BECMG..., TEMPO...), raw. */
  trend: string
  /** Remarks after RMK, raw. */
  remarks: string
}

export type TafGroupKind = 'BASE' | 'BECMG' | 'TEMPO' | 'FM' | 'PROB'

export interface TafGroup extends Conditions {
  kind: TafGroupKind
  /** 30 or 40 for PROB groups (alone or before TEMPO). */
  probability: number | null
  from: DayTime | null
  to: DayTime | null
}

export interface Taf {
  station: string
  amended: boolean
  corrected: boolean
  issued: DayTime
  validFrom: DayTime
  validTo: DayTime
  groups: TafGroup[]
  /** TX/TN temperature groups and anything outside forecast groups, raw. */
  extras: string[]
}

const KT_PER_MPS = 1.943844
const KMH_PER_KT = 1.852
const M_PER_STATUTE_MILE = 1609.344
const HPA_PER_INHG = 33.8639

const WIND_RE = /^(VRB|\d{3})(\d{2,3})(?:G(\d{2,3}))?(KT|MPS|KMH)$/
const WIND_VARIATION_RE = /^(\d{3})V(\d{3})$/
const CLOUD_RE = /^(FEW|SCT|BKN|OVC)(\d{3}|\/\/\/)(CB|TCU|\/\/\/)?$/
const VERTICAL_VISIBILITY_RE = /^VV(\d{3}|\/\/\/)$/
const UNKNOWN_COVER_RE = /^\/\/\/(CB|TCU)$/
const WEATHER_INTENSITY = ['-', '+', 'VC']
const WEATHER_DESCRIPTORS = ['MI', 'BC', 'PR', 'DR', 'BL', 'SH', 'TS', 'FZ']
const WEATHER_PHENOMENA = [
  'DZ', 'RA', 'SN', 'SG', 'IC', 'PL', 'GR', 'GS', 'UP',
  'BR', 'FG', 'FU', 'VA', 'DU', 'SA', 'HZ', 'PO', 'SQ', 'FC', 'SS', 'DS',
] // prettier-ignore

/** Wind speeds in knots, whatever the unit of the report. */
export function windSpeedKt(wind: Wind, speed: number = wind.speed): number {
  if (wind.unit === 'MPS') return speed * KT_PER_MPS
  if (wind.unit === 'KMH') return speed / KMH_PER_KT
  return speed
}

function parseWind(token: string): Wind | null {
  const m = WIND_RE.exec(token)
  if (!m) return null
  return {
    directionDeg: m[1] === 'VRB' ? null : parseInt(m[1] ?? '', 10),
    speed: parseInt(m[2] ?? '', 10),
    gust: m[3] ? parseInt(m[3], 10) : null,
    unit: m[4] as WindUnit,
  }
}

function parseWeather(token: string): WeatherPhenomenon | null {
  let rest = token
  let intensity: WeatherPhenomenon['intensity'] = ''
  for (const prefix of WEATHER_INTENSITY) {
    if (rest.startsWith(prefix) && rest.length > prefix.length) {
      intensity = prefix as WeatherPhenomenon['intensity']
      rest = rest.slice(prefix.length)
      break
    }
  }
  if (rest.length < 2 || rest.length % 2 !== 0) return null
  const descriptors: string[] = []
  const phenomena: string[] = []
  for (let i = 0; i < rest.length; i += 2) {
    const code = rest.slice(i, i + 2)
    if (WEATHER_DESCRIPTORS.includes(code) && phenomena.length === 0) {
      descriptors.push(code)
    } else if (WEATHER_PHENOMENA.includes(code)) {
      phenomena.push(code)
    } else {
      return null
    }
  }
  // A descriptor alone is only valid for TS and SH (thunderstorm, showers, e.g. VCSH)
  if (phenomena.length === 0 && !descriptors.some((d) => d === 'TS' || d === 'SH')) return null
  return { intensity, descriptors, phenomena }
}

function parseDayTime(day: string, hour: string, minute = '00'): DayTime {
  return { day: parseInt(day, 10), hour: parseInt(hour, 10), minute: parseInt(minute, 10) }
}

function emptyConditions(): Conditions {
  return {
    wind: null,
    windVariation: null,
    visibilityM: null,
    cavok: false,
    weather: [],
    noSignificantWeather: false,
    clouds: [],
    skyClear: null,
    unparsed: [],
  }
}

/**
 * Parses the weather groups shared by METAR and TAF. Stops at the first token
 * accepted by `stop` and returns it with the index reached.
 */
function parseConditions(
  tokens: string[],
  start: number,
  stop: (token: string) => boolean,
  extra: (token: string) => boolean = () => false,
): { conditions: Conditions; next: number } {
  const c = emptyConditions()
  let i = start
  for (; i < tokens.length; i++) {
    const token = tokens[i] ?? ''
    if (stop(token)) break
    if (extra(token)) continue

    const wind = parseWind(token)
    const variation = WIND_VARIATION_RE.exec(token)
    const cloud = CLOUD_RE.exec(token)
    const vv = VERTICAL_VISIBILITY_RE.exec(token)
    const weather = parseWeather(token)

    if (wind && c.wind === null) {
      c.wind = wind
    } else if (variation) {
      c.windVariation = {
        fromDeg: parseInt(variation[1] ?? '', 10),
        toDeg: parseInt(variation[2] ?? '', 10),
      }
    } else if (token === 'CAVOK') {
      c.cavok = true
    } else if (/^\d{4}$/.test(token) && c.visibilityM === null) {
      c.visibilityM = parseInt(token, 10)
    } else if (c.visibilityM === null && parseStatuteMiles(token) !== null) {
      c.visibilityM = Math.round((parseStatuteMiles(token) ?? 0) * M_PER_STATUTE_MILE)
    } else if (token === 'NSW') {
      c.noSignificantWeather = true
    } else if (cloud) {
      const height = cloud[2] === '///' ? null : parseInt(cloud[2] ?? '', 10) * 100
      const type = cloud[3] === 'CB' || cloud[3] === 'TCU' ? cloud[3] : null
      c.clouds.push({ cover: cloud[1] as CloudLayer['cover'], heightFt: height, type })
    } else if (vv) {
      c.clouds.push({
        cover: 'VV',
        heightFt: vv[1] === '///' ? null : parseInt(vv[1] ?? '', 10) * 100,
        type: null,
      })
    } else if (token === 'NSC' || token === 'NCD' || token === 'SKC' || token === 'CLR') {
      c.skyClear = token
    } else if (UNKNOWN_COVER_RE.test(token)) {
      // Cloud type reported without cover or height (automatic station)
      c.clouds.push({
        cover: 'FEW',
        heightFt: null,
        type: token.endsWith('CB') ? 'CB' : 'TCU',
      })
    } else if (weather) {
      c.weather.push(weather)
    } else {
      c.unparsed.push(token)
    }
  }
  return { conditions: c, next: i }
}

/**
 * Statute miles ("10SM", "P6SM", "1/4SM", "M1/4SM", "1 1/2SM") as a number of
 * miles, null when the token is not such a visibility.
 */
function parseStatuteMiles(token: string): number | null {
  const m = /^[PM]?(?:(\d{1,2}) )?(?:(\d{1,2})\/(\d{1,2})|(\d{1,2}))SM$/.exec(token)
  if (!m) return null
  const whole = m[1] ? parseInt(m[1], 10) : 0
  if (m[4]) return whole + parseInt(m[4], 10)
  const denominator = parseInt(m[3] ?? '', 10)
  return denominator > 0 ? whole + parseInt(m[2] ?? '', 10) / denominator : null
}

function tokenize(raw: string): string[] {
  const tokens = raw
    .replace(/=\s*$/, '')
    .trim()
    .split(/\s+/)
    .filter((t) => t.length > 0)
  // "1 1/2SM" is written with a space: keep it as a single token
  const merged: string[] = []
  for (const token of tokens) {
    const previous = merged[merged.length - 1]
    if (
      previous !== undefined &&
      /^\d{1,2}$/.test(previous) &&
      /^\d{1,2}\/\d{1,2}SM$/.test(token)
    ) {
      merged[merged.length - 1] = `${previous} ${token}`
    } else {
      merged.push(token)
    }
  }
  return merged
}

const TREND_RE = /^(NOSIG|BECMG|TEMPO)$/

/** Parses a METAR or SPECI. Returns null when the header is not recognisable. */
export function parseMetar(raw: string): Metar | null {
  const tokens = tokenize(raw)
  let i = 0
  let kind: Metar['kind'] = 'METAR'
  let correction = false
  if (tokens[i] === 'METAR' || tokens[i] === 'SPECI') {
    kind = tokens[i] as Metar['kind']
    i++
  }
  if (tokens[i] === 'COR') {
    correction = true
    i++
  }
  const station = tokens[i]
  if (!station || !/^[A-Z][A-Z0-9]{3}$/.test(station)) return null
  i++
  const timeMatch = /^(\d{2})(\d{2})(\d{2})Z$/.exec(tokens[i] ?? '')
  if (!timeMatch) return null
  const time = parseDayTime(timeMatch[1] ?? '', timeMatch[2] ?? '', timeMatch[3])
  i++

  let auto = false
  let temperatureC: number | null = null
  let dewPointC: number | null = null
  let qnhHpa: number | null = null

  const handleMetarOnly = (token: string): boolean => {
    if (token === 'AUTO') {
      auto = true
      return true
    }
    if (token === 'COR') {
      correction = true
      return true
    }
    const temp = /^(M?\d{2})\/(M?\d{2})?$/.exec(token)
    if (temp) {
      const toNumber = (s: string) => parseInt(s.replace('M', '-'), 10)
      temperatureC = toNumber(temp[1] ?? '')
      dewPointC = temp[2] ? toNumber(temp[2]) : null
      return true
    }
    const q = /^Q(\d{4})$/.exec(token)
    if (q) {
      qnhHpa = parseInt(q[1] ?? '', 10)
      return true
    }
    const a = /^A(\d{4})$/.exec(token)
    if (a) {
      qnhHpa = Math.round((parseInt(a[1] ?? '', 10) / 100) * HPA_PER_INHG)
      return true
    }
    // Runway visual range and recent weather are not decoded
    return /^R\d{2}[LRC]?\//.test(token) || /^RE[A-Z]{2,}/.test(token)
  }

  const { conditions, next } = parseConditions(
    tokens,
    i,
    (t) => TREND_RE.test(t) || t === 'RMK',
    handleMetarOnly,
  )

  const trendStart = next
  let rmk = tokens.indexOf('RMK', trendStart)
  if (rmk < 0) rmk = tokens.length
  const trend = tokens.slice(trendStart, rmk).join(' ')
  const remarks = tokens.slice(rmk + 1).join(' ')

  return {
    ...conditions,
    kind,
    station,
    time,
    auto,
    correction,
    temperatureC,
    dewPointC,
    qnhHpa,
    trend,
    remarks,
  }
}

/** Parses a TAF. Returns null when the header is not recognisable. */
export function parseTaf(raw: string): Taf | null {
  const tokens = tokenize(raw)
  let i = 0
  if (tokens[i] === 'TAF') i++
  let amended = false
  let corrected = false
  while (tokens[i] === 'AMD' || tokens[i] === 'COR') {
    if (tokens[i] === 'AMD') amended = true
    else corrected = true
    i++
  }
  const station = tokens[i]
  if (!station || !/^[A-Z][A-Z0-9]{3}$/.test(station)) return null
  i++
  const issuedMatch = /^(\d{2})(\d{2})(\d{2})Z$/.exec(tokens[i] ?? '')
  if (!issuedMatch) return null
  const issued = parseDayTime(issuedMatch[1] ?? '', issuedMatch[2] ?? '', issuedMatch[3])
  i++
  const period = /^(\d{2})(\d{2})\/(\d{2})(\d{2})$/.exec(tokens[i] ?? '')
  if (!period) return null
  const validFrom = parseDayTime(period[1] ?? '', period[2] ?? '')
  const validTo = parseDayTime(period[3] ?? '', period[4] ?? '')
  i++

  const extras: string[] = []
  const groups: TafGroup[] = []

  const isGroupStart = (t: string) => /^(BECMG|TEMPO|PROB\d{2})$/.test(t) || /^FM\d{6}$/.test(t)
  const isTemperatureGroup = (t: string) => /^T[XN]M?\d{2}\/\d{4}Z$/.test(t)

  let kind: TafGroupKind = 'BASE'
  let probability: number | null = null
  let from: DayTime | null = validFrom
  let to: DayTime | null = validTo

  while (i <= tokens.length) {
    const { conditions, next } = parseConditions(tokens, i, isGroupStart, (t) => {
      if (isTemperatureGroup(t)) {
        extras.push(t)
        return true
      }
      return false
    })
    groups.push({ ...conditions, kind, probability, from, to })
    i = next
    if (i >= tokens.length) break

    // Read the change indicator that opens the next group
    probability = null
    let token = tokens[i] ?? ''
    const prob = /^PROB(\d{2})$/.exec(token)
    if (prob) {
      probability = parseInt(prob[1] ?? '', 10)
      kind = 'PROB'
      i++
      token = tokens[i] ?? ''
    }
    const fm = /^FM(\d{2})(\d{2})(\d{2})$/.exec(token)
    if (fm) {
      kind = 'FM'
      from = parseDayTime(fm[1] ?? '', fm[2] ?? '', fm[3])
      to = null
      i++
    } else if (token === 'BECMG' || token === 'TEMPO') {
      kind = token
      i++
      const range = /^(\d{2})(\d{2})\/(\d{2})(\d{2})$/.exec(tokens[i] ?? '')
      if (range) {
        from = parseDayTime(range[1] ?? '', range[2] ?? '')
        to = parseDayTime(range[3] ?? '', range[4] ?? '')
        i++
      } else {
        from = null
        to = null
      }
    } else if (kind === 'PROB') {
      // PROB30 alone, directly followed by its period
      const range = /^(\d{2})(\d{2})\/(\d{2})(\d{2})$/.exec(token)
      if (range) {
        from = parseDayTime(range[1] ?? '', range[2] ?? '')
        to = parseDayTime(range[3] ?? '', range[4] ?? '')
        i++
      } else {
        from = null
        to = null
      }
    }
  }

  return { station, amended, corrected, issued, validFrom, validTo, groups, extras }
}

const REPORT_START_RE = /^(METAR|SPECI|TAF)\b|^[A-Z][A-Z0-9]{3}\s+\d{6}Z\b/

// A TAF is recognised by its header, or by the validity period after the issue time
const TAF_RE = /^(?:TAF\s+)?(?:(?:AMD|COR)\s+)*[A-Z][A-Z0-9]{3}\s+\d{6}Z\s+\d{4}\/\d{4}\b/

/**
 * Splits pasted text into individual reports. A report ends at "=" (the
 * bulletin separator), and a new one starts on a line beginning with METAR,
 * SPECI, TAF or "ICAO DDHHMMZ"; other lines continue the previous report (TAF
 * change groups are often wrapped over several lines).
 */
export function splitReports(text: string): string[] {
  const reports: string[] = []
  let closed = true
  for (const line of text.replace(/=/g, '=\n').split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed) continue
    const last = reports.length - 1
    if (closed || REPORT_START_RE.test(trimmed)) {
      reports.push(trimmed)
    } else {
      reports[last] = `${reports[last]} ${trimmed}`
    }
    closed = trimmed.endsWith('=')
  }
  return reports.map((r) => r.replace(/=\s*$/, '').trim()).filter((r) => r.length > 0)
}

/** Parses each report found in the text, in order. Unrecognised reports are dropped. */
export function parseReports(text: string): (Metar | Taf)[] {
  const results: (Metar | Taf)[] = []
  for (const report of splitReports(text)) {
    const parsed = TAF_RE.test(report) ? parseTaf(report) : parseMetar(report)
    if (parsed) results.push(parsed)
  }
  return results
}

export function isTaf(report: Metar | Taf): report is Taf {
  return 'groups' in report
}
