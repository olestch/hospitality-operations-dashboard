import type { InventoryItem } from '@/modules/inventory/types/inventory'
import { INVENTORY_CATEGORIES, INVENTORY_UNITS } from '@/modules/inventory/types/inventory'

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) throw new Error(`Mock data integrity error: ${message}`)
}

function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value
}

export function validateInventoryData(
  items: readonly InventoryItem[],
  propertyIds: ReadonlySet<string>,
): void {
  const ids = new Set<string>()
  for (const item of items) {
    assert(!ids.has(item.id), `${item.id} inventory id is duplicated`)
    ids.add(item.id)
    assert(propertyIds.has(item.propertyId), `${item.id} references an unknown property`)
    assert(INVENTORY_CATEGORIES.includes(item.category), `${item.id} has an unknown category`)
    assert(INVENTORY_UNITS.includes(item.unit), `${item.id} has an unknown unit`)
    assert(
      Number.isFinite(item.quantityOnHand) && item.quantityOnHand >= 0,
      `${item.id} quantity must be non-negative and finite`,
    )
    assert(
      Number.isFinite(item.parLevel) && item.parLevel >= 0,
      `${item.id} par level must be non-negative and finite`,
    )
    assert(
      Number.isFinite(item.reorderLevel) && item.reorderLevel >= 0,
      `${item.id} reorder level must be non-negative and finite`,
    )
    assert(item.reorderLevel <= item.parLevel, `${item.id} reorder level exceeds par level`)
    assert(
      Number.isFinite(item.unitCost) && item.unitCost >= 0,
      `${item.id} unit cost must be non-negative and finite`,
    )
    if (item.averageDailyConsumption !== undefined) {
      assert(
        Number.isFinite(item.averageDailyConsumption) && item.averageDailyConsumption >= 0,
        `${item.id} consumption must be non-negative and finite`,
      )
    }
    if (item.lastRestockedDate !== undefined) {
      assert(isValidDate(item.lastRestockedDate), `${item.id} has an invalid restocked date`)
    }
  }
}
