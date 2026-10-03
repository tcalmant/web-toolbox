/**
 * Copyright (c) 2026 Thomas Calmant
 * All rights reserved.
 *
 * Tests for domain/time.ts
 * Tests for domain/metar.ts
 */

import { describe, expect, it } from 'vitest'

import {
  isTaf,
  parseMetar,
  parseReports,
  parseTaf,
  splitReports,
  windSpeedKt,
  type Taf,
} from '../../../src/domain/metar'

describe('parseMetar', () => {
  it('decodes a quiet automatic METAR with a TEMPO trend', () => {
    const m = parseMetar(
      'METAR LFLB 031700Z AUTO 35001KT 9999 NSC 20/17 Q1027 TEMPO FEW045TCU BKN065',
    )
    expect(m).not.toBeNull()
    expect(m?.station).toBe('LFLB')
    expect(m?.kind).toBe('METAR')
    expect(m?.time).toEqual({ day: 3, hour: 17, minute: 0 })
    expect(m?.auto).toBe(true)
    expect(m?.wind).toEqual({ directionDeg: 350, speed: 1, gust: null, unit: 'KT' })
    expect(m?.visibilityM).toBe(9999)
    expect(m?.skyClear).toBe('NSC')
    expect(m?.temperatureC).toBe(20)
    expect(m?.dewPointC).toBe(17)
    expect(m?.qnhHpa).toBe(1027)
    expect(m?.trend).toBe('TEMPO FEW045TCU BKN065')
    expect(m?.unparsed).toEqual([])
  })

  it('decodes gusts, wind variation, weather and cloud layers', () => {
    const m = parseMetar(
      'LFPG 031700Z 27015G28KT 240V300 4000 -RA BR BKN008 OVC015 12/11 Q1008 BECMG 9999 NSW',
    )
    expect(m?.wind).toEqual({ directionDeg: 270, speed: 15, gust: 28, unit: 'KT' })
    expect(m?.windVariation).toEqual({ fromDeg: 240, toDeg: 300 })
    expect(m?.visibilityM).toBe(4000)
    expect(m?.weather).toEqual([
      { intensity: '-', descriptors: [], phenomena: ['RA'] },
      { intensity: '', descriptors: [], phenomena: ['BR'] },
    ])
    expect(m?.clouds).toEqual([
      { cover: 'BKN', heightFt: 800, type: null },
      { cover: 'OVC', heightFt: 1500, type: null },
    ])
    expect(m?.trend).toBe('BECMG 9999 NSW')
  })

  it('decodes CAVOK, variable wind and negative temperatures', () => {
    const m = parseMetar('METAR LFBO 031700Z VRB03KT CAVOK M02/M05 Q1016 NOSIG')
    expect(m?.cavok).toBe(true)
    expect(m?.wind?.directionDeg).toBeNull()
    expect(m?.temperatureC).toBe(-2)
    expect(m?.dewPointC).toBe(-5)
    expect(m?.trend).toBe('NOSIG')
  })

  it('decodes heavy thunderstorm with rain and a cumulonimbus layer', () => {
    const m = parseMetar('LFMN 031700Z 18020G35KT 2000 +TSRA SCT015CB 18/17 Q1005')
    expect(m?.weather[0]).toEqual({ intensity: '+', descriptors: ['TS'], phenomena: ['RA'] })
    expect(m?.clouds[0]).toEqual({ cover: 'SCT', heightFt: 1500, type: 'CB' })
  })

  it('decodes vertical visibility and vicinity showers', () => {
    const m = parseMetar('LFLL 031700Z 00000KT 0200 FG VV002 05/05 Q1020 VCSH')
    expect(m?.clouds).toEqual([{ cover: 'VV', heightFt: 200, type: null }])
    expect(m?.wind?.speed).toBe(0)
  })

  it('decodes a US METAR: statute miles, inHg altimeter, remarks', () => {
    const m = parseMetar('METAR KJFK 031651Z 18012G22KT 10SM FEW250 22/12 A3012 RMK AO2 SLP201')
    expect(m?.station).toBe('KJFK')
    expect(m?.visibilityM).toBe(16093)
    expect(m?.qnhHpa).toBe(1020)
    expect(m?.remarks).toBe('AO2 SLP201')
  })

  it('keeps unknown groups instead of failing', () => {
    const m = parseMetar('LFLB 031700Z 35001KT 9999 FOO 20/17 Q1027')
    expect(m?.unparsed).toEqual(['FOO'])
    expect(m?.qnhHpa).toBe(1027)
  })

  it('ignores RVR and recent weather groups', () => {
    const m = parseMetar('LFPG 031700Z 27005KT 0800 R26L/1200U FG VV001 08/08 Q1018 RERA')
    expect(m?.unparsed).toEqual([])
  })

  it('handles automatic station cloud type without cover', () => {
    const m = parseMetar('LFLS 031700Z AUTO 24003KT 9999 ///TCU 20/17 Q1027 NOSIG')
    expect(m?.clouds).toEqual([{ cover: 'FEW', heightFt: null, type: 'TCU' }])
    expect(m?.unparsed).toEqual([])
  })

  it('rejects text that is not a METAR', () => {
    expect(parseMetar('')).toBeNull()
    expect(parseMetar('hello world')).toBeNull()
    expect(parseMetar('LFLB nonsense')).toBeNull()
  })

  it('tolerates a trailing equals sign and extra whitespace', () => {
    expect(parseMetar('  LFLB   031700Z 35001KT CAVOK 20/17 Q1027 =\n')?.cavok).toBe(true)
  })
})

