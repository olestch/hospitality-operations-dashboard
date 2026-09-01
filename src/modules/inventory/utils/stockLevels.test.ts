import { describe, expect, it } from 'vitest'

import type { InventoryItem } from '@/modules/inventory/types/inventory'
import {
  calculateDaysOfStock,
  calculateShortage,
  calculateShortagePercentage,
  calculateStockValue,
  compareInventoryAttention,
  deriveStockStatus,
} from '@/modules/inventory/utils/stockLevels'

function item(overrides: Partial<InventoryItem> = {}): InventoryItem {
  return {
    id: 'item-a',
    propertyId: 'property-a',
    name: 'Towels',
    category: 'linen',
    unit: 'pack',
    quantityOnHand: 20,
    parLevel: 20,
    reorderLevel: 5,
    unitCost: 4.5,
    averageDailyConsumption: 2,
    ...overrides,
  }
}

describe('inventory stock levels', () => {
  it.each([
    [20, 'healthy'],
    [21, 'healthy'],
    [6, 'below-par'],
    [5, 'reorder'],
    [1, 'reorder'],
    [0, 'out-of-stock'],
  ] as const)('derives quantity %s as %s', (quantityOnHand, expected) => {
    expect(deriveStockStatus(item({ quantityOnHand }))).toBe(expected)
  })

  it('calculates values for whole, fractional and zero quantities', () => {
    expect(calculateStockValue(item())).toBe(90)
    expect(calculateStockValue(item({ quantityOnHand: 2.5, unitCost: 3.2 }))).toBe(8)
    expect(calculateStockValue(item({ quantityOnHand: 0 }))).toBe(0)
  })

  it('calculates shortage amount and proportional shortage', () => {
    expect(calculateShortage(item({ quantityOnHand: 15 }))).toBe(5)
    expect(calculateShortagePercentage(item({ quantityOnHand: 15 }))).toBe(0.25)
    expect(calculateShortagePercentage(item({ parLevel: 0, quantityOnHand: 0 }))).toBeNull()
  })

  it('calculates normal, zero and fractional days of stock', () => {
    expect(calculateDaysOfStock(item())).toBe(10)
    expect(calculateDaysOfStock(item({ quantityOnHand: 0 }))).toBe(0)
    expect(calculateDaysOfStock(item({ quantityOnHand: 5, averageDailyConsumption: 2 }))).toBe(2.5)
  })

  it('keeps days of stock unavailable for missing or zero consumption', () => {
    expect(calculateDaysOfStock(item({ averageDailyConsumption: undefined }))).toBeNull()
    expect(calculateDaysOfStock(item({ averageDailyConsumption: 0 }))).toBeNull()
  })

  it('ranks status severity before estimated cover', () => {
    const out = item({ id: 'out', quantityOnHand: 0 })
    const reorder = item({ id: 'reorder', quantityOnHand: 4, averageDailyConsumption: 4 })
    const below = item({ id: 'below', quantityOnHand: 10, averageDailyConsumption: 10 })
    expect([below, reorder, out].sort(compareInventoryAttention).map(({ id }) => id)).toEqual([
      'out',
      'reorder',
      'below',
    ])
  })

  it('ranks lower days of stock first within the same status', () => {
    const twoDays = item({ id: 'two', quantityOnHand: 4, averageDailyConsumption: 2 })
    const oneDay = item({ id: 'one', quantityOnHand: 4, averageDailyConsumption: 4 })
    expect([twoDays, oneDay].sort(compareInventoryAttention).map(({ id }) => id)).toEqual([
      'one',
      'two',
    ])
  })
})
