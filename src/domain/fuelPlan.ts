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

/** Fuel put in the tanks (on board at start, or refuel), in any unit. */
export interface FuelEvent {
  kind: 'fuel'
  quantity: FuelQuantity
}

/** A flight leg: fuel is burnt at the hourly consumption. */
export interface FlightEvent {
  kind: 'flight'
  durationS: number
}

/** Events in chronological order. */
export type TimelineEvent = FuelEvent | FlightEvent

/**
 * Raw form values are accepted ('' for an emptied field): the plan sanitizes
 * them itself, callers do not have to.
 */
export interface FuelPlanInput {
  unit: FuelOption
  /** Hourly consumption, in `unit`. */
  perHour: number | string
  /** Total tank capacity, in `unit`. */
  capacity: number | string
  /** Usable part of the capacity, in `unit`. */
  consumable: number | string
  events: TimelineEvent[]
  /** Minimum usable flight time to keep, in minutes. */
  reserveMin: number | string
}

export interface TimelineStep {
  /** Fuel in the tanks right after the event. */
  levelAfter: FuelQuantity
  /** The tanks cannot hold this refuel: the excess is lost. */
  overflow: boolean
  /** The tanks ran dry during this leg. */
  shortfall: boolean
}

export interface FuelPlan {
  /** Fuel needed by all the legs. */
  consumed: FuelQuantity
  /** Sum of all the fuel put in the tanks (before capacity capping). */
  added: FuelQuantity
  totalFlightDurationS: number
  /** Fuel left at the end of the timeline. */
  remaining: FuelQuantity
  usable: FuelQuantity
  /** Percentage of the capacity, 0 to 100. */
  remainingPercent: number
  /** Null when the consumption is zero (the time is unbounded). */
  usableTimeS: number | null
  /** The tanks ran dry at some point of the timeline. */
  insufficient: boolean
  /** A refuel did not fit in the tanks at some point of the timeline. */
  overflow: boolean
  status: FuelStatus
  steps: TimelineStep[]
}

/** Replaces anything that is not a finite, positive number by 0 (empty inputs, NaN...). */
export function sanitizeAmount(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
    return 0
  }
  // Beyond this, products and sums could overflow to Infinity
  return Math.min(value, MAX_AMOUNT)
}

const MAX_AMOUNT = 1e9

/** Float noise (unit round trips) must not turn "exactly enough" into a shortfall. */
const EPSILON = 1e-9

/**
 * Replays the events in order. Everything is expressed in `input.unit` so that
 * mixed units (fuel added in liters, tanks in gallons) cannot leak into the
 * time computation, and the level is capped at the capacity after each refuel
 * (not at the end), so that the order of the events matters.
 */
export function computeFuelPlan(input: FuelPlanInput): FuelPlan {
  const { unit } = input
  const perHour = sanitizeAmount(input.perHour)
  const capacity = sanitizeAmount(input.capacity)
  // Usable fuel cannot exceed the tanks
  const consumable = Math.min(sanitizeAmount(input.consumable), capacity)
  const nonUsable = capacity - consumable

  let level = 0
  let added = 0
  let consumed = 0
  let durationS = 0
  let insufficient = false
  let overflow = false
  const steps: TimelineStep[] = []

  for (const event of input.events) {
    let stepOverflow = false
    let stepShortfall = false

    if (event.kind === 'fuel') {
      const quantity = sanitizeAmount(event.quantity.to(unit).value.scalar)
      added += quantity
      level += quantity
      if (level > capacity + EPSILON) {
        stepOverflow = true
      }
      level = Math.min(level, capacity)
    } else {
      const burnt = (perHour * sanitizeAmount(event.durationS)) / 3600
      durationS += sanitizeAmount(event.durationS)
      consumed += burnt
      if (burnt > level + EPSILON) {
        level = 0
        stepShortfall = true
      } else {
        level = Math.max(0, level - burnt)
      }
    }

    insufficient ||= stepShortfall
    overflow ||= stepOverflow
    steps.push({
      levelAfter: new FuelQuantity(level, unit),
      overflow: stepOverflow,
      shortfall: stepShortfall,
    })
  }

  const usable = Math.min(Math.max(level - nonUsable, 0), consumable)
  const usableTimeS = perHour > 0 ? (usable / perHour) * 3600 : null
  const reserveS = sanitizeAmount(input.reserveMin) * 60

  let status: FuelStatus = 'ok'
  if (insufficient || usable <= 0 || (usableTimeS !== null && usableTimeS < reserveS)) {
    status = 'alert'
  } else if (usableTimeS !== null && usableTimeS < 2 * reserveS) {
    status = 'warning'
  }

  return {
    consumed: new FuelQuantity(consumed, unit),
    added: new FuelQuantity(added, unit),
    totalFlightDurationS: durationS,
    remaining: new FuelQuantity(level, unit),
    usable: new FuelQuantity(usable, unit),
    remainingPercent:
      capacity > 0 ? Math.min(100, Math.floor((100 * level) / capacity + EPSILON)) : 0,
    usableTimeS,
    insufficient,
    overflow,
    status,
    steps,
  }
}

/**
 * Converts a plain amount between fuel units. The precision is kept well
 * beyond the display one, so that switching units back and forth does not drift.
 */
export function convertAmount(value: number, from: FuelOption, to: FuelOption): number {
  if (from === to) {
    return value
  }
  const converted = new FuelQuantity(sanitizeAmount(value), from).to(to).value.scalar
  return Math.round(converted * 1000) / 1000
}
