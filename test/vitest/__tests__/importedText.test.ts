/**
 * Copyright (c) 2026 Thomas Calmant
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
 * Tests for domain/importedText.ts and adapters/pdf/pdfTextExtractor.ts
 */

import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

import { removePageChrome } from '../../../src/adapters/pdf/pdfTextExtractor'
import { AIP } from '../../../src/domain/aip'
import { splitNotamsAndAip } from '../../../src/domain/importedText'
import { parseNotams } from '../../../src/domain/notam'

const NOTAM_TEXT = `A1234/26 NOTAMN
Q) LFMM/QRDCA/IV/BO/W/000/050/4513N00551E005
A) LFLS B) 2610011000 C) 2610011600
E) ZONE DANGEREUSE ACTIVE`

const SUP_AIP_TEXT = `LIMITES LATERALES
50°21'12''N, 003°32'52''E
50°21'54''N, 003°34'40''E
50°19'04"N, 003°40'39"E
50°21'12''N, 003°32'52''E`

describe('splitNotamsAndAip', () => {
  it('returns nothing for an empty text', () => {
    const result = splitNotamsAndAip('')
    expect(result.notams).toEqual([])
    expect(result.aipText).toEqual('')
  })

  it('treats a text without Q section as AIP content', () => {
    const result = splitNotamsAndAip(SUP_AIP_TEXT)
    expect(result.notams).toEqual([])
    expect(result.aipText).toEqual(SUP_AIP_TEXT)
  })

  it('finds a NOTAM and leaves no AIP content', () => {
    const result = splitNotamsAndAip(NOTAM_TEXT)
    expect(result.notams.length).toEqual(1)
    expect(result.aipText).toEqual('')
  })

  it('separates NOTAMs from AIP content, whatever the order', () => {
    const result = splitNotamsAndAip(`${SUP_AIP_TEXT}\n\n${NOTAM_TEXT}\n\nLIMITES\n45°N 005°E`)
    expect(result.notams.length).toEqual(1)
    expect(result.aipText).toContain("50°21'12''N")
    expect(result.aipText).toContain('LIMITES')
    expect(result.aipText).not.toContain('QRDCA')

    // Both lists of coordinates are still found
    expect(new AIP(result.aipText).polygons.length).toEqual(2)
  })

  it('does not draw the NOTAM coordinates as AIP', () => {
    const withCoords = `${NOTAM_TEXT}\nE) ZONE 45°30'N 005°45'E`
    const result = splitNotamsAndAip(withCoords)
    expect(result.notams.length).toEqual(1)
    expect(new AIP(result.aipText).polygons).toEqual([])
  })
})

describe('splitNotamsAndAip on a Sofia Briefing copy', () => {
  const text = readFileSync('test/vitest/fixtures/sofia_pib_excerpt.txt', 'utf8')

  it('finds the same NOTAMs as the NOTAM parser', () => {
    const ids = splitNotamsAndAip(text).notams.map((n) => n.id)
    expect(ids.length).toBeGreaterThan(0)
    expect(ids).toEqual(parseNotams(text).map((n) => n.id))
  })

  it('leaves no NOTAM section in the AIP content', () => {
    const { aipText } = splitNotamsAndAip(text)
    expect(aipText).not.toMatch(/^\s*Q\)/m)
    expect(aipText).not.toContain('QFATT')
  })
})

describe('removePageChrome', () => {
  it('removes page numbers and SIA marks', () => {
    const pages = [['Title', 'FR', 'Page 1/2', '© SIA']]
    expect(removePageChrome(pages)).toEqual([['Title']])
  })

  it('removes the header repeated on every page', () => {
    const pages = [
      ['SUP AIP 1/26', 'a'],
      ['SUP AIP 1/26', 'b'],
      ['SUP AIP 1/26', 'c'],
    ]
    expect(removePageChrome(pages)).toEqual([['a'], ['b'], ['c']])
  })

  it('keeps lines when there are too few pages to tell headers apart', () => {
    const pages = [
      ['same', 'a'],
      ['same', 'b'],
    ]
    expect(removePageChrome(pages)).toEqual(pages)
  })
})
