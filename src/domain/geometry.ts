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

export type PositionKind = 'POINT' | 'AVG' | 'AREA'

/**
 * A single geographic point of interest.
 *
 * How it should be rendered (as a small dot, an averaged position, or an
 * area of influence) is a presentation concern handled by the map-rendering
 * adapter, not by this domain object.
 */
export class Position {
  location: GeoPoint
  kind: PositionKind
  category: string | undefined

  constructor(kind: PositionKind, location: GeoPoint, category?: string) {
    this.kind = kind
    this.location = location
    this.category = category
  }
}

/**
 * An open sequence of points, e.g. a cable or a border segment.
 */
export class Line {
  locations: GeoPoint[]

  constructor(locations: GeoPoint[]) {
    this.locations = locations
  }
}

/**
 * A closed area described by its outline points.
 */
export class Polygon {
  locations: GeoPoint[]

  constructor(locations: GeoPoint[]) {
    this.locations = locations
  }
}

/**
 * Any geometry feature that can come out of NOTAM/AIP parsing.
 */
export type GeometryFeature = Position | Line | Polygon
