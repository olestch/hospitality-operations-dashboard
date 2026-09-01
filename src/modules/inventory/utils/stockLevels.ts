import type { InventoryItem, InventoryStockStatus } from '@/modules/inventory/types/inventory'

const statusPriority: Readonly<Record<InventoryStockStatus, number>> = {
  'out-of-stock': 0,
  reorder: 1,
  'below-par': 2,
  healthy: 3,
}

export function deriveStockStatus(item: InventoryItem): InventoryStockStatus {
  if (item.quantityOnHand <= 0) return 'out-of-stock'
  if (item.quantityOnHand <= item.reorderLevel) return 'reorder'
  if (item.quantityOnHand < item.parLevel) return 'below-par'
  return 'healthy'
}

export function calculateStockValue(item: InventoryItem): number {
  return item.quantityOnHand * item.unitCost
}

export function calculateShortage(item: InventoryItem): number {
  return Math.max(0, item.parLevel - item.quantityOnHand)
}

export function calculateShortagePercentage(item: InventoryItem): number | null {
  return item.parLevel > 0 ? calculateShortage(item) / item.parLevel : null
}

export function calculateDaysOfStock(item: InventoryItem): number | null {
  if (item.averageDailyConsumption === undefined || item.averageDailyConsumption <= 0) return null
  return item.quantityOnHand / item.averageDailyConsumption
}

export function getAttentionPriority(item: InventoryItem): number {
  return statusPriority[deriveStockStatus(item)]
}

export function compareInventoryAttention(first: InventoryItem, second: InventoryItem): number {
  const priorityDifference = getAttentionPriority(first) - getAttentionPriority(second)
  if (priorityDifference !== 0) return priorityDifference

  const firstDays = calculateDaysOfStock(first)
  const secondDays = calculateDaysOfStock(second)
  if (firstDays !== null || secondDays !== null) {
    if (firstDays === null) return 1
    if (secondDays === null) return -1
    if (firstDays !== secondDays) return firstDays - secondDays
  }

  const firstShortage = calculateShortagePercentage(first) ?? 0
  const secondShortage = calculateShortagePercentage(second) ?? 0
  return secondShortage - firstShortage || first.name.localeCompare(second.name)
}
