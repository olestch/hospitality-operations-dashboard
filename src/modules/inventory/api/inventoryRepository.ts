import { dataProvider } from '@/data'
import type { InventoryFilters, InventoryItem } from '@/modules/inventory/types/inventory'

export async function getInventory(filters: InventoryFilters = {}): Promise<InventoryItem[]> {
  return dataProvider.getInventory(filters)
}
