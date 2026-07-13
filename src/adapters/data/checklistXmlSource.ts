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

import type { ChecklistDocumentSource, ChecklistTier } from '@/domain/ports/checklistDocumentSource'

// Airplane models (e.g. "DR400 135 CDI") contain spaces, so filenames can't be
// resolved with individually named static imports without a slugification
// scheme. import.meta.glob accepts arbitrary literal path keys instead.
const xmlModules = import.meta.glob<string>('/src/fixed-data/checklists/**/*.xml', {
  query: '?raw',
  import: 'default',
  eager: true,
})

/**
 * Driven adapter for {@link ChecklistDocumentSource}, backed by XML files bundled
 * under src/fixed-data/checklists/. Tries the locale-specific file first, then
 * falls back to a locale-neutral file with no locale suffix.
 */
export class ChecklistXmlSource implements ChecklistDocumentSource {
  getRawXml(tier: ChecklistTier, key: string, locale: string): string | undefined {
    const base = tier === 'general' ? 'general/general' : `${tier}/${key}`
    const path = `/src/fixed-data/checklists/${base}`
    return xmlModules[`${path}.${locale}.xml`] ?? xmlModules[`${path}.xml`]
  }
}
