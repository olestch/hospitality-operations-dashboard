import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'

import { usePropertyStore } from '@/app/stores/propertyStore'
import { getInventory } from '@/modules/inventory/api/inventoryRepository'
import type {
  InventoryCategory,
  InventoryItem,
  InventoryStockStatus,
} from '@/modules/inventory/types/inventory'
import {
  aggregateInventoryCategories,
  calculateInventoryKpis,
  getInventoryAttentionItems,
} from '@/modules/inventory/utils/inventoryAnalysis'
import {
  filterAndSortInventory,
  type InventorySort,
} from '@/modules/inventory/utils/inventoryFilters'
import type { RequestStatus } from '@/shared/types/request'

export const useInventoryStore = defineStore('inventory', () => {
  const propertyStore = usePropertyStore()
  const status = ref<RequestStatus>('idle')
  const error = ref<string | null>(null)
  const items = ref<InventoryItem[]>([])
  const statusFilter = ref<InventoryStockStatus | null>(null)
  const categoryFilter = ref<InventoryCategory | null>(null)
  const locationFilter = ref<string | null>(null)
  const sort = ref<InventorySort>('attention')
  const selectedItemId = ref<string | null>(null)
  let latestRequest = 0

  const kpis = computed(() => calculateInventoryKpis(items.value))
  const categorySummary = computed(() => aggregateInventoryCategories(items.value))
  const attentionItems = computed(() => getInventoryAttentionItems(items.value))
  const filteredItems = computed(() =>
    filterAndSortInventory(items.value, {
      status: statusFilter.value,
      category: categoryFilter.value,
      location: locationFilter.value,
      sort: sort.value,
    }),
  )
  const categories = computed(() => [...new Set(items.value.map((item) => item.category))].sort())
  const locations = computed(() =>
    [...new Set(items.value.flatMap((item) => (item.location ? [item.location] : [])))].sort(),
  )
  const selectedItem = computed(
    () => items.value.find((item) => item.id === selectedItemId.value) ?? null,
  )
  const hasActiveControls = computed(
    () =>
      statusFilter.value !== null ||
      categoryFilter.value !== null ||
      locationFilter.value !== null ||
      sort.value !== 'attention',
  )

  async function load(propertyId: string): Promise<void> {
    const requestId = ++latestRequest
    status.value = 'loading'
    error.value = null
    try {
      const nextItems = await getInventory({ propertyId })
      if (requestId !== latestRequest) return
      items.value = nextItems
      status.value = 'success'
    } catch (reason: unknown) {
      if (requestId !== latestRequest) return
      error.value = reason instanceof Error ? reason.message : 'Unable to load inventory'
      status.value = 'failure'
    }
  }

  function openItem(itemId: string): void {
    selectedItemId.value = itemId
  }

  function closeItem(): void {
    selectedItemId.value = null
  }

  function resetControls(): void {
    statusFilter.value = null
    categoryFilter.value = null
    locationFilter.value = null
    sort.value = 'attention'
  }

  async function retry(): Promise<void> {
    if (propertyStore.selectedPropertyId) await load(propertyStore.selectedPropertyId)
  }

  watch(
    () => propertyStore.selectedPropertyId,
    (propertyId) => {
      closeItem()
      if (propertyId) void load(propertyId)
    },
    { immediate: true },
  )

  return {
    status,
    error,
    items,
    statusFilter,
    categoryFilter,
    locationFilter,
    sort,
    selectedItemId,
    selectedItem,
    kpis,
    categorySummary,
    attentionItems,
    filteredItems,
    categories,
    locations,
    hasActiveControls,
    openItem,
    closeItem,
    resetControls,
    retry,
  }
})
