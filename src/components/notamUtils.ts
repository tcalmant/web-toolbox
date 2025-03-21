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

import { LatLng } from 'leaflet'

export class NOTAM {
  text: string
  sections: Map<string, string>
  center: LatLng | null
  radiusNM: number | null
  polygon: LatLng[] | null

  constructor(fullText: string) {
    this.text = fullText
    this.sections = this.splitSections(fullText)
    const center = this.extractCenter(this.sections.get('Q'))
    this.center = center != null ? center.center : null
    this.radiusNM = center != null ? center.radius : null
    this.polygon = null
  }

  toGeoJSON() {
    if (this.center == null || this.radiusNM == null) {
      return null
    }

    const properties = Array.from(this.sections).reduce(
      (acc, [key, value]) => {
        acc[key] = value
        return acc
      },
      {} as { [key: string]: string | number | null },
    )
    properties.radiusNM = this.radiusNM
    properties.radius = this.radiusNM * 1.852

    return {
      type: 'Feature',
      properties,
      geometry: {
        type: 'Point',
        coordinates: [-104.99404, 39.75621],
      },
    }
  }

  extractCenter(qSection: string | null | undefined): { center: LatLng; radius: number } | null {
    if (qSection == null) {
      // No Q section
      console.log('No Q section')
      return null
    }

    const rawLocation = qSection.split('/').at(-1)?.trim()
    if (rawLocation == undefined) {
      // Empty Q section
      console.log('Empty Q section')
      return null
    }

    const pattern = /^(\d+)(N|S)(\d+)(W|E)(\d+)$/
    const match = pattern.exec(rawLocation)
    if (match == null) {
      // No location found in last segment
      console.log('No match with location', rawLocation)
      return null
    }

    const latNumbers = match[1]
    const latNS = match[2]
    const lonNumbers = match[3]
    const lonEW = match[4]
    if (
      latNumbers == undefined ||
      latNS == undefined ||
      lonNumbers == undefined ||
      lonEW == undefined
    ) {
      console.warn('No center point found in Q section')
      return null
    }

    const center = new LatLng(
      this.parseQAngle(latNumbers, latNS),
      this.parseQAngle(lonNumbers, lonEW),
    )

    // Check radius
    const rawRadius = match[5]
    if (rawRadius == undefined) {
      console.error('No radius found in Q section')
      return null
    }

    return {
      center,
      radius: parseInt(rawRadius),
    }
  }

  parseQAngle(strAngle: string, hemisphere: string): number {
    const degrees = parseInt(strAngle.substring(0, strAngle.length - 2))
    const minutes = parseInt(strAngle.substring(strAngle.length - 2))
    const angle = degrees + minutes / 60
    return 'SW'.includes(hemisphere) ? -angle : angle
  }

  splitSections(text: string): Map<string, string> {
    let currentSection: string | null = null
    let currentLine: string | null = null
    const sections = new Map<string, string>()
    for (let line of text.split('\n')) {
      line = line.trim()
      if (line.at(1) == ')' && 'AQBCDEFG'.includes(line.at(0) ?? '')) {
        // Start of new section
        if (currentSection != null && currentLine != null) {
          // Store current section
          sections.set(currentSection, currentLine)
          currentLine = null
        }

        currentSection = line.at(0) as string
      }

      if (currentLine == null) {
        currentLine = line
      } else {
        currentLine = `${currentLine}\n${line}`
      }
    }

    if (currentSection != null && currentLine != null) {
      // Store last section
      sections.set(currentSection, currentLine)
    }
    return sections
  }
}
