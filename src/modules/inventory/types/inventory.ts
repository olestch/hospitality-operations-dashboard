export const INVENTORY_CATEGORIES = [
  'housekeeping',
  'guest-amenities',
  'food-beverage',
  'maintenance',
  'linen',
  'office-operations',
] as const
export type InventoryCategory = (typeof INVENTORY_CATEGORIES)[number]

export const INVENTORY_UNITS = [
  'each',
  'box',
  'case',
  'bottle',
  'kilogram',
  'liter',
  'roll',
  'pack',
] as const
export type InventoryUnit = (typeof INVENTORY_UNITS)[number]

export type InventoryStockStatus = 'healthy' | 'below-par' | 'reorder' | 'out-of-stock'

export interface InventoryItem {
  id: string
  propertyId: string
  name: string
  category: InventoryCategory
  unit: InventoryUnit
  quantityOnHand: number
  parLevel: number
  reorderLevel: number
  unitCost: number
  location?: string
  supplierLabel?: string
  lastRestockedDate?: string
  averageDailyConsumption?: number
}

export interface InventoryFilters {
  propertyId?: string
  location?: string
}
