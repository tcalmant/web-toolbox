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

export class Airfield {
  public readonly icao: string
  public readonly latitude: number
  public readonly longitude: number
  public readonly elevation: number | null

  public constructor(
    icao: string,
    latitude: number,
    longitude: number,
    elevation: number | null = null,
  ) {
    this.icao = icao
    this.latitude = latitude
    this.longitude = longitude
    this.elevation = elevation
  }
}

const KnownAirfields: Record<string, Airfield> = {}

// Load the airfields
import * as AirfieldsFr from '../fixed-data/airfields_fr.json' assert { type: 'json' }

const TypedAirfieldsFr: Record<string, (number | null)[]> = AirfieldsFr as unknown as Record<
  string,
  (number | null)[]
>

for (const icao in AirfieldsFr) {
  const data = TypedAirfieldsFr[icao]
  if (data) {
    KnownAirfields[icao] = new Airfield(icao, data[0]!, data[1]!, data[2])
  }
}

export default KnownAirfields
