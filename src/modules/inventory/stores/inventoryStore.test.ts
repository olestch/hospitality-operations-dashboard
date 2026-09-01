import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'

import { usePropertyStore } from '@/app/stores/propertyStore'
import { getInventory } from '@/modules/inventory/api/inventoryRepository'
import { useInventoryStore } from '@/modules/inventory/stores/inventoryStore'
import type { InventoryItem } from '@/modules/inventory/types/inventory'

vi.mock('@/modules/inventory/api/inventoryRepository', () => ({ getInventory: vi.fn() }))
const mockedGetInventory = vi.mocked(getInventory)

function item(id: string, propertyId: string): InventoryItem {
  return {
    id,
    propertyId,
    name: id,
    category: 'linen',
    unit: 'each',
    quantityOnHand: 10,
    parLevel: 10,
    reorderLevel: 3,
    unitCost: 2,
  }
}

describe('inventory store loading', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    mockedGetInventory.mockReset()
  })

  it('ignores a stale property response', async () => {
    let resolveFirst!: (value: InventoryItem[]) => void
    let resolveSecond!: (value: InventoryItem[]) => void
    mockedGetInventory
      .mockReturnValueOnce(
        new Promise((resolve) => {
          resolveFirst = resolve
        }),
      )
      .mockReturnValueOnce(
        new Promise((resolve) => {
          resolveSecond = resolve
        }),
      )
    const propertyStore = usePropertyStore()
    const store = useInventoryStore()
    propertyStore.selectedPropertyId = 'property-a'
    await nextTick()
    propertyStore.selectedPropertyId = 'property-b'
    await nextTick()
    resolveSecond([item('second', 'property-b')])
    await nextTick()
    resolveFirst([item('first', 'property-a')])
    await nextTick()
    await nextTick()
    expect(store.items.map(({ id }) => id)).toEqual(['second'])
  })

  it('resets controls without reloading repository data', async () => {
    mockedGetInventory.mockResolvedValue([])
    const store = useInventoryStore()
    store.statusFilter = 'reorder'
    store.sort = 'name'
    store.resetControls()
    expect(store.statusFilter).toBeNull()
    expect(store.sort).toBe('attention')
    expect(mockedGetInventory).not.toHaveBeenCalled()
  })
})
