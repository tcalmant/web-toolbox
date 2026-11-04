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

import { Airfield } from '@/domain/airfields'
import type { AirfieldLookup } from '@/domain/ports/airfieldLookup'
import AirfieldsFr from '../../fixed-data/airfields_fr.json' with { type: 'json' }
import AirfieldsFrMeta from '../../fixed-data/airfields_fr.meta.json' with { type: 'json' }

// Written by data/sia_export.py: dates are ISO 8601, null when the export does not give them
export const AirfieldsMetadata: {
  source: string
  created: string | null
  effective: string | null
  generated: string
} = AirfieldsFrMeta

const TypedAirfieldsFr: Record<string, (number | null)[]> = AirfieldsFr

const KnownAirfields: Record<string, Airfield> = {}

for (const icao in TypedAirfieldsFr) {
  const data = TypedAirfieldsFr[icao]
  if (data) {
    KnownAirfields[icao] = new Airfield(icao, data[0]!, data[1]!, data[2] ?? null)
  }
}

export const bundledAirfields: AirfieldLookup = { find: (icao) => KnownAirfields[icao] }

export default KnownAirfields
