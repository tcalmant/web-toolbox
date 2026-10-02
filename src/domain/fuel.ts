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

export const LITER = new FuelOption('liter', new Qty('L'))
export const US_GALLONS = new FuelOption('us_gal', new Qty('gallon'))
export const UK_GALLONS = new FuelOption('imp_gal', new Qty('gallon-imp'))

export const FUEL_UNITS = [LITER, US_GALLONS, UK_GALLONS]

/**
 * Matches a raw unit string (e.g. as found in a data file, possibly plural
 * and/or differently-cased, like "liters") against a known FuelOption.
 */
export function findFuelUnit(rawUnit: string | undefined): FuelOption | undefined {
  if (!rawUnit) {
    return undefined
  }

  const normalized = rawUnit.trim().toLowerCase().replace(/s$/, '')
  return FUEL_UNITS.find((option) => option.label.toLowerCase().replace(/s$/, '') === normalized)
}

/** Number of decimals worth displaying for a unit: liters are coarse enough, gallons are not. */
export function fuelDigits(unit: FuelOption): number {
  return unit === LITER ? 0 : 1
}

/** Rounds to `digits` decimals, tolerating float noise (109.99999999 is 110). */
export function roundFuel(value: number, digits: number, rounding: 'down' | 'up' = 'down'): number {
  const factor = 10 ** digits
  const scaled = value * factor
  const nearest = Math.round(scaled)
  const snapped = Math.abs(scaled - nearest) < 1e-6 ? nearest : scaled
  return (rounding === 'down' ? Math.floor(snapped) : Math.ceil(snapped)) / factor
}

export class FuelQuantity {
  value: Qty
  unit: FuelOption

  constructor(value: FuelQuantity | number, unit?: FuelOption) {
    if (typeof value === 'number') {
      if (!Number.isFinite(value)) {
        throw new Error(`Invalid fuel quantity: ${String(value)}`)
      }

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

  valueOf(): number {
    return this.value.baseScalar
  }

  add(other: FuelQuantity): FuelQuantity {
    return new FuelQuantity(this.value.add(other.value).to(this.unit.value).scalar, this.unit)
  }

  sub(other: FuelQuantity): FuelQuantity {
    return new FuelQuantity(this.value.sub(other.value).to(this.unit.value).scalar, this.unit)
  }

  to(unit?: FuelOption): FuelQuantity {
    return unit
      ? new FuelQuantity(this.value.to(unit.value).scalar, unit)
      : new FuelQuantity(this.value.scalar, this.unit)
  }

  format(unit?: FuelOption): string {
    return unit ? this.value.to(unit.value).format() : this.value.format()
  }

  /**
   * Formats the quantity with the unit's display precision (whole liters,
   * tenths of gallons). Rounds down by default (conservative for fuel on
   * board), or up for consumed fuel.
   */
  toString(unit?: FuelOption, rounding: 'down' | 'up' = 'down'): string {
    const target = this.to(unit)
    const rounded = roundFuel(target.value.scalar, fuelDigits(target.unit), rounding)
    return new Qty(rounded, target.unit.value.units()).format()
  }

  static min(firstValue: FuelQuantity, ...otherValues: FuelQuantity[]): FuelQuantity {
    let minValue = firstValue
    for (const value of otherValues) {
      if (minValue === undefined) {
        minValue = value
      } else {
        if (value.valueOf() < minValue.valueOf()) {
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
        if (value.valueOf() > maxValue.valueOf()) {
          maxValue = value
        }
      }
    }
    return maxValue
  }
}
