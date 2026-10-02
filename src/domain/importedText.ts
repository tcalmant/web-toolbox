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

import { parseNotams, type NOTAM } from './notam'

export interface SplitText {
  /** NOTAMs found in the text, in order of appearance */
  notams: NOTAM[]
  /** What is left once the NOTAMs are removed: the AIP-flavoured content */
  aipText: string
}

const SECTION_LINE = /^\W*[A-GQ]\)/

/**
 * Splits a text mixing NOTAMs and AIP content (e.g. SUP-AIP text) into both
 * parts, so that the user doesn't have to tell them apart.
 *
 * NOTAMs are found by the regular NOTAM parser. A paragraph (delimited by
 * blank lines) whose section lines all belong to a NOTAM is removed from the
 * AIP text, to avoid drawing the NOTAM coordinates twice.
 */
export function splitNotamsAndAip(fullText: string): SplitText {
  const notams = parseNotams(fullText)
  const notamLines = new Set<string>()
  for (const notam of notams) {
    for (const line of notam.text.split('\n')) {
      notamLines.add(line.trim())
    }
  }

  const aipParts = fullText
    .replaceAll('\r', '')
    .split(/\n\s*\n/)
    .filter((paragraph) => {
      const sections = paragraph.split('\n').filter((line) => SECTION_LINE.test(line))
      return sections.length == 0 || !sections.every((line) => notamLines.has(line.trim()))
    })

  return { notams, aipText: aipParts.join('\n\n').trim() }
}
