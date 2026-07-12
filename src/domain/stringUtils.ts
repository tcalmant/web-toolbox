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

/**
 * Looks for the first matching string
 *
 * @param text Text to look int
 * @param startIdx Index to start looking at in the input text
 * @param pattern Patterns to look for
 * @returns The index of the first matching pattern, else -1
 */
export function findFirst(text: string, startIdx: number, ...patterns: string[]): number {
  const foundIndices = patterns.map((p) => text.indexOf(p, startIdx)).filter((idx) => idx != -1)
  if (foundIndices.length == 0) {
    return -1
  } else {
    return Math.min(...foundIndices)
  }
}

/**
 * Looks for the location of the matching pattern
 *
 * @param text Text to look into
 * @param startIdx Index to start looking at in the input text
 * @param pattern RegEx pattern to look for
 * @returns The index of the pattern, else -1
 */
export function findFirstRegex(text: string, startIdx: number, pattern: RegExp): number {
  const idx = text.slice(startIdx).search(pattern)
  if (idx == -1) {
    return -1
  }
  return idx + startIdx
}
