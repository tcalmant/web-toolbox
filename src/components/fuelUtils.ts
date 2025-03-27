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

import Qty from 'js-quantities'

export class FuelOption {
  readonly label: string
  readonly value: Qty

  constructor(label: string, value: Qty) {
    this.label = label
    this.value = value
  }

  times(n: number): Qty {
    return this.value.mul(n)
  }
}

export const LITER = new FuelOption('Liter', new Qty('L'))
export const US_GALLONS = new FuelOption('US gal', new Qty('gallon'))
export const UK_GALLONS = new FuelOption('Imp gal', new Qty('gallon-imp'))

export const FUEL_UNITS = [LITER, US_GALLONS, UK_GALLONS]

export class FuelQuantity {
  value: Qty
  unit: FuelOption

  constructor(value: FuelQuantity | number, unit?: FuelOption) {
    if (typeof value === 'number') {
      if (unit === undefined) {
        if (value !== 0) {
          console.warn('No explicit unit. Using liters')
        }
        unit = LITER
      } else if (!unit.value.isCompatible(LITER.value)) {
        console.error('Incompatible unit: %s', value)
        throw new Error(`Incompatible unit: ${value.toString()}`)
      }

      this.value = unit.value.mul(value)
      this.unit = unit
    } else {
      // Copy constructor
      if (unit !== undefined) {
        console.warn('Unit is ignored when a value is explicit')
      }

      this.value = new Qty(value.value)
      this.unit = value.unit
    }
  }

  add(other: FuelQuantity): FuelQuantity {
    return new FuelQuantity(this.value.add(other.value).to(this.unit.value).scalar, this.unit)
  }

  sub(other: FuelQuantity): FuelQuantity {
    return new FuelQuantity(this.value.sub(other.value).to(this.unit.value).scalar, this.unit)
  }

  floor(): FuelQuantity {
    return new FuelQuantity(Math.floor(this.value.scalar), this.unit)
  }

  to(unit?: FuelOption): FuelQuantity {
    return unit
      ? new FuelQuantity(this.value.to(unit.value).scalar, unit)
      : new FuelQuantity(this.value.scalar, this.unit)
  }

  format(unit?: FuelOption): string {
    return unit ? this.value.to(unit.value).format() : this.value.format()
  }

  toString(unit?: FuelOption): string {
    return this.to(unit).floor().format()
  }

  static min(firstValue: FuelQuantity, ...otherValues: FuelQuantity[]): FuelQuantity {
    let minValue = firstValue
    for (const value of otherValues) {
      if (minValue === undefined) {
        minValue = value
      } else {
        if (value.value.toBase() < minValue.value.toBase()) {
          minValue = value
        }
      }
    }
    return minValue
  }

  static max(firstValue: FuelQuantity, ...otherValues: FuelQuantity[]): FuelQuantity {
    let maxValue = firstValue
    for (const value of otherValues) {
      if (maxValue === undefined) {
        maxValue = value
      } else {
        if (value.value.toBase() > maxValue.value.toBase()) {
          maxValue = value
        }
      }
    }
    return maxValue
  }
}
