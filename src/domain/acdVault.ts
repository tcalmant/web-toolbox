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
 * Format of the ACD data vault: the aeroclub's aircraft and checklists, shipped
 * encrypted and unlocked in the browser with a passphrase.
 */

/** One aircraft of the club, as stored in the vault. */
export interface AcdPlaneRecord {
  brand: string
  model: string
  fuel: {
    capacity: number
    consumable: number
    hourlyConsumption: number
    unit: string
  }
}

/** A map base layer reserved to the club members (licence restricted to the association). */
export interface AcdTileLayer {
  /** Label in the layer selector. */
  name: string
  /** Tile URL template, with the {z}, {x} and {y} placeholders. */
  url: string
  attribution: string
  minZoom: number
  maxZoom: number
  /** South-west and north-east corners as [lat, lng] in degrees, or null for no limit. */
  bounds: [[number, number], [number, number]] | null
}

/** The decrypted content of the vault. */
export interface AcdPayload {
  /** Aircraft by registration. */
  planes: Record<string, AcdPlaneRecord>
  /**
   * Checklist XML documents by path relative to the checklists root, for
   * instance "model/DR400 120.xml" or "plane/F-ABCD.xml".
   */
  checklists: Record<string, string>
  /** Absent from the vaults encrypted before it existed. */
  tileLayers?: AcdTileLayer[]
}

/** The encrypted file. Every binary field is base64. */
export interface VaultBundle {
  version: 1
  kdf: 'PBKDF2-SHA256'
  iterations: number
  salt: string
  iv: string
  /** AES-256-GCM ciphertext of the gzipped JSON payload. */
  data: string
}

export function isVaultBundle(value: unknown): value is VaultBundle {
  if (typeof value !== 'object' || value === null) {
    return false
  }
  const v = value as Record<string, unknown>
  return (
    v['version'] === 1 &&
    v['kdf'] === 'PBKDF2-SHA256' &&
    typeof v['iterations'] === 'number' &&
    typeof v['salt'] === 'string' &&
    typeof v['iv'] === 'string' &&
    typeof v['data'] === 'string'
  )
}

/** Structural check of a decrypted payload (the content is authenticated, not trusted blindly). */
export function isAcdPayload(value: unknown): value is AcdPayload {
  if (typeof value !== 'object' || value === null) {
    return false
  }
  const v = value as Record<string, unknown>
  const planes = v['planes']
  const checklists = v['checklists']
  if (typeof planes !== 'object' || planes === null || Array.isArray(planes)) {
    return false
  }
  if (typeof checklists !== 'object' || checklists === null || Array.isArray(checklists)) {
    return false
  }
  const tileLayers = v['tileLayers']
  return (
    Object.values(planes).every(isAcdPlaneRecord) &&
    Object.values(checklists).every((xml) => typeof xml === 'string') &&
    (tileLayers === undefined || (Array.isArray(tileLayers) && tileLayers.every(isAcdTileLayer)))
  )
}

const isFiniteNumber = (value: unknown) => typeof value === 'number' && Number.isFinite(value)

const isLatLng = (value: unknown) =>
  Array.isArray(value) && value.length === 2 && value.every(isFiniteNumber)

function isAcdTileLayer(value: unknown): value is AcdTileLayer {
  if (typeof value !== 'object' || value === null) {
    return false
  }
  const v = value as Record<string, unknown>
  const bounds = v['bounds']
  return (
    typeof v['name'] === 'string' &&
    typeof v['url'] === 'string' &&
    typeof v['attribution'] === 'string' &&
    isFiniteNumber(v['minZoom']) &&
    isFiniteNumber(v['maxZoom']) &&
    (bounds === null || (Array.isArray(bounds) && bounds.length === 2 && bounds.every(isLatLng)))
  )
}

function isAcdPlaneRecord(value: unknown): value is AcdPlaneRecord {
  if (typeof value !== 'object' || value === null) {
    return false
  }
  const v = value as Record<string, unknown>
  const fuel = v['fuel']
  if (typeof fuel !== 'object' || fuel === null) {
    return false
  }
  const f = fuel as Record<string, unknown>
  return (
    typeof v['brand'] === 'string' &&
    typeof v['model'] === 'string' &&
    typeof f['unit'] === 'string' &&
    ['capacity', 'consumable', 'hourlyConsumption'].every(
      (key) => typeof f[key] === 'number' && Number.isFinite(f[key]),
    )
  )
}
