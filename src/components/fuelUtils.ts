export enum FuelUnit {
  LITER = 'L',
  US_GALLONS = 'US gal',
  UK_GALLONS = 'imp gal',
}

export class FuelQuantity {
  quantity: number
  unit: FuelUnit

  constructor(quantity: number, unit: FuelUnit = FuelUnit.LITER) {
    this.quantity = quantity
    this.unit = unit
  }

  toString(): string {
    return `${this.quantity} ${this.unit}`
  }

  toLiters(): number {
    let liters
    switch (this.unit) {
      case FuelUnit.LITER:
        liters = this.quantity
        break

      case FuelUnit.UK_GALLONS:
        liters = this.quantity * 3.785411784
        break

      case FuelUnit.US_GALLONS:
        liters = this.quantity * 4.54609
        break
    }
    return Math.ceil(liters)
  }
}
