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

// The general (fallback) checklist holds no club data and ships in clear. The
// model and plane tiers are the club's and come from the unlocked vault.
// import.meta.glob accepts arbitrary literal path keys, which the model names
// (with spaces) need.
const generalModules = import.meta.glob<string>('/src/fixed-data/checklists/general/*.xml', {
  query: '?raw',
  import: 'default',
  eager: true,
})

/**
 * Driven adapter for {@link ChecklistDocumentSource}. Tries the locale-specific
 * file first, then falls back to a locale-neutral file with no locale suffix.
 * @param tiers The club checklists from the vault, by path ("model/DR400 120.xml")
 */
export class ChecklistXmlSource implements ChecklistDocumentSource {
  private readonly tiers: Readonly<Record<string, string>>

  constructor(tiers: Readonly<Record<string, string>> = {}) {
    this.tiers = tiers
  }

  getRawXml(tier: ChecklistTier, key: string, locale: string): string | undefined {
    if (tier === 'general') {
      const path = '/src/fixed-data/checklists/general/general'
      return generalModules[`${path}.${locale}.xml`] ?? generalModules[`${path}.xml`]
    }
    const path = `${tier}/${key}`
    return this.tiers[`${path}.${locale}.xml`] ?? this.tiers[`${path}.xml`]
  }
}
