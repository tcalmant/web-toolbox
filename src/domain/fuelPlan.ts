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

import type { FuelOption } from '@/domain/fuel'
import { FuelQuantity } from '@/domain/fuel'

export type FuelStatus = 'ok' | 'warning' | 'alert'

export interface FuelPlanInput {
  unit: FuelOption
  /** Hourly consumption, in `unit`. */
  perHour: number
  /** Total tank capacity, in `unit`. */
  capacity: number
  /** Usable part of the capacity, in `unit`. */
  consumable: number
  /** Total fuel put in the tanks (any unit). */
  added: FuelQuantity
  flightDurationS: number
  /** Minimum usable flight time to keep, in minutes. */
  reserveMin: number
}

export interface FuelPlan {
  consumed: FuelQuantity
  remaining: FuelQuantity
  usable: FuelQuantity
  /** Percentage of the capacity, 0 to 100. */
  remainingPercent: number
  /** Null when the consumption is zero (the time is unbounded). */
  usableTimeS: number | null
  /** More fuel was consumed than what was added. */
  insufficient: boolean
  status: FuelStatus
}

/** Replaces anything that is not a finite, positive number by 0 (empty inputs, NaN...). */
export function sanitizeAmount(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : 0
}

/**
 * Computes the fuel state at the end of the flight. Everything is expressed in
 * `input.unit` so that mixed units (added fuel in liters, tanks in gallons)
 * cannot leak into the time computation.
 */
export function computeFuelPlan(input: FuelPlanInput): FuelPlan {
  const { unit } = input
  const perHour = sanitizeAmount(input.perHour)
  const capacity = sanitizeAmount(input.capacity)
  // Usable fuel cannot exceed the tanks
  const consumable = Math.min(sanitizeAmount(input.consumable), capacity)
  const nonUsable = capacity - consumable
  const added = input.added.to(unit).value.scalar

  const consumed = (perHour * sanitizeAmount(input.flightDurationS)) / 3600
  const remainingRaw = added - consumed
  const remaining = Math.min(Math.max(remainingRaw, 0), capacity)
  const usable = Math.min(Math.max(remaining - nonUsable, 0), consumable)

  const usableTimeS = perHour > 0 ? (usable / perHour) * 3600 : null
  const reserveS = sanitizeAmount(input.reserveMin) * 60
  const insufficient = remainingRaw < 0

  let status: FuelStatus = 'ok'
  if (insufficient || (usableTimeS === null ? usable <= 0 : usableTimeS < reserveS)) {
    status = 'alert'
  } else if (usableTimeS !== null && usableTimeS < 2 * reserveS) {
    status = 'warning'
  }

  return {
    consumed: new FuelQuantity(consumed, unit),
    remaining: new FuelQuantity(remaining, unit),
    usable: new FuelQuantity(usable, unit),
    remainingPercent: capacity > 0 ? Math.min(100, Math.floor((100 * remaining) / capacity)) : 0,
    usableTimeS,
    insufficient,
    status,
  }
}

/** Converts a plain amount between fuel units, to a tenth (the display precision of gallons). */
export function convertAmount(value: number, from: FuelOption, to: FuelOption): number {
  if (from === to) {
    return value
  }
  const converted = new FuelQuantity(sanitizeAmount(value), from).to(to).value.scalar
  return Math.round(converted * 10) / 10
}
