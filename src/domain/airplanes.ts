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

export class InputFuel {
  public readonly capacity: number
  public readonly consumable: number
  public readonly hourlyConsumption: number
  public readonly unit: string

  public constructor(
    capacity: number,
    consumable: number,
    hourlyConsumption: number,
    unit: string,
  ) {
    this.capacity = capacity
    this.consumable = consumable
    this.hourlyConsumption = hourlyConsumption
    this.unit = unit
  }
}

export class InputAirplane {
  public readonly brand: string
  public readonly model: string
  public readonly fuel: InputFuel

  public constructor(immatriculation: string, brand: string, model: string, fuel: InputFuel) {
    this.brand = brand
    this.model = model
    this.fuel = fuel
  }
}

export class AirPlane {
  public readonly immatriculation: string
  public brand: string
  public model: string
  public fuelUnit: string
  public fuelCapacity: number
  public fuelConsumable: number
  public fuelConsumption: number
  public isCustom: boolean

  public constructor(
    immatriculation: string,
    brand: string,
    model: string,
    fuelUnit: string,
    fuelCapacity: number,
    fuelConsumable: number,
    fuelConsumption: number,
  ) {
    this.immatriculation = immatriculation
    this.brand = brand
    this.model = model
    this.fuelUnit = fuelUnit
    this.fuelCapacity = fuelCapacity
    this.fuelConsumable = fuelConsumable
    this.fuelConsumption = fuelConsumption
    this.isCustom = false
  }

  public toString(): string {
    if (this.model) {
      return `${this.immatriculation} (${this.model})`
    }
    return `${this.immatriculation}`
  }
}
