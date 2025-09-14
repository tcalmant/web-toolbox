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

import { SectionQ } from '../../../src/components/notamUtils'

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
