/*
 *   Copyright (c) 2026 Thomas Calmant
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
import L from 'leaflet'
import type { GeometryFeature, Polygon } from 'src/domain/geometry'
import { Line, Position } from 'src/domain/geometry'

/**
 * Renders a single point of interest as a Leaflet layer.
 */
export function positionToLayer(position: Position): Layer | null {
  switch (position.kind) {
    case 'POINT':
      return L.circle(position.location, {
        radius: 1,
        color: 'red',
        fillColor: '#f03',
        fillOpacity: 0.9,
        weight: 10,
      })
    case 'AVG':
      return L.circle(position.location, {
        radius: 1,
        color: 'maroon',
        fillColor: '#800',
        fillOpacity: 0.5,
        weight: 2,
      })
    case 'AREA':
      return L.circle(position.location, {
        radius: 1852, // 1 NM
        color: '#FF4500',
        fillColor: 'orange',
        fillOpacity: 0.3,
        weight: 4,
      })
    default:
      return null
  }
}

/**
 * Renders an open sequence of points as a Leaflet layer.
 */
export function lineToLayer(line: Line): Layer | null {
  if (line.locations.length == 0) {
    return null
  } else if (line.locations.length <= 1) {
    return positionToLayer(new Position('POINT', line.locations[0]!))
  } else {
    return L.polyline(line.locations, { color: 'maroon', stroke: true, weight: 5 })
  }
}

/**
 * Renders a closed area as a Leaflet layer.
 */
export function polygonToLayer(polygon: Polygon): Layer | null {
  if (polygon.locations.length <= 2) {
    return lineToLayer(new Line(polygon.locations))
  } else {
    return L.polygon(polygon.locations, {
      fill: true,
      fillColor: 'red',
      fillOpacity: 0.2,
      color: 'red',
    })
  }
}

/**
 * Renders any domain geometry feature as a Leaflet layer.
 */
export function featureToLayer(feature: GeometryFeature): Layer | null {
  if (feature instanceof Position) {
    return positionToLayer(feature)
  } else if (feature instanceof Line) {
    return lineToLayer(feature)
  } else {
    return polygonToLayer(feature)
  }
}

/**
 * Renders a list of domain geometry features as Leaflet layers, dropping
 * features that can't be rendered.
 */
export function featuresToLayers(features: GeometryFeature[]): Layer[] {
  return features.map(featureToLayer).filter((layer): layer is Layer => layer !== null)
}
