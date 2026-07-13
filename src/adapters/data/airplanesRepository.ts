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

import { AirPlane } from '@/domain/airplanes'
import type { InputAirplane } from '@/domain/airplanes'
import AcdAirplanes from '../../fixed-data/acd_planes.json' with { type: 'json' }

const TypedAcdAirplanes: Record<string, InputAirplane> = AcdAirplanes

const KnownAirplanes: Record<string, AirPlane> = {}

for (const immat in TypedAcdAirplanes) {
  const data = TypedAcdAirplanes[immat]
  if (data) {
    KnownAirplanes[immat] = new AirPlane(
      immat,
      data.brand,
      data.model,
      data.fuel.unit,
      data.fuel.capacity,
      data.fuel.consumable,
      data.fuel.hourlyConsumption,
    )
  }
}

export default KnownAirplanes
