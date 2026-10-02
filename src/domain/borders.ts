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

import type { GeoPoint } from './geo'

/**
 * Border lines by name: each name maps to a list of continuous chains of
 * [latitude, longitude] points.
 */
export type BorderData = Record<string, [number, number][][]>

/**
 * Key of the territorial waters limit in the border data.
 */
export const TERRITORIAL_WATERS_KEY = 'eaux_territoriales'

// Beyond this, the points are not on the border: don't pretend we know its course
const MAX_SNAP_DISTANCE_M = 15000

const METERS_PER_DEGREE = 111320

/**
 * Finds which border a text stretch talks about, e.g. "frontière
 * franco-espagnole" or "limite des eaux territoriales atlantique françaises".
 *
 * @param text Text found between two outline points
 * @param data Known borders
 * @returns The key of the border in `data`, or null if unknown
 */
export function borderKeyFromText(text: string, data: BorderData): string | null {
  if (/eaux\s+territoriales/i.test(text)) {
    return TERRITORIAL_WATERS_KEY in data ? TERRITORIAL_WATERS_KEY : null
  }

  const match = /fronti[èe]re\s+franco\s*-?\s*(?<country>[\p{L}]+)/iu.exec(text)
  if (match?.groups?.['country']) {
    // "monégasque" -> "monegasque"
    const key = match.groups['country'].toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    return key in data ? key : null
  }
  return null
}

interface Snap {
  // Position along the chain: segment index plus the fraction in that segment
  position: number
  distance: number
}

/**
 * Nearest position of a point on a chain, using a local flat-earth
 * approximation (fine at the scale of a border).
 */
function snapToChain(chain: [number, number][], point: GeoPoint): Snap {
  const cosLat = Math.cos((point.lat * Math.PI) / 180)
  let best: Snap = { position: 0, distance: Infinity }
  for (let i = 0; i + 1 < chain.length; i++) {
    const [aLat, aLng] = chain[i]!
    const [bLat, bLng] = chain[i + 1]!
    const ax = (aLng - point.lng) * cosLat
    const ay = aLat - point.lat
    const dx = (bLng - aLng) * cosLat
    const dy = bLat - aLat
    const lengthSq = dx * dx + dy * dy
    const t = lengthSq === 0 ? 0 : Math.max(0, Math.min(1, -(ax * dx + ay * dy) / lengthSq))
    const distance = Math.hypot(ax + t * dx, ay + t * dy) * METERS_PER_DEGREE
    if (distance < best.distance) {
      best = { position: i + t, distance }
    }
  }
  return best
}

/**
 * Points of a border between two locations placed on it, in the order
 * they are met when going from `from` to `to` (both excluded).
 *
 * @param chains The continuous chains of the border
 * @param from Start location
 * @param to End location
 * @returns The intermediate points, or null if both locations don't lie on
 *   the same chain
 */
export function borderPath(
  chains: [number, number][][],
  from: GeoPoint,
  to: GeoPoint,
): GeoPoint[] | null {
  let bestChain: [number, number][] | null = null
  let bestFrom: Snap | null = null
  let bestTo: Snap | null = null
  for (const chain of chains) {
    const snapFrom = snapToChain(chain, from)
    const snapTo = snapToChain(chain, to)
    if (
      bestFrom === null ||
      bestTo === null ||
      snapFrom.distance + snapTo.distance < bestFrom.distance + bestTo.distance
    ) {
      bestChain = chain
      bestFrom = snapFrom
      bestTo = snapTo
    }
  }

  if (
    bestChain === null ||
    bestFrom === null ||
    bestTo === null ||
    bestFrom.distance > MAX_SNAP_DISTANCE_M ||
    bestTo.distance > MAX_SNAP_DISTANCE_M
  ) {
    return null
  }

  const points: GeoPoint[] = []
  if (bestFrom.position <= bestTo.position) {
    // Vertices strictly after "from" and up to "to"
    for (let i = Math.floor(bestFrom.position) + 1; i <= Math.floor(bestTo.position); i++) {
      points.push({ lat: bestChain[i]![0], lng: bestChain[i]![1] })
    }
  } else {
    for (let i = Math.floor(bestFrom.position); i > Math.floor(bestTo.position); i--) {
      points.push({ lat: bestChain[i]![0], lng: bestChain[i]![1] })
    }
  }
  return points
}
