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

import { NOTAM } from './notam'
import { findFirstRegex } from './stringUtils'

export interface SplitText {
  /** NOTAMs found in the text, in order of appearance */
  notams: NOTAM[]
  /** What is left once the NOTAMs are removed: the AIP-flavoured content */
  aipText: string
}

/**
 * Splits a text mixing NOTAMs and AIP content (e.g. SUP-AIP text) into both
 * parts, so that the user doesn't have to tell them apart.
 *
 * A NOTAM is a block (delimited by blank lines) holding a valid Q) section.
 * Everything else is AIP content. Removing the NOTAMs from the AIP text
 * avoids drawing their coordinates twice.
 */
export function splitNotamsAndAip(fullText: string): SplitText {
  const notams: NOTAM[] = []
  const aipParts: string[] = []

  let lastEndIdx = -1
  let consumedUpTo = 0
  let notamIdx = 0
  let sectionStartIdx: number
  while ((sectionStartIdx = findFirstRegex(fullText, lastEndIdx + 1, /[A-GQ]\)/)) != -1) {
    // Look for the "real" start of the NOTAM
    let notamStartIdx = fullText.lastIndexOf('\n\n', sectionStartIdx)
    if (notamStartIdx == -1) {
      notamStartIdx = 0
    } else if (notamStartIdx < lastEndIdx) {
      notamStartIdx = lastEndIdx
    }

    // Look for the end of the NOTAM
    lastEndIdx = fullText.indexOf('\n\n', sectionStartIdx)
    if (lastEndIdx == -1) {
      lastEndIdx = fullText.length
    }

    const notamContent = fullText.substring(notamStartIdx, lastEndIdx).trim()
    const notam = new NOTAM(notamContent, ++notamIdx)
    if (notam.sectionQ != null) {
      notams.push(notam)
      // Keep the text before this NOTAM as AIP content
      aipParts.push(fullText.substring(consumedUpTo, Math.max(notamStartIdx, consumedUpTo)))
      consumedUpTo = lastEndIdx
    }
  }

  aipParts.push(fullText.substring(consumedUpTo))
  return { notams, aipText: aipParts.join('\n\n').trim() }
}
