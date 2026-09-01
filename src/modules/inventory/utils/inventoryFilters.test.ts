import { describe, expect, it } from 'vitest'

import type { InventoryItem } from '@/modules/inventory/types/inventory'
import {
  filterAndSortInventory,
  type InventoryListOptions,
} from '@/modules/inventory/utils/inventoryFilters'

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
    location: 'Store A',
    ...overrides,
  }
}
const defaults: InventoryListOptions = {
  status: null,
  category: null,
  location: null,
  sort: 'attention',
}
const items = [
  item('Healthy', 10),
  item('Below', 5, { category: 'housekeeping' }),
  item('Reorder', 2, { location: 'Store B', unitCost: 20 }),
  item('Out', 0),
]

describe('inventory filtering and sorting', () => {
  it('filters by status', () =>
    expect(
      filterAndSortInventory(items, { ...defaults, status: 'reorder' }).map(({ id }) => id),
    ).toEqual(['Reorder']))
  it('filters by category', () =>
    expect(
      filterAndSortInventory(items, { ...defaults, category: 'housekeeping' }).map(({ id }) => id),
    ).toEqual(['Below']))
  it('combines category and location filters', () =>
    expect(
      filterAndSortInventory(items, { ...defaults, category: 'linen', location: 'Store B' }).map(
        ({ id }) => id,
      ),
    ).toEqual(['Reorder']))
  it('uses attention priority by default', () =>
    expect(filterAndSortInventory(items, defaults).map(({ id }) => id)).toEqual([
      'Out',
      'Reorder',
      'Below',
      'Healthy',
    ]))
  it('sorts by descending stock value', () =>
    expect(
      filterAndSortInventory(items, { ...defaults, sort: 'stock-value' }).map(({ id }) => id),
    ).toEqual(['Reorder', 'Healthy', 'Below', 'Out']))
  it('returns all items after filter reset', () =>
    expect(filterAndSortInventory(items, defaults)).toHaveLength(4))
})