describe('windSpeedKt', () => {
  it('converts m/s and km/h to knots', () => {
    expect(windSpeedKt({ directionDeg: 0, speed: 10, gust: null, unit: 'MPS' })).toBeCloseTo(
      19.44,
      2,
    )
    expect(windSpeedKt({ directionDeg: 0, speed: 37, gust: null, unit: 'KMH' })).toBeCloseTo(
      19.98,
      2,
    )
    expect(windSpeedKt({ directionDeg: 0, speed: 12, gust: null, unit: 'KT' })).toBe(12)
  })
})

describe('parseTaf', () => {
  const raw =
    'TAF AMD LFLB 031635Z 0316/0415 VRB04KT CAVOK PROB30 TEMPO 0316/0318 -SHRA FEW045TCU BKN065 ' +
    'PROB30 TEMPO 0403/0406 4500 BR PROB30 TEMPO 0413/0415 FEW055TCU'

  it('decodes the header', () => {
    const t = parseTaf(raw)
    expect(t?.station).toBe('LFLB')
    expect(t?.amended).toBe(true)
    expect(t?.issued).toEqual({ day: 3, hour: 16, minute: 35 })
    expect(t?.validFrom).toEqual({ day: 3, hour: 16, minute: 0 })
    expect(t?.validTo).toEqual({ day: 4, hour: 15, minute: 0 })
  })

  it('splits the base forecast and the probability groups', () => {
    const t = parseTaf(raw)
    expect(t?.groups.map((g) => [g.kind, g.probability])).toEqual([
      ['BASE', null],
      ['TEMPO', 30],
      ['TEMPO', 30],
      ['TEMPO', 30],
    ])
    expect(t?.groups[0]?.cavok).toBe(true)
    expect(t?.groups[0]?.wind?.directionDeg).toBeNull()
    expect(t?.groups[1]?.from).toEqual({ day: 3, hour: 16, minute: 0 })
    expect(t?.groups[1]?.to).toEqual({ day: 3, hour: 18, minute: 0 })
    expect(t?.groups[1]?.weather[0]).toEqual({
      intensity: '-',
      descriptors: ['SH'],
      phenomena: ['RA'],
    })
    expect(t?.groups[2]?.visibilityM).toBe(4500)
  })

  it('decodes FM and BECMG groups, NSW and temperature groups', () => {
    const t = parseTaf(
      'TAF LFPG 031100Z 0312/0418 27010KT 9999 SCT030 TX20/0315Z TN08/0405Z ' +
        'BECMG 0318/0320 25005KT FM040600 VRB02KT CAVOK PROB40 0410/0414 3000 BR',
    )
    expect(t?.extras).toEqual(['TX20/0315Z', 'TN08/0405Z'])
    expect(t?.groups.map((g) => g.kind)).toEqual(['BASE', 'BECMG', 'FM', 'PROB'])
    expect(t?.groups[1]?.wind?.speed).toBe(5)
    expect(t?.groups[2]?.from).toEqual({ day: 4, hour: 6, minute: 0 })
    expect(t?.groups[3]?.probability).toBe(40)
    expect(t?.groups[3]?.to).toEqual({ day: 4, hour: 14, minute: 0 })
  })

  it('rejects text that is not a TAF', () => {
    expect(parseTaf('')).toBeNull()
    expect(parseTaf('TAF')).toBeNull()
    expect(parseTaf('LFLB 031635Z nonsense')).toBeNull()
  })
})

