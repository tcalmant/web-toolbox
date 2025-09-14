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

import type { LatLng, Layer } from 'leaflet'
import L from 'leaflet'

export type PositionKind = 'POINT' | 'AVG'

export class Position {
  location: LatLng
  kind: PositionKind
  category: string | undefined

  constructor(kind: PositionKind, location: LatLng, category?: string) {
    this.kind = kind
    this.location = location
    this.category = category
  }

  toLayer(): Layer | null {
    switch (this.kind) {
      case 'POINT':
        return L.circle(this.location, {
          radius: 1,
          color: 'red',
          fillColor: '#f03',
          fillOpacity: 0.9,
          weight: 10,
        })
      case 'AVG':
        return L.circle(this.location, {
          radius: 1,
          color: 'maroon',
          fillColor: '#800',
          fillOpacity: 0.5,
          weight: 2,
        })
      default:
        return null
    }
  }
}

export class Line {
  locations: LatLng[]

  constructor(locations: LatLng[]) {
    this.locations = locations
  }

  toLayer(): Layer | null {
    if (this.locations.length == 0) {
      return null
    } else if (this.locations.length <= 1) {
      return new Position('POINT', this.locations[0] as LatLng).toLayer()
    } else {
      return L.polyline(this.locations, { color: 'maroon', stroke: true, weight: 5 })
    }
  }
}

export class Polygon {
  locations: LatLng[]

  constructor(locations: LatLng[]) {
    this.locations = locations
  }

  toLayer(): Layer | null {
    if (this.locations.length <= 2) {
      return new Line(this.locations).toLayer()
    } else {
      return L.polygon(this.locations, {
        fill: true,
        fillColor: 'red',
        fillOpacity: 0.2,
        color: 'red',
      })
    }
  }
}
