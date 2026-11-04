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

export type ChecklistTier = 'general' | 'model' | 'plane'

/**
 * The parsed XML element tree the domain reads checklists from. A subset of
 * the DOM `Element`, so a DOM-based adapter can return its elements as they are.
 */
export interface ChecklistXmlElement {
  readonly tagName: string
  readonly textContent: string | null
  readonly children: ArrayLike<ChecklistXmlElement>
  getAttribute(name: string): string | null
}

/**
 * Port: resolves the parsed checklist XML root element for a given tier/key/locale.
 * Implemented by a driven adapter (e.g. one backed by bundled fixed-data files).
 */
export interface ChecklistDocumentSource {
  /** @throws Error if the XML is malformed */
  getRootElement(tier: ChecklistTier, key: string, locale: string): ChecklistXmlElement | undefined
}
