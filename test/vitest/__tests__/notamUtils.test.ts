/**
 * Copyright (c) 2025 Thomas Calmant
 * All rights reserved.
 *
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 * Tests for notamUtils.ts
 */

import { describe, expect, it } from 'vitest'

import { NOTAM, SectionQ } from '../../../src/components/notamUtils'
import { Polygon, Polyline } from 'leaflet'
import type { LatLng } from 'leaflet'
import { Circle } from 'leaflet'

/**
 * Tests for the Q section parser
 */
describe('Q section parser', () => {
  it('should accept valid Q sections', () => {
    // Something near Le Versoud
    let section = new SectionQ('LFMM / QPLLT / V / M / A / 000/999 / 4513N00551E005')
    expect(section.fir).toBe('LFMM')
    expect(section.qCode).toBe('QPLLT')
    expect(section.trafic).toBe('V')
    expect(section.object).toBe('M')
    expect(section.scope).toBe('A')
    expect(section.limitLow).toBe('000')
    expect(section.limitHigh).toBe('999')
    expect(section.center).not.toBeNull()
    expect(section.center?.lat).toBeCloseTo(45.22)
    expect(section.center?.lng).toBeCloseTo(5.85)
    expect(section.center?.alt).toBeUndefined()
    expect(section.radiusNM).toBe(5)

    // Something near Paris Orly
    section = new SectionQ('LFFF / QOBCE / IV / M / AE / 005/008 / 4841N00213E001')
    expect(section.fir).toBe('LFFF')
    expect(section.qCode).toBe('QOBCE')
    expect(section.trafic).toBe('IV')
    expect(section.object).toBe('M')
    expect(section.scope).toBe('AE')
    expect(section.limitLow).toBe('005')
    expect(section.limitHigh).toBe('008')
    expect(section.center).not.toBeNull()
    expect(section.center?.lat).toBeCloseTo(48.68)
    expect(section.center?.lng).toBeCloseTo(2.22)
    expect(section.center?.alt).toBeUndefined()
    expect(section.radiusNM).toBe(1)

    // Something near Brest, no spaces
    section = new SectionQ('LFRR/QICAS/I/NBO/A/000/999/4827N00425W025')
    expect(section.fir).toBe('LFRR')
    expect(section.qCode).toBe('QICAS')
    expect(section.trafic).toBe('I')
    expect(section.object).toBe('NBO')
    expect(section.scope).toBe('A')
    expect(section.limitLow).toBe('000')
    expect(section.limitHigh).toBe('999')
    expect(section.center).not.toBeNull()
    expect(section.center?.lat).toBeCloseTo(48.45)
    expect(section.center?.lng).toBeCloseTo(-4.42)
    expect(section.center?.alt).toBeUndefined()
    expect(section.radiusNM).toBe(25)

    // Something near the borders
    section = new SectionQ('LFXX / QAFCH / IV / NBO / E / 115/195 / 4645N00205E266')
    expect(section.fir).toBe('LFXX')
    expect(section.qCode).toBe('QAFCH')
    expect(section.trafic).toBe('IV')
    expect(section.object).toBe('NBO')
    expect(section.scope).toBe('E')
    expect(section.limitLow).toBe('115')
    expect(section.limitHigh).toBe('195')
    expect(section.center).not.toBeNull()
    expect(section.center?.lat).toBeCloseTo(46.75)
    expect(section.center?.lng).toBeCloseTo(2.08)
    expect(section.center?.alt).toBeUndefined()
    expect(section.radiusNM).toBe(266)
  })
  it('should accept precise locations', () => {
    // Something near Le Versoud, precise
    const section = new SectionQ('LFMM / QPLLT / V / M / A / 000/999 / 451305N0055105E003')
    expect(section.center).not.toBeNull()
    expect(section.center?.lat).toBeCloseTo(45.218, 3)
    expect(section.center?.lng).toBeCloseTo(5.851, 3)
    expect(section.center?.alt).toBeUndefined()
  })
  it('should reject empty Q sections', () => {
    // Invalid number of parts
    expect(() => new SectionQ('')).toThrowError(/Invalid Q section/)
    expect(() => new SectionQ('//////')).toThrowError(/Invalid Q section/)
    // Empty sections
    expect(() => new SectionQ('///////')).toThrowError(/Empty Q section/)
  })
  it('should accept partially empty Q sections', () => {
    // Mixed empty sections
    const section = new SectionQ('LFFF / QOBCE / IV / / AE / / / 4841N00213E001')
    expect(section.fir).toBe('LFFF')
    expect(section.qCode).toBe('QOBCE')
    expect(section.trafic).toBe('IV')
    expect(section.object).toBe('')
    expect(section.scope).toBe('AE')
    expect(section.limitLow).toBe('')
    expect(section.limitHigh).toBe('')
    expect(section.center).not.toBeNull()
    expect(section.center?.lat).toBeCloseTo(48.68)
    expect(section.center?.lng).toBeCloseTo(2.22)
    expect(section.center?.alt).toBeUndefined()
    expect(section.radiusNM).toBe(1)
  })
  it('should nullify invalid Q locations', () => {
    // Invalid location
    let section = new SectionQ('LFMM / QPLLT / V / M / A / 000/999 / 9500N00550E005')
    expect(section.center).toBeNull()
    expect(section.radiusNM).toBeNull()

    section = new SectionQ('LFMM / QPLLT / V / M / A / 000/999 / 8000N19050E005')
    expect(section.center).toBeNull()
    expect(section.radiusNM).toBeNull()

    section = new SectionQ('LFMM / QPLLT / V / M / A / 000/999 / 484100213E001')
    expect(section.center).toBeNull()
    expect(section.radiusNM).toBeNull()

    section = new SectionQ('LFMM / QPLLT / V / M / A / 000/999 / 48410N0213001')
    expect(section.center).toBeNull()
    expect(section.radiusNM).toBeNull()

    section = new SectionQ('LFMM / QPLLT / V / M / A / 000/999 / 4841N00213E')
    expect(section.center).toBeNull()
    expect(section.radiusNM).toBeNull()

    section = new SectionQ('LFMM / QPLLT / V / M / A / 000/999 / 484100213001')
    expect(section.center).toBeNull()
    expect(section.radiusNM).toBeNull()
  })
})