describe('splitReports / parseReports', () => {
  const text = `METAR LFLB 031700Z AUTO 35001KT 9999 NSC 20/17 Q1027=
LFLS 031700Z AUTO 24003KT 9999 NSC 20/17 Q1027 NOSIG

TAF LFLB 031635Z 0316/0415 VRB04KT CAVOK
  PROB30 TEMPO 0316/0318 -SHRA
  BECMG 0320/0322 27005KT`

  it('starts a new report on a header line and joins wrapped lines', () => {
    const reports = splitReports(text)
    expect(reports).toHaveLength(3)
    expect(reports[0]).toBe('METAR LFLB 031700Z AUTO 35001KT 9999 NSC 20/17 Q1027')
    expect(reports[2]).toBe(
      'TAF LFLB 031635Z 0316/0415 VRB04KT CAVOK PROB30 TEMPO 0316/0318 -SHRA BECMG 0320/0322 27005KT',
    )
  })

  it('parses METARs and TAFs in order and drops garbage', () => {
    const parsed = parseReports(`${text}\nthis is not a report`)
    expect(parsed.map((r) => r.station)).toEqual(['LFLB', 'LFLS', 'LFLB'])
    expect(parsed.map((r) => isTaf(r))).toEqual([false, false, true])
  })

  it('returns nothing for empty input', () => {
    expect(splitReports('  \n ')).toEqual([])
    expect(parseReports('')).toEqual([])
  })
})

describe('review regressions', () => {
  it('decodes fractional statute mile visibilities', () => {
    expect(
      parseMetar('METAR KJFK 031651Z 18010KT 1 1/2SM -RA BR OVC008 12/11 A3001')?.visibilityM,
    ).toBe(2414)
    const quarter = parseMetar('KJFK 031651Z 18010KT M1/4SM FG VV001 12/12 A3001')
    expect(quarter?.visibilityM).toBe(402)
    expect(quarter?.unparsed).toEqual([])
    expect(parseMetar('KJFK 031651Z 18010KT P6SM FEW250 12/11 A3001')?.visibilityM).toBe(9656)
  })

  it('recognises a TAF without the TAF keyword', () => {
    const reports = parseReports(
      'LFPG 031200Z 0312/0418 24010KT 9999 SCT030 BECMG 0315/0317 25015G25KT',
    )
    expect(reports).toHaveLength(1)
    expect(isTaf(reports[0]!)).toBe(true)
    expect((reports[0] as Taf).groups.map((g) => g.kind)).toEqual(['BASE', 'BECMG'])
  })

  it('splits several reports written on one line and separated by equals signs', () => {
    const reports = splitReports(
      'METAR LFPG 031200Z 24010KT 9999 SCT030 12/08 Q1013= LFPO 031200Z 25008KT CAVOK 13/07 Q1013=',
    )
    expect(reports).toEqual([
      'METAR LFPG 031200Z 24010KT 9999 SCT030 12/08 Q1013',
      'LFPO 031200Z 25008KT CAVOK 13/07 Q1013',
    ])
    expect(parseReports(reports.join('\n')).map((r) => r.station)).toEqual(['LFPG', 'LFPO'])
  })
})
