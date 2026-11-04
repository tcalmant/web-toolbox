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

/** Unit of a vertical limit value. Open list: add its spellings to UNIT_TOKENS. */
export type VerticalUnit = 'FT' | 'M' | 'FL'

/**
 * What a vertical limit is measured from. SFC and UNL are limits by themselves
 * (no value). Open list: add its spellings to REFERENCE_TOKENS.
 */
export type VerticalReference = 'AMSL' | 'ASFC' | 'STD' | 'SFC' | 'UNL'

export interface VerticalLimit {
  /** Feet, meters or hundreds of feet (FL); null for SFC, UNL or an unknown form */
  value: number | null
  /** Null for SFC, UNL or an unknown form */
  unit: VerticalUnit | null
  /** Null when the text doesn't state it or the form is unknown: never guessed */
  reference: VerticalReference | null
  /** Source text, kept for display and audit */
  raw: string
}

const UNIT_TOKENS: Record<string, VerticalUnit> = { FT: 'FT', M: 'M' }

// AGL and GND are the usual NOTAM spellings of ASFC and SFC
const REFERENCE_TOKENS: Record<string, VerticalReference> = {
  AMSL: 'AMSL',
  MSL: 'AMSL',
  ASFC: 'ASFC',
  AGL: 'ASFC',
  SFC: 'SFC',
  GND: 'SFC',
  UNL: 'UNL',
}

/**
 * Parses an F) or G) section, or a limit written the same way in AIP text:
 * "SFC", "GND", "UNL", "FL095", "FL 95", "1500FT AMSL", "500 M AGL"...
 *
 * @param text The limit text
 * @returns The parsed limit (value null on unknown forms), or null without text
 */
export function parseVerticalLimit(text: string | null | undefined): VerticalLimit | null {
  const raw = text?.trim()
  if (!raw) {
    return null
  }
  const unknown: VerticalLimit = { value: null, unit: null, reference: null, raw }
  const upper = raw.toUpperCase()

  const alone = REFERENCE_TOKENS[upper]
  if (alone === 'SFC' || alone === 'UNL') {
    return { value: null, unit: null, reference: alone, raw }
  }

  const level = /^FL\s*(\d{1,3})$/.exec(upper)
  if (level) {
    return { value: parseInt(level[1]!), unit: 'FL', reference: 'STD', raw }
  }

  const height = /^(\d+)\s*([A-Z]+)(?:\s+([A-Z]+))?$/.exec(upper)
  const unit = height ? UNIT_TOKENS[height[2]!] : undefined
  if (!height || unit === undefined) {
    return unknown
  }
  let reference: VerticalReference | null = null
  if (height[3] !== undefined) {
    const found = REFERENCE_TOKENS[height[3]]
    if (found !== 'AMSL' && found !== 'ASFC') {
      return unknown
    }
    reference = found
  }
  return { value: parseInt(height[1]!), unit, reference, raw }
}

/**
 * Parses a Q) section limit, always a flight level in hundreds of feet (e.g. "059").
 *
 * @param text The lower or upper limit field of the Q) section
 * @returns The parsed limit (value null on unknown forms), or null without text
 */
export function parseQLimit(text: string | null | undefined): VerticalLimit | null {
  const raw = text?.trim()
  if (!raw) {
    return null
  }
  return /^\d{3}$/.test(raw)
    ? { value: parseInt(raw), unit: 'FL', reference: 'STD', raw }
    : { value: null, unit: null, reference: null, raw }
}

/**
 * Formats a limit the ICAO way: "FL059", "1500 FT AMSL", "SFC", "UNL".
 * Unknown forms are shown as written.
 */
export function formatVerticalLimit(limit: VerticalLimit): string {
  if (limit.reference === 'SFC' || limit.reference === 'UNL') {
    return limit.reference
  }
  if (limit.value === null || limit.unit === null) {
    return limit.raw
  }
  if (limit.unit === 'FL') {
    return `FL${limit.value.toString().padStart(3, '0')}`
  }
  return [limit.value, limit.unit, limit.reference].filter((p) => p !== null).join(' ')
}