/**
 * Tests with known NOTAMs
 */
describe('Known NOTAMs', () => {
  const simpleNotam = `
- LFFA-D0911/25
- DU: 26 02 2025 16:00 AU: 22 03 2025 08:00
- A) LFLG
- Q) LFMM / QFULT / IV / NBO / A / 000/999 / 4513N00551E005
- E) AVITAILLEMENT AVGAS 100LL UNIQUEMENT PAR CARTE BP STERLING.
`

  const craneNotam = `
- LFFA-P2172/24
- DU: 10 06 2024 09:33 AU: 31 05 2025 23:59
- A) LFLB
- Q) LFMM / QOBCE / IV / M / A / 000/999 / 4538N00553E005
- E) GRUE A TOUR ERIGEE A LA MOTTE SERVOLEX :
    PSN : 453601N 0055204E
    RDL/D : 192/2.40 NM ARP LFLB
    ALT AU SOMMET : 984FT
    HAUT : 86FT
    BAL : JOUR ET NUIT.
`

  const cableNotam = `
- LFFA-P4430/24
- DU: 02 01 2025 07:00 AU: 31 12 2025 00:00
- A) LFLP
- Q) LFMM / QOBCE / IV / M / AE / 000/022 / 4555N00612E001
- E) PRESENCE D'UN CABLE TENDU A ANNECY LE VIEUX RDL 106/3.9NM ARP: PSN MOYENNE: 455445N 0061146E ANCRAGE BAS: 455445N 0061151E ALTITUDE 1903FT ANCRAGE HAUT: 455445N 0061142E ALTITUDE 2198FT LONGUEUR 200M ORIENTATION 90/270 BALISAGE NIL
`

  const highLineNotam = `
- LFFA-P1487/25
- DU: 08 05 2025 06:00 AU: 11 05 2025 16:00
- A) LFMM
- Q) LFMM / QOBCE / IV / M / E / 000/059 / 4551N00615E001
- E) CABLE HIGHLINE AUX 'DENTS DE LANFON COMMUNE D'ALEX' PSN MOYENNE : 455126N 0061435E RDL : 128/7.20NM LFLP ARP PSN POINT ANCRAGE 1 : 455128.15N 0061432.72E PSN POINT ANCRAGE 2 : 455124.87N 0061436.78E LONGUEUR : 130M ORIENTATION : 139/319 ALTITUDE : 5876FT HAUTEUR : 328FT BALISAGE : JOUR ET NUIT
`

  const windMillsNotam = `
- LFFA-P0227/25
- DU: 21 01 2025 15:22 AU: PERM
- A) LFBB
- Q) LFBB / QOBCE / IV / M / E / 000/011 / 4520N00014W002
- E) PARC EOLIEN DE 6 EOLIENNES A 'CHANTILLAC', RDL 067.3/10.48NM ARP LFDC. -EOLIENNE 1 : PSN : 451949.33N 0001354.37W HAUT : 591FT ALT AU SOMMET : 978FT BALISAGE : JOUR ET NUIT -EOLIENNE 2 : PSN : 452009N 0001415.04W HAUT : 591FT ALT AU SOMMET : 919FT BALISAGE : JOUR ET NUIT -EOLIENNE 3 : PSN : 452027.01N 0001413.03W HAUT : 591FT ALT AU SOMMET : 955FT BALISAGE : JOUR ET NUIT -EOLIENNE 4 : PSN : 452032.21N 0001336.8W HAUT : 591FT ALT AU SOMMET : 985FT BALISAGE : JOUR ET NUIT -EOLIENNE 5 : PSN : 452046.65N 0001346.52W HAUT : 591FT ALT AU SOMMET : 968FT BALISAGE : JOUR ET NUIT -EOLIENNE 6 : PSN : 452046.04N 0001245.7W HAUT : 591FT ALT AU SOMMET : 1014FT BALISAGE : JOUR ET NUIT REF AIP FRANCE DATASET ENR 5.4
`

  const bordersNotam = `
- LFFA-F0670/25
- DU: 07 05 2025 13:24 AU: PERM
- A) LFMM LFBB LFFF LFEE
- Q) LFXX / QAFCH / IV / NBO / E / 115/195 / 4645N00205E266
- E) CORRECTION DES COORDONNEES 'LTA FRANCE PARTIE 1'(REF ENR 2.1) LIRE : 510700N 0020000E 510521N 0023244E FRONTIERE FRANCO-BELGE 493247N 0054907E FRONTIERE FRANCO-LUXEMBOURGEOISE 492700N 0060000E 485700N 0044800E 481500N 0054400E 481000N 0051000E 472500N 0042000E 463000N 0045000E 463000N 0031600E 461943N 0025459E 454245N 0030016E 454249N 0025943E 443710N 0030226E 434254N 0024225E 431251N 0024224E 431521N 0023419E 430000N 0021630E 423528N 0024408E 422500N 0024255E FRONTIERE FRANCO-ESPAGNOLE 432100N 0014700W 433500N 0014700W 455853N 0013936W 461248N 0005631W 461818N 0004320W 463000N 0001500W 500000N 0001500W 504000N 0012800E 510000N 0012800E 510700N 0020000E
`

  const italianNotam = `
- LIIA-W1173/25
- DU: 18 04 2025 09:00 AU: 27 04 2025 17:30
- A) LIMM
- Q) LIMM / QRTCA / IV / BO / W / 000/195 / 4515N00748E062
- D) 18-21 25-27 0900-1730
- E) TEMPORARY RESTRICTED AREA IMPLEMENTED AS FOLLOWS: 461206N0081430E-461258N0081918E-460805N0082758E-455303N0082728E- 451724N0073019E-450620N0072900E-445325N0071904E-443910N0072336E- 442145N0075151E-441850N0071810E-450430N0064240E- 461206N0081430E /ITALY NW/ DUE TO GLIDERS COMPETITION RMK: 1. DEP/ARR SITE: LIMA (TORINO AERITALIA AD) 2. ACT SHALL BE CONDUCTED WITHIN ITALIAN TERRITORY 3. ACT WILL BE CONDUCTED IN G AIRSPACE AS INDICATED IN AIP ENR 2.1.1.1-1 AND ENR 6.3-3 OUTSIDE CONTROLLED AIR SPACE, DANGER PROHIBITED, RESTRICTED AREAS AND TEMPORARY RESERVED AND SEGREGATED AIRSPACE. 4. ACT SUBJ PRIOR COOR WITH MILANO ACC AND MILANO SCCAM (ITALIAN AIR FORCE COORDINATION AND CONTROL SERVICE)
- F) GND
- G) FL195
`

  const swissCraneNotam = `
LSSN-A0094/25
DU: 25 02 2025 00:00 AU: 05 11 2025 23:59 EST
A) LSGG
Q) LSAS / QOBCE / V / M / AE / 000/017 / 4611N00608E001
E) CRANE MARKED, LGTD, 461117N0060750E, 117.6M / 386.0FT AGL,
494.8M / 1623.5FT AMSL.
LSGP LA COTE`

  const belgianWindMillsNotam = `
EBBR-F0679/25
DU: 17 03 2025 10:30 AU: 31 03 2025 10:30 EST
A) EBBU
Q) EBBU / QOLAS / IV / M / E / 000/025 / 5032N00431E002
E) MARBAIS 7 WIND TURBINES 503229N 0043047E - 503212N 0043123E -
503201N 0043133E - 503212N 0043034E - 503155N 0043105E - 503217N
0042956E - 503149N 0043043E - 503212N 0043123E 119M AGL. OBST LGT U/S
`

  const faaShuttleNotam = `
!FDC 1/7006
A) ZJX
Q) .... / .... / IV / ... / ... / 000/999 / 2837N08030W030
E) TEMPORARY FLIGHT RESTRICTIONS. PURSUANT TO 14 CFR SECTION 91.143, FLT LIMITATION IN THE PROXIMITY OF EROP X0763 FALCON-9 INSPIRATION-4 SPACE FLT OPS, OPS BY FAA CERT PILOTS OR UNITED STATES REG ACFT ARE PROHIBITED WI AN AREA DEFINED AS 285116N0804219W (OMN141034.4) TO 290730N0803000W (OMN108033.9) THEN CLOCKWISE VIA A 30 NM ARC CENTERED AT 283703N0803647W (OMN147048.7) TO 281330N0801600W (OMN145078.4) TO 282501N0803029W (OMN149061.9) TO 282501N0803759W (OMN155058.8) TO 282501N0804144W (OMN157057.4) TO 283121N0804349W (OMN157050.9) TO 283801N0804701W (OMN157043.7) TO 284910N0805044W (OMN154032.2) TO 285116N0804714W (OMN148031.8) TO POINT OF ORIGIN. SFC-FL180. MIAMI /ZMA/ ARTCC IS THE FAA CDN FACILITY TEL 305-716-1589. THIS AREA ENCOMPASSES R2932, R2933, R2934, AND PORTIONS OF W137F, W137G, W497A. ADDITIONAL WARNING AND RESTRICTED AREAS WILL BE ACT. PILOTS MUST CONSULT ALL NOTAMS REGARDING THESE OPS AND MAY CTC ZMA FOR CURRENT AIRSPACE STATUS. 2109162305-2109170538
`

  it('should accept NOTAMs with or without prefix', () => {
    for (const notamText of [
      simpleNotam,
      simpleNotam.replaceAll('- ', '* '),
      simpleNotam.replaceAll('- ', ' '),
      simpleNotam.replaceAll('- ', ''),
      simpleNotam.replaceAll('- ', '\t'),
    ]) {
      const notam = new NOTAM(notamText, 0)
      // Check basic properties
      expect(notam.idx).toEqual(0)
      expect(notam.text).toEqual(notamText)
      expect(notam.id).toEqual('LFFA-D0911/25')

      // Check parsed sections
      expect(notam.sectionA).not.toBeNull()
      expect(notam.sectionA?.target).toEqual('LFLG')
      expect(notam.sectionQ).not.toBeNull()
      expect(notam.sectionQ?.fir).toEqual('LFMM')
      expect(notam.sectionQ?.qCode).toEqual('QFULT')
      expect(notam.sectionQ?.trafic).toEqual('IV')
      expect(notam.sectionQ?.object).toEqual('NBO')
      expect(notam.sectionQ?.scope).toEqual('A')
      expect(notam.sectionQ?.limitLow).toEqual('000')
      expect(notam.sectionQ?.limitHigh).toEqual('999')
      expect(notam.sectionQ?.center).not.toBeNull()
      expect(notam.sectionQ?.center?.lat).toBeCloseTo(45.22)
      expect(notam.sectionQ?.center?.lng).toBeCloseTo(5.85)
      expect(notam.sectionQ?.center?.alt).toBeUndefined()
      expect(notam.sectionQ?.radiusNM).toEqual(5)

      // Check raw sections
      expect(notam.rawSections.size).toEqual(4)

      // Check HEADER meta section
      const header = notam.rawSections.get('HEADER')
      expect(header).not.toBeNull()
      expect(header).toContain('LFFA-D0911/25')
      expect(header).toContain('DU: 26 02 2025 16:00 AU: 22 03 2025 08:00')

      // Check section A content
      const sectionA = notam.rawSections.get('A')
      expect(sectionA).not.toBeNull()
      expect(sectionA).toEqual('LFLG')

      // Check section Q content
      const sectionQ = notam.rawSections.get('Q')
      expect(sectionQ).not.toBeNull()
      expect(sectionQ).toEqual('LFMM / QFULT / IV / NBO / A / 000/999 / 4513N00551E005')

      // Check section E content
      const sectionE = notam.rawSections.get('E')
      expect(sectionE).not.toBeNull()
      expect(sectionE).toEqual('AVITAILLEMENT AVGAS 100LL UNIQUEMENT PAR CARTE BP STERLING.')
    }
  })

  it('should extract crane locations', () => {
    let notam = new NOTAM(craneNotam, 1)
    expect(notam.id).toEqual('LFFA-P2172/24')
    expect(notam.sectionQ).not.toBeNull()
    expect(notam.sectionQ?.fir).toEqual('LFMM')
    expect(notam.sectionQ?.qCode).toEqual('QOBCE')
    expect(notam.sectionQ?.trafic).toEqual('IV')
    expect(notam.sectionQ?.object).toEqual('M')
    expect(notam.sectionQ?.scope).toEqual('A')
    expect(notam.sectionQ?.limitLow).toEqual('000')
    expect(notam.sectionQ?.limitHigh).toEqual('999')
    expect(notam.sectionQ?.center).not.toBeNull()
    expect(notam.sectionQ?.center?.lat).toBeCloseTo(45.63)
    expect(notam.sectionQ?.center?.lng).toBeCloseTo(5.88)
    expect(notam.sectionQ?.center?.alt).toBeUndefined()
    expect(notam.sectionQ?.radiusNM).toEqual(5)

    // Single point => Circle of 1m radius
    expect(notam.polygons[0] instanceof Circle).toBeTruthy()
    let circle = notam.polygons[0] as Circle
    expect(circle.getRadius()).toEqual(1)
    let latlng = circle.getLatLng()
    expect(latlng.lat).toBeCloseTo(45.6, 3)
    expect(latlng.lng).toBeCloseTo(5.868, 3)

    notam = new NOTAM(swissCraneNotam, 2)
    expect(notam.id).toEqual('LSSN-A0094/25')
    expect(notam.sectionQ).not.toBeNull()
    expect(notam.sectionQ?.fir).toEqual('LSAS')
    expect(notam.sectionQ?.qCode).toEqual('QOBCE')
    expect(notam.sectionQ?.trafic).toEqual('V')
    expect(notam.sectionQ?.object).toEqual('M')
    expect(notam.sectionQ?.scope).toEqual('AE')
    expect(notam.sectionQ?.limitLow).toEqual('000')
    expect(notam.sectionQ?.limitHigh).toEqual('017')
    expect(notam.sectionQ?.center).not.toBeNull()
    expect(notam.sectionQ?.center?.lat).toBeCloseTo(46.183)
    expect(notam.sectionQ?.center?.lng).toBeCloseTo(6.133)
    expect(notam.sectionQ?.center?.alt).toBeUndefined()
    expect(notam.sectionQ?.radiusNM).toEqual(1)

    expect(notam.polygons).not.toBeNull()
    expect(notam.polygons.length).toEqual(1)

    expect(notam.polygons[0] instanceof Circle).toBeTruthy()
    circle = notam.polygons[0] as Circle
    expect(circle.getRadius()).toEqual(1)
    latlng = circle.getLatLng()
    expect(latlng.lat).toBeCloseTo(46.188, 3)
    expect(latlng.lng).toBeCloseTo(6.131, 3)
  })

  it('should extract wind mill locations', () => {
    let notam = new NOTAM(windMillsNotam, 3)
    expect(notam.id).toEqual('LFFA-P0227/25')
    expect(notam.sectionQ).not.toBeNull()
    expect(notam.sectionQ?.fir).toEqual('LFBB')
    expect(notam.sectionQ?.qCode).toEqual('QOBCE')
    expect(notam.sectionQ?.trafic).toEqual('IV')
    expect(notam.sectionQ?.object).toEqual('M')
    expect(notam.sectionQ?.scope).toEqual('E')
    expect(notam.sectionQ?.limitLow).toEqual('000')
    expect(notam.sectionQ?.limitHigh).toEqual('011')
    expect(notam.sectionQ?.center).not.toBeNull()
    expect(notam.sectionQ?.center?.lat).toBeCloseTo(45.33)
    expect(notam.sectionQ?.center?.lng).toBeCloseTo(-0.23)
    expect(notam.sectionQ?.center?.alt).toBeUndefined()
    expect(notam.sectionQ?.radiusNM).toEqual(2)

    expect(notam.polygons).not.toBeNull()
    expect(notam.polygons.length).toEqual(6)

    let latlng = (notam.polygons[0] as Circle).getLatLng()
    expect(latlng.lat).toBeCloseTo(45.33, 3)
    expect(latlng.lng).toBeCloseTo(-0.232, 3)

    latlng = (notam.polygons[1] as Circle).getLatLng()
    expect(latlng.lat).toBeCloseTo(45.336, 3)
    expect(latlng.lng).toBeCloseTo(-0.238, 3)

    latlng = (notam.polygons[2] as Circle).getLatLng()
    expect(latlng.lat).toBeCloseTo(45.341, 3)
    expect(latlng.lng).toBeCloseTo(-0.237, 3)

    latlng = (notam.polygons[3] as Circle).getLatLng()
    expect(latlng.lat).toBeCloseTo(45.342, 3)
    expect(latlng.lng).toBeCloseTo(-0.227, 3)

    latlng = (notam.polygons[4] as Circle).getLatLng()
    expect(latlng.lat).toBeCloseTo(45.346, 3)
    expect(latlng.lng).toBeCloseTo(-0.23, 3)

    latlng = (notam.polygons[5] as Circle).getLatLng()
    expect(latlng.lat).toBeCloseTo(45.346, 3)
    expect(latlng.lng).toBeCloseTo(-0.213, 3)

    // Note that this NOTAM contains a duplicated location (2 and 8)
    // This is ignored by the parser
    notam = new NOTAM(belgianWindMillsNotam, 4)
    expect(notam.id).toEqual('EBBR-F0679/25')
    expect(notam.sectionQ).not.toBeNull()
    expect(notam.sectionQ?.fir).toEqual('EBBU')
    expect(notam.sectionQ?.qCode).toEqual('QOLAS')
    expect(notam.sectionQ?.trafic).toEqual('IV')
    expect(notam.sectionQ?.object).toEqual('M')
    expect(notam.sectionQ?.scope).toEqual('E')
    expect(notam.sectionQ?.limitLow).toEqual('000')
    expect(notam.sectionQ?.limitHigh).toEqual('025')
    expect(notam.sectionQ?.center).not.toBeNull()
    expect(notam.sectionQ?.center?.lat).toBeCloseTo(50.53)
    expect(notam.sectionQ?.center?.lng).toBeCloseTo(4.52)
    expect(notam.sectionQ?.center?.alt).toBeUndefined()
    expect(notam.sectionQ?.radiusNM).toEqual(2)

    expect(notam.polygons).not.toBeNull()
    // Due to the wind mills locations being separated by a dash (-),
    // it is considered as a single polygon, not a set of points
    expect(notam.polygons.length).toEqual(1)
    expect(notam.polygons[0] instanceof Polygon).toBeTruthy()
    const polygon = notam.polygons[0] as Polygon

    // Polygons are polylines, here we have 1 line
    // with 8 points (7 wind mills + duplicated point)
    let latlngs = polygon.getLatLngs()
    expect(latlngs.length).toBe(1)
    expect((latlngs[0] as LatLng[]).length).toBe(8)

    latlngs = latlngs[0] as LatLng[]
    expect(latlngs[0]!.lat).toBeCloseTo(50.541, 3)
    expect(latlngs[0]!.lng).toBeCloseTo(4.513, 3)
    expect(latlngs[1]!.lat).toBeCloseTo(50.537, 3)
    expect(latlngs[1]!.lng).toBeCloseTo(4.523, 3)
    expect(latlngs[2]!.lat).toBeCloseTo(50.534, 3)
    expect(latlngs[2]!.lng).toBeCloseTo(4.526, 3)
    expect(latlngs[3]!.lat).toBeCloseTo(50.537, 3)
    expect(latlngs[3]!.lng).toBeCloseTo(4.509, 3)
    expect(latlngs[4]!.lat).toBeCloseTo(50.532, 3)
    expect(latlngs[4]!.lng).toBeCloseTo(4.518, 3)
    expect(latlngs[5]!.lat).toBeCloseTo(50.538, 3)
    expect(latlngs[5]!.lng).toBeCloseTo(4.499, 3)
    expect(latlngs[6]!.lat).toBeCloseTo(50.53, 3)
    expect(latlngs[6]!.lng).toBeCloseTo(4.512, 3)
    // Duplicatioon of 2nd wind mill
    expect(latlngs[7]!.lat).toBeCloseTo(50.537, 3)
    expect(latlngs[7]!.lng).toBeCloseTo(4.523, 3)
  })

  it('should extract cables and high lines', () => {
    let notam = new NOTAM(cableNotam, 5)
    expect(notam.id).toEqual('LFFA-P4430/24')
    expect(notam.sectionQ).not.toBeNull()
    expect(notam.sectionQ?.fir).toEqual('LFMM')
    expect(notam.sectionQ?.qCode).toEqual('QOBCE')
    expect(notam.sectionQ?.trafic).toEqual('IV')
    expect(notam.sectionQ?.object).toEqual('M')
    expect(notam.sectionQ?.scope).toEqual('AE')
    expect(notam.sectionQ?.limitLow).toEqual('000')
    expect(notam.sectionQ?.limitHigh).toEqual('022')
    expect(notam.sectionQ?.center).not.toBeNull()
    expect(notam.sectionQ?.center?.lat).toBeCloseTo(45.92)
    expect(notam.sectionQ?.center?.lng).toBeCloseTo(6.2)
    expect(notam.sectionQ?.center?.alt).toBeUndefined()
    expect(notam.sectionQ?.radiusNM).toEqual(1)

    expect(notam.polygons).not.toBeNull()
    expect(notam.polygons.length).toEqual(2)

    // First layer is the average location
    expect(notam.polygons[0] instanceof Circle).toBeTruthy()
    let circle = notam.polygons[0] as Circle
    expect(circle.getRadius()).toEqual(1)
    let latlng = circle.getLatLng()
    expect(latlng.lat).toBeCloseTo(45.913, 3)
    expect(latlng.lng).toBeCloseTo(6.196, 3)

    // Second layer is the cable itself
    expect(notam.polygons[1] instanceof Polyline).toBeTruthy()
    let polyline = notam.polygons[1] as Polyline
    let latlngs = polyline.getLatLngs() as LatLng[]
    expect(latlngs[0]!.lat).toBeCloseTo(45.913, 3)
    expect(latlngs[0]!.lng).toBeCloseTo(6.198, 3)
    expect(latlngs[1]!.lat).toBeCloseTo(45.913, 3)
    expect(latlngs[1]!.lng).toBeCloseTo(6.195, 3)

    notam = new NOTAM(highLineNotam, 6)
    expect(notam.id).toEqual('LFFA-P1487/25')
    expect(notam.sectionQ).not.toBeNull()
    expect(notam.sectionQ?.fir).toEqual('LFMM')
    expect(notam.sectionQ?.qCode).toEqual('QOBCE')
    expect(notam.sectionQ?.trafic).toEqual('IV')
    expect(notam.sectionQ?.object).toEqual('M')
    expect(notam.sectionQ?.scope).toEqual('E')
    expect(notam.sectionQ?.limitLow).toEqual('000')
    expect(notam.sectionQ?.limitHigh).toEqual('059')
    expect(notam.sectionQ?.center).not.toBeNull()
    expect(notam.sectionQ?.center?.lat).toBeCloseTo(45.85)
    expect(notam.sectionQ?.center?.lng).toBeCloseTo(6.25)
    expect(notam.sectionQ?.center?.alt).toBeUndefined()
    expect(notam.sectionQ?.radiusNM).toEqual(1)

    expect(notam.polygons).not.toBeNull()
    expect(notam.polygons.length).toEqual(2)
    // First layer is the average location
    expect(notam.polygons[0] instanceof Circle).toBeTruthy()
    circle = notam.polygons[0] as Circle
    expect(circle.getRadius()).toEqual(1)
    latlng = circle.getLatLng()
    expect(latlng.lat).toBeCloseTo(45.857, 3)
    expect(latlng.lng).toBeCloseTo(6.243, 3)

    // Second layer is the cable itself
    expect(notam.polygons[1] instanceof Polyline).toBeTruthy()
    polyline = notam.polygons[1] as Polyline
    latlngs = polyline.getLatLngs() as LatLng[]
    expect(latlngs[0]!.lat).toBeCloseTo(45.858, 3)
    expect(latlngs[0]!.lng).toBeCloseTo(6.242, 3)
    expect(latlngs[1]!.lat).toBeCloseTo(45.857, 3)
    expect(latlngs[1]!.lng).toBeCloseTo(6.244, 3)
  })

  it('should extract border coordinates', () => {
    const notam = new NOTAM(bordersNotam, 7)
    expect(notam.id).toEqual('LFFA-F0670/25')
    expect(notam.sectionQ).not.toBeNull()
    expect(notam.sectionQ?.fir).toEqual('LFXX')
    expect(notam.sectionQ?.qCode).toEqual('QAFCH')
    expect(notam.sectionQ?.trafic).toEqual('IV')
    expect(notam.sectionQ?.object).toEqual('NBO')
    expect(notam.sectionQ?.scope).toEqual('E')
    expect(notam.sectionQ?.limitLow).toEqual('115')
    expect(notam.sectionQ?.limitHigh).toEqual('195')
    expect(notam.sectionQ?.center).not.toBeNull()
    expect(notam.sectionQ?.center?.lat).toBeCloseTo(46.75)
    expect(notam.sectionQ?.center?.lng).toBeCloseTo(2.08)
    expect(notam.sectionQ?.center?.alt).toBeUndefined()
    expect(notam.sectionQ?.radiusNM).toEqual(266)

    // We have 4 blocks of coordinates
    expect(notam.polygons).not.toBeNull()
    expect(notam.polygons.length).toEqual(4)

    // First block: two points => line
    expect(notam.polygons[0] instanceof Polyline).toBeTruthy()
    const polyline = notam.polygons[0] as Polyline
    let latlngs = polyline.getLatLngs() as LatLng[]
    expect(latlngs.length).toEqual(2)
    expect(latlngs[0]!.lat).toBeCloseTo(51.117, 3)
    expect(latlngs[0]!.lng).toBeCloseTo(2, 3)
    expect(latlngs[1]!.lat).toBeCloseTo(51.089, 3)
    expect(latlngs[1]!.lng).toBeCloseTo(2.546, 3)

    // 2nd block: 1 point => circle
    expect(notam.polygons[1] instanceof Circle).toBeTruthy()
    const circle = notam.polygons[1] as Circle
    expect(circle.getRadius()).toEqual(1)
    const latlng = circle.getLatLng()
    expect(latlng.lat).toBeCloseTo(49.546, 3)
    expect(latlng.lng).toBeCloseTo(5.819, 3)

    // 3rd block: 17 points => polygon
    expect(notam.polygons[2] instanceof Polygon).toBeTruthy()
    let polygon = notam.polygons[2] as Polygon
    let polyLatLngs = polygon.getLatLngs() as LatLng[][]
    expect(polyLatLngs.length).toEqual(1)
    latlngs = polyLatLngs[0] as LatLng[]
    expect(latlngs.length).toEqual(17)
    expect(latlngs[0]!.lat).toBeCloseTo(49.45, 3)
    expect(latlngs[0]!.lng).toBeCloseTo(6, 3)
    expect(latlngs[1]!.lat).toBeCloseTo(48.95, 3)
    expect(latlngs[1]!.lng).toBeCloseTo(4.8, 3)
    expect(latlngs[2]!.lat).toBeCloseTo(48.25, 3)
    expect(latlngs[2]!.lng).toBeCloseTo(5.733, 3)
    expect(latlngs[3]!.lat).toBeCloseTo(48.167, 3)
    expect(latlngs[3]!.lng).toBeCloseTo(5.167, 3)
    expect(latlngs[4]!.lat).toBeCloseTo(47.417, 3)
    expect(latlngs[4]!.lng).toBeCloseTo(4.333, 3)
    expect(latlngs[5]!.lat).toBeCloseTo(46.5, 3)
    expect(latlngs[5]!.lng).toBeCloseTo(4.833, 3)
    expect(latlngs[6]!.lat).toBeCloseTo(46.5, 3)
    expect(latlngs[6]!.lng).toBeCloseTo(3.267, 3)
    expect(latlngs[7]!.lat).toBeCloseTo(46.329, 3)
    expect(latlngs[7]!.lng).toBeCloseTo(2.916, 3)
    expect(latlngs[8]!.lat).toBeCloseTo(45.7125, 3)
    expect(latlngs[8]!.lng).toBeCloseTo(3.004, 3)
    expect(latlngs[9]!.lat).toBeCloseTo(45.714, 3)
    expect(latlngs[9]!.lng).toBeCloseTo(2.995, 3)
    expect(latlngs[10]!.lat).toBeCloseTo(44.619, 3)
    expect(latlngs[10]!.lng).toBeCloseTo(3.041, 3)
    expect(latlngs[11]!.lat).toBeCloseTo(43.715, 3)
    expect(latlngs[11]!.lng).toBeCloseTo(2.707, 3)
    expect(latlngs[12]!.lat).toBeCloseTo(43.214, 3)
    expect(latlngs[12]!.lng).toBeCloseTo(2.707, 3)
    expect(latlngs[13]!.lat).toBeCloseTo(43.256, 3)
    expect(latlngs[13]!.lng).toBeCloseTo(2.572, 3)
    expect(latlngs[14]!.lat).toBeCloseTo(43, 3)
    expect(latlngs[14]!.lng).toBeCloseTo(2.275, 3)
    expect(latlngs[15]!.lat).toBeCloseTo(42.591, 3)
    expect(latlngs[15]!.lng).toBeCloseTo(2.736, 3)
    expect(latlngs[16]!.lat).toBeCloseTo(42.417, 3)
    expect(latlngs[16]!.lng).toBeCloseTo(2.715, 3)

    // 4th block: 10 points => polygon
    expect(notam.polygons[3] instanceof Polygon).toBeTruthy()
    polygon = notam.polygons[3] as Polygon
    polyLatLngs = polygon.getLatLngs() as LatLng[][]
    expect(polyLatLngs.length).toEqual(1)
    latlngs = polyLatLngs[0] as LatLng[]
    expect(latlngs.length).toEqual(10)
    expect(latlngs[0]!.lat).toBeCloseTo(43.35, 3)
    expect(latlngs[0]!.lng).toBeCloseTo(-1.783, 3)
    expect(latlngs[1]!.lat).toBeCloseTo(43.583, 3)
    expect(latlngs[1]!.lng).toBeCloseTo(-1.783, 3)
    expect(latlngs[2]!.lat).toBeCloseTo(45.981, 3)
    expect(latlngs[2]!.lng).toBeCloseTo(-1.66, 3)
    expect(latlngs[3]!.lat).toBeCloseTo(46.213, 3)
    expect(latlngs[3]!.lng).toBeCloseTo(-0.942, 3)
    expect(latlngs[4]!.lat).toBeCloseTo(46.305, 3)
    expect(latlngs[4]!.lng).toBeCloseTo(-0.722, 3)
    expect(latlngs[5]!.lat).toBeCloseTo(46.5, 3)
    expect(latlngs[5]!.lng).toBeCloseTo(-0.25, 3)
    expect(latlngs[6]!.lat).toBeCloseTo(50, 3)
    expect(latlngs[6]!.lng).toBeCloseTo(-0.25, 3)
    expect(latlngs[7]!.lat).toBeCloseTo(50.667, 3)
    expect(latlngs[7]!.lng).toBeCloseTo(1.467, 3)
    expect(latlngs[8]!.lat).toBeCloseTo(51, 3)
    expect(latlngs[8]!.lng).toBeCloseTo(1.467, 3)
    expect(latlngs[9]!.lat).toBeCloseTo(51.117, 3)
    expect(latlngs[9]!.lng).toBeCloseTo(2, 3)
  })
})
