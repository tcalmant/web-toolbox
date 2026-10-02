/**
 * Copyright (c) 2026 Thomas Calmant
 * All rights reserved.
 *
 * Tests for domain/fuelPlan.ts
 */

import { describe, expect, it } from 'vitest'

import {
  FuelQuantity,
  LITER,
  US_GALLONS,
  roundFuel,
  type FuelOption,
} from '../../../src/domain/fuel'
import {
  computeFuelPlan,
  convertAmount,
  sanitizeAmount,
  type TimelineEvent,
} from '../../../src/domain/fuelPlan'

const fuel = (n: number, unit: FuelOption = LITER): TimelineEvent => ({
  kind: 'fuel',
  quantity: new FuelQuantity(n, unit),
})
const flight = (hours: number): TimelineEvent => ({ kind: 'flight', durationS: hours * 3600 })

const base = {
  unit: LITER,
  perHour: 30,
  capacity: 110,
  consumable: 109,
  events: [fuel(100), flight(1)],
  reserveMin: 30,
}

describe('computeFuelPlan', () => {
  it('computes consumed, remaining and usable fuel', () => {
    const plan = computeFuelPlan(base)
    expect(plan.consumed.value.scalar).toBeCloseTo(30)
    expect(plan.added.value.scalar).toBeCloseTo(100)
    expect(plan.remaining.value.scalar).toBeCloseTo(70)
    expect(plan.usable.value.scalar).toBeCloseTo(69)
    expect(plan.usableTimeS).toBeCloseTo((69 / 30) * 3600)
    expect(plan.remainingPercent).toBe(63)
    expect(plan.status).toBe('ok')
    expect(plan.steps.map((s) => s.levelAfter.value.scalar)).toEqual([100, 70])
  })

  it('does not mix units: liters added with a tank in gallons', () => {
    const plan = computeFuelPlan({
      unit: US_GALLONS,
      perHour: 2,
      capacity: 30,
      consumable: 30,
      events: [{ kind: 'fuel', quantity: new FuelQuantity(20, US_GALLONS).to(LITER) }, flight(1)],
      reserveMin: 30,
    })
    expect(plan.remaining.unit).toBe(US_GALLONS)
    expect(plan.usable.value.scalar).toBeCloseTo(18)
    expect(plan.usableTimeS).toBeCloseTo(9 * 3600)
  })

  it('does not round the consumption up to a whole unit', () => {
    const plan = computeFuelPlan({ ...base, perHour: 2, events: [fuel(10), flight(0.5)] })
    expect(plan.consumed.value.scalar).toBeCloseTo(1)
  })

  it('caps the level at the capacity after each refuel, so the order matters', () => {
    // Fill, fly 10 L, refill: the second refuel only fits 10 L
    const plan = computeFuelPlan({
      ...base,
      events: [fuel(110), flight(1 / 3), fuel(110)],
    })
    expect(plan.remaining.value.scalar).toBeCloseTo(110)
    expect(plan.steps[2]?.overflow).toBe(true)
    expect(plan.overflow).toBe(true)
    expect(plan.added.value.scalar).toBeCloseTo(220)

    // Both refuels before the flight: 110 - 10, not 220 - 10
    const early = computeFuelPlan({ ...base, events: [fuel(110), fuel(110), flight(1 / 3)] })
    expect(early.remaining.value.scalar).toBeCloseTo(100)
    expect(early.steps[1]?.overflow).toBe(true)
  })

  it('does not credit fuel that was never in the tanks when flying first', () => {
    const plan = computeFuelPlan({ ...base, events: [flight(1), fuel(50)] })
    expect(plan.steps[0]?.shortfall).toBe(true)
    expect(plan.insufficient).toBe(true)
    expect(plan.remaining.value.scalar).toBeCloseTo(50)
    expect(plan.status).toBe('alert')
  })

  it('remembers a shortfall even if refuelled afterwards', () => {
    const plan = computeFuelPlan({ ...base, events: [fuel(10), flight(1), fuel(100)] })
    expect(plan.insufficient).toBe(true)
    expect(plan.status).toBe('alert')
  })

  it('clamps at zero and flags a shortfall', () => {
    const plan = computeFuelPlan({ ...base, events: [fuel(100), flight(4)] })
    expect(plan.remaining.value.scalar).toBe(0)
    expect(plan.usable.value.scalar).toBe(0)
    expect(plan.insufficient).toBe(true)
    expect(plan.remainingPercent).toBe(0)
    expect(plan.status).toBe('alert')
  })

  it('has no time limit with a zero consumption, and no NaN', () => {
    const plan = computeFuelPlan({ ...base, perHour: 0 })
    expect(plan.usableTimeS).toBeNull()
    expect(plan.status).toBe('ok')
    expect(computeFuelPlan({ ...base, perHour: NaN }).usableTimeS).toBeNull()
  })

  it('treats empty inputs as zero', () => {
    const plan = computeFuelPlan({ ...base, capacity: '' as unknown as number })
    expect(plan.remaining.value.scalar).toBe(0)
    expect(plan.remainingPercent).toBe(0)
  })

  it('uses the reserve for the warning and alert thresholds', () => {
    // 100 L at 30 L/h, 1 L non-usable
    const at = (hours: number, reserveMin: number) =>
      computeFuelPlan({ ...base, events: [fuel(100), flight(hours)], reserveMin }).status
    expect(at(0, 30)).toBe('ok')
    expect(at(2.5, 30)).toBe('warning') // 24 L usable, 48 min
    expect(at(3, 30)).toBe('alert') // 9 L usable, 18 min
    expect(at(2.5, 45)).toBe('warning') // 48 min is above 45, below 90
    expect(at(2.5, 60)).toBe('alert') // 48 min is below 60
  })

  it('is an alert with no usable fuel, even with a zero reserve', () => {
    const empty = computeFuelPlan({ ...base, events: [], reserveMin: 0 })
    expect(empty.status).toBe('alert')
    const burnt = computeFuelPlan({ ...base, events: [fuel(1)], reserveMin: 0 })
    expect(burnt.status).toBe('alert')
  })

  it('keeps the non-usable fuel out of the usable amount', () => {
    const plan = computeFuelPlan({ ...base, events: [fuel(110)] })
    expect(plan.usable.value.scalar).toBeCloseTo(109)
    const low = computeFuelPlan({ ...base, events: [fuel(1)] })
    expect(low.usable.value.scalar).toBe(0)
  })
})

