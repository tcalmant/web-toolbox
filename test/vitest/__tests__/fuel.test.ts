/**
 * Copyright (c) 2025 Thomas Calmant
 * All rights reserved.
 *
 * Tests for domain/fuel.ts
 */

import Qty from 'js-quantities'
import { describe, expect, it } from 'vitest'

import {
  findFuelUnit,
  FuelOption,
  FuelQuantity,
  LITER,
  UK_GALLONS,
  US_GALLONS,
} from '../../../src/domain/fuel'

describe('findFuelUnit', () => {
  it('matches an exact label', () => {
    expect(findFuelUnit('liter')).toBe(LITER)
    expect(findFuelUnit('us_gal')).toBe(US_GALLONS)
    expect(findFuelUnit('imp_gal')).toBe(UK_GALLONS)
  })

  it('matches a plural, differently-cased raw unit (regression: plane data uses "liters")', () => {
    expect(findFuelUnit('liters')).toBe(LITER)
    expect(findFuelUnit('LITERS')).toBe(LITER)
    expect(findFuelUnit('Liter')).toBe(LITER)
  })

  it('returns undefined for an unknown unit', () => {
    expect(findFuelUnit('barrels')).toBeUndefined()
  })

  it('returns undefined for an empty/undefined input', () => {
    expect(findFuelUnit(undefined)).toBeUndefined()
    expect(findFuelUnit('')).toBeUndefined()
  })
})

describe('FuelQuantity', () => {
  it('defaults to liters for a bare number', () => {
    const qty = new FuelQuantity(10)
    expect(qty.unit).toBe(LITER)
    expect(qty.value.scalar).toEqual(10)
  })

  it('accepts zero without warning about the missing unit', () => {
    const qty = new FuelQuantity(0)
    expect(qty.unit).toBe(LITER)
    expect(qty.value.scalar).toEqual(0)
  })

  it('uses the given unit', () => {
    const qty = new FuelQuantity(10, US_GALLONS)
    expect(qty.unit).toBe(US_GALLONS)
    expect(qty.value.scalar).toEqual(10)
  })

  it('copy-constructs from another FuelQuantity', () => {
    const original = new FuelQuantity(10, US_GALLONS)
    const copy = new FuelQuantity(original)
    expect(copy.unit).toBe(US_GALLONS)
    expect(copy.value.scalar).toEqual(10)
  })

  it('rejects an incompatible unit', () => {
    const weightUnit = new FuelOption('kg', new Qty('kg'))
    expect(() => new FuelQuantity(10, weightUnit)).toThrowError(/Incompatible unit/)
  })

  it('adds and subtracts quantities in the left-hand unit', () => {
    const a = new FuelQuantity(10, LITER)
    const b = new FuelQuantity(5, LITER)
    expect(a.add(b).value.scalar).toEqual(15)
    expect(a.sub(b).value.scalar).toEqual(5)
  })

  it('floors fractional quantities', () => {
    const qty = new FuelQuantity(10.7, LITER)
    expect(qty.floor().value.scalar).toEqual(10)
  })

  it('converts between units', () => {
    const oneUsGallon = new FuelQuantity(1, US_GALLONS)
    const inLiters = oneUsGallon.to(LITER)
    expect(inLiters.unit).toBe(LITER)
    expect(inLiters.value.scalar).toBeCloseTo(3.785, 3)
  })

  it('finds the min and max of several quantities', () => {
    const a = new FuelQuantity(10, LITER)
    const b = new FuelQuantity(5, LITER)
    const c = new FuelQuantity(20, LITER)
    expect(FuelQuantity.min(a, b, c).value.scalar).toEqual(5)
    expect(FuelQuantity.max(a, b, c).value.scalar).toEqual(20)
  })
})
