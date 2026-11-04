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
 * Tests for domain/importedText.ts, adapters/pdf/pdfTextExtractor.ts and
 * composables/shareTarget.ts
 */

import { readFileSync } from 'node:fs'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { bundledAirfields } from '../../../src/adapters/data/airfieldsRepository'
import { bundledBorders } from '../../../src/adapters/data/bordersRepository'
import { removePageChrome } from '../../../src/adapters/pdf/pdfTextExtractor'
import { captureShare, takeShare } from '../../../src/composables/shareTarget'
import { AIP } from '../../../src/domain/aip'
import { sharedDataToText, splitNotamsAndAip } from '../../../src/domain/importedText'
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
    const result = splitNotamsAndAip('', bundledAirfields)
    expect(result.notams).toEqual([])
    expect(result.aipText).toEqual('')
  })

  it('treats a text without Q section as AIP content', () => {
    const result = splitNotamsAndAip(SUP_AIP_TEXT, bundledAirfields)
    expect(result.notams).toEqual([])
    expect(result.aipText).toEqual(SUP_AIP_TEXT)
  })

  it('finds a NOTAM and leaves no AIP content', () => {
    const result = splitNotamsAndAip(NOTAM_TEXT, bundledAirfields)
    expect(result.notams.length).toEqual(1)
    expect(result.aipText).toEqual('')
  })

  it('separates NOTAMs from AIP content, whatever the order', () => {
    const result = splitNotamsAndAip(
      `${SUP_AIP_TEXT}\n\n${NOTAM_TEXT}\n\nLIMITES\n45°N 005°E`,
      bundledAirfields,
    )
    expect(result.notams.length).toEqual(1)
    expect(result.aipText).toContain("50°21'12''N")
    expect(result.aipText).toContain('LIMITES')
    expect(result.aipText).not.toContain('QRDCA')

    // Both lists of coordinates are still found
    expect(new AIP(result.aipText, bundledBorders).polygons.length).toEqual(2)
  })

  it('does not draw the NOTAM coordinates as AIP', () => {
    const withCoords = `${NOTAM_TEXT}\nE) ZONE 45°30'N 005°45'E`
    const result = splitNotamsAndAip(withCoords, bundledAirfields)
    expect(result.notams.length).toEqual(1)
    expect(new AIP(result.aipText, bundledBorders).polygons).toEqual([])
  })
})

describe('splitNotamsAndAip on a Sofia Briefing copy', () => {
  const text = readFileSync('test/vitest/fixtures/sofia_pib_excerpt.txt', 'utf8')

  it('finds the same NOTAMs as the NOTAM parser', () => {
    const ids = splitNotamsAndAip(text, bundledAirfields).notams.map((n) => n.id)
    expect(ids.length).toBeGreaterThan(0)
    expect(ids).toEqual(parseNotams(text, bundledAirfields).map((n) => n.id))
  })

  it('leaves no NOTAM section in the AIP content', () => {
    const { aipText } = splitNotamsAndAip(text, bundledAirfields)
    expect(aipText).not.toMatch(/^\s*Q\)/m)
    expect(aipText).not.toContain('QFATT')
  })
})

describe('sharedDataToText', () => {
  const SUP_URL = 'https://www.sia.aviation-civile.gouv.fr/sup.pdf'

  it.each([
    ['nothing', {}, ''],
    ['empty fields', { title: ' ', text: '', url: null }, ''],
    ['only the text', { text: ` ${NOTAM_TEXT}\n` }, NOTAM_TEXT],
    [
      'title, text and URL',
      { title: 'SUP 123', text: 'LIMITES', url: SUP_URL },
      `SUP 123\nLIMITES\n${SUP_URL}`,
    ],
    [
      'URL put in the text',
      { title: 'SUP 123', text: `LIMITES ${SUP_URL}` },
      `SUP 123\nLIMITES ${SUP_URL}`,
    ],
    [
      'title repeated in the text',
      { title: 'SUP 123', text: 'SUP 123 LIMITES' },
      'SUP 123 LIMITES',
    ],
    ['only a URL', { url: SUP_URL }, SUP_URL],
  ])('builds the text from %s', (_, shared, expected) => {
    expect(sharedDataToText(shared)).toEqual(expected)
  })

  it('keeps a shared NOTAM readable by the import', () => {
    const text = sharedDataToText({ title: 'Sofia', text: NOTAM_TEXT })
    expect(splitNotamsAndAip(text).notams.length).toEqual(1)
  })
})

describe('takeShare', () => {
  const CACHE_NAME = 'shared-files:/app/'
  // What the service worker left in its cache, by URL
  let entries: Map<string, Response>
  const cache = {
    keys: () => Promise.resolve([...entries.keys()].map((url) => new Request(url))),
    match: (request: Request) => Promise.resolve(entries.get(request.url)),
  }
  const caches = {
    has: vi.fn(() => Promise.resolve(entries.size > 0)),
    open: vi.fn(() => Promise.resolve(cache)),
    delete: vi.fn(() => Promise.resolve(true)),
  }

  beforeEach(() => {
    entries = new Map([
      ['https://app.test/share/text', new Response(JSON.stringify({ id: 'ID', text: 'SHARED' }))],
    ])
    vi.clearAllMocks()
    vi.stubGlobal('caches', caches)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it.each([
    ['no query', '', null],
    ['the share id', '?share=ID', 'SHARED'],
    ['an old share id', '?share=OLD', null],
    ['unrelated parameters', '?lang=fr&share=', null],
    ['a forged text', '?text=FORGED&title=SUP', null],
  ])('takes %s out of the URL', async (_, query, expected) => {
    window.history.replaceState(null, '', `/app/${query}#/notam`)
    captureShare()
    expect(window.location.pathname + window.location.search + window.location.hash).toEqual(
      '/app/#/notam',
    )

    const share = await takeShare()
    expect(share?.text ?? null).toEqual(expected)
    // The cache is only read for a share id, and always emptied then
    const read = query.includes('share=') && !query.endsWith('share=')
    expect(caches.open.mock.calls).toEqual(read ? [[CACHE_NAME]] : [])
    expect(caches.delete.mock.calls).toEqual(read ? [[CACHE_NAME]] : [])
    // Only once
    expect(await takeShare()).toBeNull()
  })

  it('returns the shared files with their names', async () => {
    entries.set(
      'https://app.test/share/file/0',
      new Response('%PDF', { headers: { 'X-File-Name': encodeURIComponent('SUP 1/26.pdf') } }),
    )
    window.history.replaceState(null, '', '/app/?share=ID#/notam')
    captureShare()

    const share = await takeShare()
    expect(share?.files.map((file) => file.name)).toEqual(['SUP 1/26.pdf'])
    expect(caches.delete).toHaveBeenCalledWith(CACHE_NAME)
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
