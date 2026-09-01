import { describe, expect, it } from 'vitest'

import type { InventoryItem } from '@/modules/inventory/types/inventory'
import { validateInventoryData } from '@/modules/inventory/utils/validateInventoryData'

function item(overrides: Partial<InventoryItem> = {}): InventoryItem {
  return {
    id: 'item-a',
    propertyId: 'property-a',
    name: 'Towels',
    category: 'linen',
    unit: 'pack',
    quantityOnHand: 10,
    parLevel: 12,
    reorderLevel: 4,
    unitCost: 5,
    averageDailyConsumption: 1,
    lastRestockedDate: '2025-03-01',
    ...overrides,
  }
}
const properties = new Set(['property-a'])

describe('inventory mock validation', () => {
  it('accepts coherent inventory data', () => {
    expect(() => validateInventoryData([item()], properties)).not.toThrow()
  })
  it('rejects negative quantity', () => {
    expect(() => validateInventoryData([item({ quantityOnHand: -1 })], properties)).toThrow(
      /quantity/,
    )
  })
  it('rejects reorder level above par', () => {
    expect(() => validateInventoryData([item({ reorderLevel: 13 })], properties)).toThrow(
      /exceeds par/,
    )
  })
  it('rejects negative unit cost', () => {
    expect(() => validateInventoryData([item({ unitCost: -1 })], properties)).toThrow(/unit cost/)
  })
  it('rejects negative consumption', () => {
    expect(() =>
      validateInventoryData([item({ averageDailyConsumption: -0.1 })], properties),
    ).toThrow(/consumption/)
  })
  it('rejects invalid property references', () => {
    expect(() => validateInventoryData([item({ propertyId: 'missing' })], properties)).toThrow(
      /unknown property/,
    )
  })
  it('rejects duplicate ids', () => {
    expect(() => validateInventoryData([item(), item()], properties)).toThrow(/duplicated/)
  })
  it('rejects invalid calendar dates', () => {
    expect(() =>
      validateInventoryData([item({ lastRestockedDate: '2025-02-30' })], properties),
    ).toThrow(/invalid restocked date/)
  })
  it('rejects unknown categories and units at runtime', () => {
    const invalidCategory = { ...item(), category: 'other' } as unknown as InventoryItem
    const invalidUnit = { ...item(), unit: 'crate' } as unknown as InventoryItem
    expect(() => validateInventoryData([invalidCategory], properties)).toThrow(/unknown category/)
    expect(() => validateInventoryData([invalidUnit], properties)).toThrow(/unknown unit/)
  })
})
