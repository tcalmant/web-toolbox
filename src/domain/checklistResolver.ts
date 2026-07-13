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

import type { AirPlane } from '@/domain/airplanes'
import { Checklist, ChecklistDocument } from '@/domain/checklist'
import type { ChecklistDocumentSource, ChecklistTier } from '@/domain/ports/checklistDocumentSource'

function loadTier(
  source: ChecklistDocumentSource,
  tier: ChecklistTier,
  key: string,
  locale: string,
): ChecklistDocument | null {
  const raw = source.getRawXml(tier, key, locale)
  return raw ? new ChecklistDocument(raw) : null
}

/**
 * Use case: resolves and merges the general/model/plane tiers for a plane and locale.
 * Depends only on the {@link ChecklistDocumentSource} port, not on how tiers are stored.
 */
export function resolveChecklistForPlane(
  source: ChecklistDocumentSource,
  plane: AirPlane,
  locale: string,
): Checklist {
  const general = loadTier(source, 'general', 'general', locale)
  const model = loadTier(source, 'model', plane.model, locale)
  const planeDoc = loadTier(source, 'plane', plane.immatriculation, locale)
  return new Checklist(general, model, planeDoc)
}
