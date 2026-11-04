/*
 *   Copyright (c) 2026 Thomas Calmant
 *   All rights reserved.
 *
 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */

import { describe, expect, it } from 'vitest'

import { matchLocale } from '../../../src/domain/stringUtils'

describe('matchLocale', () => {
  it.each([
    ['fr-FR', ['en-US', 'fr-FR'], 'fr-FR'],
    ['fr-fr', ['en-US', 'fr-FR'], 'fr-FR'],
    ['fr-BE', ['en-US', 'fr-FR'], 'fr-FR'],
    ['fr-CA', ['en-US', 'fr-FR'], 'fr-FR'],
    ['fr', ['en-US', 'fr-FR'], 'fr-FR'],
    ['en-GB', ['en-US', 'fr-FR'], 'en-US'],
    ['fr-CH', ['en-US', 'fr'], 'fr'],
    ['fr-CH', ['fr-FR', 'fr', 'fr-BE'], 'fr'],
    ['de-DE', ['en-US', 'fr-FR'], undefined],
  ])('%s among %j gives %s', (requested, available, expected) => {
    expect(matchLocale(requested, available)).toBe(expected)
  })
})
