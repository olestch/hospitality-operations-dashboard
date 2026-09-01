import type {
  InventoryCategory,
  InventoryStockStatus,
  InventoryUnit,
} from '@/modules/inventory/types/inventory'

const labels: Record<InventoryCategory | InventoryStockStatus | InventoryUnit, string> = {
  housekeeping: 'Housekeeping',
  'guest-amenities': 'Guest amenities',
  'food-beverage': 'Food & beverage',
  maintenance: 'Maintenance',
  linen: 'Linen',
  'office-operations': 'Office / operations',
  healthy: 'Healthy',
  'below-par': 'Below par',
  reorder: 'Reorder required',
  'out-of-stock': 'Out of stock',
  each: 'each',
  box: 'box',
  case: 'case',
  bottle: 'bottle',
  kilogram: 'kg',
  liter: 'liter',
  roll: 'roll',
  pack: 'pack',
}

export function formatInventoryLabel(
  value: InventoryCategory | InventoryStockStatus | InventoryUnit,
): string {
  return labels[value]
}
