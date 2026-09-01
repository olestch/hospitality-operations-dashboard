import type {
  InventoryCategory,
  InventoryItem,
  InventoryStockStatus,
} from '@/modules/inventory/types/inventory'
import {
  calculateStockValue,
  compareInventoryAttention,
  deriveStockStatus,
} from '@/modules/inventory/utils/stockLevels'

export type InventorySort = 'attention' | 'name' | 'quantity' | 'stock-value'

export interface InventoryListOptions {
  status: InventoryStockStatus | null
  category: InventoryCategory | null
  location: string | null
  sort: InventorySort
}

export function filterAndSortInventory(
  items: readonly InventoryItem[],
  options: InventoryListOptions,
): InventoryItem[] {
  return items
    .filter(
      (item) =>
        (!options.status || deriveStockStatus(item) === options.status) &&
        (!options.category || item.category === options.category) &&
        (!options.location || item.location === options.location),
    )
    .sort((first, second) => {
      if (options.sort === 'name') return first.name.localeCompare(second.name)
      if (options.sort === 'quantity') return first.quantityOnHand - second.quantityOnHand
      if (options.sort === 'stock-value') {
        return calculateStockValue(second) - calculateStockValue(first)
      }
      return compareInventoryAttention(first, second)
    })
}
