import type { InventoryCategory, InventoryItem } from '@/modules/inventory/types/inventory'
import {
  calculateStockValue,
  compareInventoryAttention,
  deriveStockStatus,
} from '@/modules/inventory/utils/stockLevels'

export interface InventoryKpis {
  totalStockValue: number
  belowParCount: number
  reorderCount: number
  healthyPercentage: number | null
}

export interface InventoryCategorySummary {
  category: InventoryCategory
  itemCount: number
  stockValue: number
  belowParCount: number
  reorderCount: number
}

export function calculateInventoryKpis(items: readonly InventoryItem[]): InventoryKpis {
  if (!items.length) {
    return { totalStockValue: 0, belowParCount: 0, reorderCount: 0, healthyPercentage: null }
  }
  let totalStockValue = 0
  let belowParCount = 0
  let reorderCount = 0
  let healthyCount = 0
  for (const item of items) {
    totalStockValue += calculateStockValue(item)
    const status = deriveStockStatus(item)
    if (status !== 'healthy') belowParCount += 1
    if (status === 'reorder' || status === 'out-of-stock') reorderCount += 1
    if (status === 'healthy') healthyCount += 1
  }
  return {
    totalStockValue,
    belowParCount,
    reorderCount,
    healthyPercentage: healthyCount / items.length,
  }
}

export function aggregateInventoryCategories(
  items: readonly InventoryItem[],
): InventoryCategorySummary[] {
  const categories = new Map<InventoryCategory, InventoryCategorySummary>()
  for (const item of items) {
    const current = categories.get(item.category) ?? {
      category: item.category,
      itemCount: 0,
      stockValue: 0,
      belowParCount: 0,
      reorderCount: 0,
    }
    const status = deriveStockStatus(item)
    current.itemCount += 1
    current.stockValue += calculateStockValue(item)
    if (status !== 'healthy') current.belowParCount += 1
    if (status === 'reorder' || status === 'out-of-stock') current.reorderCount += 1
    categories.set(item.category, current)
  }
  return [...categories.values()].sort((first, second) => second.stockValue - first.stockValue)
}

export function getInventoryAttentionItems(
  items: readonly InventoryItem[],
  limit = 5,
): InventoryItem[] {
  return items
    .filter((item) => deriveStockStatus(item) !== 'healthy')
    .sort(compareInventoryAttention)
    .slice(0, limit)
}
