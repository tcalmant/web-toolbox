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
 * A geographic coordinate, framework-agnostic (no Leaflet dependency).
 */
export interface GeoPoint {
  lat: number
  lng: number
}

/**
 * Compares two points for equality within a small epsilon (to absorb
 * floating-point rounding from angle parsing).
 */
export function geoPointsEqual(a: GeoPoint, b: GeoPoint, epsilon = 1e-5): boolean {
  return Math.abs(a.lat - b.lat) <= epsilon && Math.abs(a.lng - b.lng) <= epsilon
}

const EARTH_RADIUS_M = 6371000

/**
 * Great-circle distance between two points, in meters (haversine formula).
 */
export function haversineDistanceMeters(a: GeoPoint, b: GeoPoint): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)

  const sinDLat = Math.sin(dLat / 2)
  const sinDLng = Math.sin(dLng / 2)
  const h = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng
  return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(h)))
}

const toRad = (deg: number) => (deg * Math.PI) / 180
const toDeg = (rad: number) => (rad * 180) / Math.PI

/**
 * Initial great-circle bearing from one point to another, in degrees [0, 360).
 */
export function bearingDegrees(from: GeoPoint, to: GeoPoint): number {
  const lat1 = toRad(from.lat)
  const lat2 = toRad(to.lat)
  const dLng = toRad(to.lng - from.lng)
  const y = Math.sin(dLng) * Math.cos(lat2)
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng)
  return (toDeg(Math.atan2(y, x)) + 360) % 360
}

/**
 * Point reached from an origin by following a bearing for a given distance.
 */
export function destinationPoint(
  origin: GeoPoint,
  bearing: number,
  distanceMeters: number,
): GeoPoint {
  const angular = distanceMeters / EARTH_RADIUS_M
  const brg = toRad(bearing)
  const lat1 = toRad(origin.lat)
  const lng1 = toRad(origin.lng)
  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(angular) + Math.cos(lat1) * Math.sin(angular) * Math.cos(brg),
  )
  const lng2 =
    lng1 +
    Math.atan2(
      Math.sin(brg) * Math.sin(angular) * Math.cos(lat1),
      Math.cos(angular) - Math.sin(lat1) * Math.sin(lat2),
    )
  return { lat: toDeg(lat2), lng: ((toDeg(lng2) + 540) % 360) - 180 }
}

/**
 * Intermediate points of an arc around a center, from `start` to `end`
 * (both excluded).
 *
 * The radius is interpolated between the start and end distances, so slightly
 * inconsistent source data still gives a continuous outline. Coinciding
 * endpoints give a full turn.
 */
export function arcPoints(
  center: GeoPoint,
  start: GeoPoint,
  end: GeoPoint,
  clockwise: boolean,
  stepDegrees = 5,
): GeoPoint[] {
  const startBearing = bearingDegrees(center, start)
  const endBearing = bearingDegrees(center, end)
  const startRadius = haversineDistanceMeters(center, start)
  const endRadius = haversineDistanceMeters(center, end)

  let sweep = clockwise ? endBearing - startBearing : startBearing - endBearing
  sweep = ((sweep % 360) + 360) % 360
  if (sweep < 1e-6) {
    sweep = 360
  }

  const steps = Math.floor(sweep / stepDegrees)
  const points: GeoPoint[] = []
  for (let i = 1; i <= steps; i++) {
    const angle = (sweep * i) / (steps + 1)
    const ratio = angle / sweep
    const bearing = startBearing + (clockwise ? angle : -angle)
    points.push(destinationPoint(center, bearing, startRadius + (endRadius - startRadius) * ratio))
  }
  return points
}
