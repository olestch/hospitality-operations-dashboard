import { describe, expect, it } from 'vitest'

import type { InventoryItem } from '@/modules/inventory/types/inventory'
import {
  aggregateInventoryCategories,
  calculateInventoryKpis,
  getInventoryAttentionItems,
} from '@/modules/inventory/utils/inventoryAnalysis'
import { calculateStockValue } from '@/modules/inventory/utils/stockLevels'

function item(
  id: string,
  quantityOnHand: number,
  overrides: Partial<InventoryItem> = {},
): InventoryItem {
  return {
    id,
    propertyId: 'property-a',
    name: id,
    category: 'linen',
    unit: 'each',
    quantityOnHand,
    parLevel: 10,
    reorderLevel: 3,
    unitCost: 2,
    averageDailyConsumption: 1,
    ...overrides,
  }
}

describe('inventory KPI aggregation', () => {
  it('aggregates value, below-par, reorder and healthy share', () => {
    expect(
      calculateInventoryKpis([
        item('healthy', 10),
        item('below', 5),
        item('reorder', 3),
        item('out', 0),
      ]),
    ).toEqual({ totalStockValue: 36, belowParCount: 3, reorderCount: 2, healthyPercentage: 0.25 })
  })

  it('returns an unavailable healthy percentage for empty inventory', () => {
    expect(calculateInventoryKpis([])).toEqual({
      totalStockValue: 0,
      belowParCount: 0,
      reorderCount: 0,
      healthyPercentage: null,
    })
  })
})

describe('inventory category aggregation', () => {
  it('groups item counts, value and stock pressure', () => {
    const rows = aggregateInventoryCategories([
      item('linen-a', 10),
      item('linen-b', 2),
      item('food', 4, { category: 'food-beverage', unitCost: 5 }),
    ])
    expect(rows).toEqual([
      { category: 'linen', itemCount: 2, stockValue: 24, belowParCount: 1, reorderCount: 1 },
      {
        category: 'food-beverage',
        itemCount: 1,
        stockValue: 20,
        belowParCount: 1,
        reorderCount: 0,
      },
    ])
    expect(rows.reduce((sum, row) => sum + row.stockValue, 0)).toBe(44)
  })

  it('preserves fractional stock value across category totals', () => {
    const items = [
      item('liquid', 2.25, { unit: 'liter', unitCost: 3.4 }),
      item('linen', 1.5, { unitCost: 8.25 }),
    ]
    const categoryTotal = aggregateInventoryCategories(items).reduce(
      (sum, row) => sum + row.stockValue,
      0,
    )
    const itemTotal = items.reduce((sum, current) => sum + calculateStockValue(current), 0)
    expect(categoryTotal).toBeCloseTo(itemTotal, 10)
  })
})

describe('inventory attention selection', () => {
  it('excludes healthy items, preserves priority and respects the limit', () => {
    const result = getInventoryAttentionItems(
      [item('healthy', 10), item('below', 6), item('reorder', 2), item('out', 0)],
      2,
    )
    expect(result.map(({ id }) => id)).toEqual(['out', 'reorder'])
  })
})