describe('helpers', () => {
  it('sanitizes amounts', () => {
    expect(sanitizeAmount('')).toBe(0)
    expect(sanitizeAmount(-3)).toBe(0)
    expect(sanitizeAmount(NaN)).toBe(0)
    expect(sanitizeAmount(12.5)).toBe(12.5)
  })

  it('converts amounts between units without drifting on a round trip', () => {
    expect(convertAmount(110, LITER, LITER)).toBe(110)
    expect(convertAmount(3.785, LITER, US_GALLONS)).toBeCloseTo(1, 1)
    const there = convertAmount(110, LITER, US_GALLONS)
    expect(convertAmount(there, US_GALLONS, LITER)).toBeCloseTo(110, 1)
  })

  it('rounds with float tolerance', () => {
    expect(roundFuel(109.9999999999, 0)).toBe(110)
    expect(roundFuel(5.96, 1)).toBe(5.9)
    expect(roundFuel(1.01, 1, 'up')).toBe(1.1)
  })
})

describe('FuelQuantity formatting and validation', () => {
  it('shows tenths of gallons', () => {
    expect(new FuelQuantity(5.96, US_GALLONS).toString()).toBe('5.9 gal')
    expect(new FuelQuantity(2.5, US_GALLONS).toString()).toBe('2.5 gal')
  })

  it('rounds up on demand', () => {
    expect(new FuelQuantity(10.2, LITER).toString(LITER, 'up')).toMatch(/^11 /)
  })

  it('rejects non-finite numbers', () => {
    expect(() => new FuelQuantity(NaN, LITER)).toThrowError(/Invalid fuel quantity/)
  })

  it('compares quantities of different units', () => {
    const gal = new FuelQuantity(1, US_GALLONS)
    const liters = new FuelQuantity(10, LITER)
    expect(FuelQuantity.min(gal, liters)).toBe(gal)
    expect(FuelQuantity.max(gal, liters)).toBe(liters)
  })
})
