<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed } from 'vue'

import { usePropertyStore } from '@/app/stores/propertyStore'
import InventoryAttentionList from '@/modules/inventory/components/InventoryAttentionList.vue'
import InventoryCategoryTable from '@/modules/inventory/components/InventoryCategoryTable.vue'
import InventoryItemDetailModal from '@/modules/inventory/components/InventoryItemDetailModal.vue'
import InventoryKpiCard from '@/modules/inventory/components/InventoryKpiCard.vue'
import InventoryList from '@/modules/inventory/components/InventoryList.vue'
import { useInventoryStore } from '@/modules/inventory/stores/inventoryStore'
import type { InventoryCategory, InventoryStockStatus } from '@/modules/inventory/types/inventory'
import { formatInventoryCurrency } from '@/modules/inventory/utils/inventoryFormatting'
import type { InventorySort } from '@/modules/inventory/utils/inventoryFilters'
import { formatInventoryLabel } from '@/modules/inventory/utils/inventoryLabels'
import BaseButton from '@/shared/ui/BaseButton.vue'
import BaseCard from '@/shared/ui/BaseCard.vue'
import BaseSelect, { type SelectOption, type SelectValue } from '@/shared/ui/BaseSelect.vue'
import EmptyState from '@/shared/ui/EmptyState.vue'
import PageHeader from '@/shared/ui/PageHeader.vue'

const propertyStore = usePropertyStore()
const inventoryStore = useInventoryStore()
const {
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
} = storeToRefs(inventoryStore)

const statusOptions: readonly SelectOption[] = [
  { label: 'All stock statuses', value: 'all' },
  { label: 'Healthy', value: 'healthy' },
  { label: 'Below par', value: 'below-par' },
  { label: 'Reorder required', value: 'reorder' },
  { label: 'Out of stock', value: 'out-of-stock' },
]
const sortOptions: readonly SelectOption[] = [
  { label: 'Attention priority', value: 'attention' },
  { label: 'Item name', value: 'name' },
  { label: 'Quantity: low to high', value: 'quantity' },
  { label: 'Stock value: high to low', value: 'stock-value' },
]
const categoryOptions = computed<readonly SelectOption[]>(() => [
  { label: 'All categories', value: 'all' },
  ...categories.value.map((category) => ({
    label: formatInventoryLabel(category),
    value: category,
  })),
])
const locationOptions = computed<readonly SelectOption[]>(() => [
  { label: 'All locations', value: 'all' },
  ...locations.value.map((location) => ({ label: location, value: location })),
])
const statusModel = computed<SelectValue | null>({
  get: () => statusFilter.value ?? 'all',
  set: (value) => {
    statusFilter.value = value === 'all' ? null : (value as InventoryStockStatus)
  },
})
const categoryModel = computed<SelectValue | null>({
  get: () => categoryFilter.value ?? 'all',
  set: (value) => {
    categoryFilter.value = value === 'all' ? null : (value as InventoryCategory)
  },
})
const locationModel = computed<SelectValue | null>({
  get: () => locationFilter.value ?? 'all',
  set: (value) => {
    locationFilter.value = value === 'all' ? null : String(value)
  },
})
const sortModel = computed<SelectValue | null>({
  get: () => sort.value,
  set: (value) => {
    sort.value = (value ?? 'attention') as InventorySort
  },
})
const pageDescription = computed(
  () =>
    `${propertyStore.selectedProperty?.name ?? 'Selected property'} · Operational stock levels and replenishment priorities`,
)
const healthyPercentage = computed(() =>
  kpis.value.healthyPercentage === null
    ? '—'
    : `${Math.round(kpis.value.healthyPercentage * 100)}%`,
)
</script>

<template>
  <section class="inventory-page">
    <PageHeader eyebrow="Resources" title="Inventory" :description="pageDescription" />

    <div
      v-if="status === 'idle' || status === 'loading'"
      class="inventory-loading"
      role="status"
      aria-live="polite"
    >
      <span class="sr-only">Loading inventory</span><span v-for="index in 4" :key="index" />
    </div>
    <BaseCard v-else-if="status === 'failure'" class="inventory-message" role="alert"
      ><EmptyState title="Inventory could not be loaded" :description="error ?? 'Please try again.'"
        ><template #action
          ><BaseButton @click="inventoryStore.retry">Try again</BaseButton></template
        ></EmptyState
      ></BaseCard
    >
    <BaseCard v-else-if="!items.length" class="inventory-message"
      ><EmptyState
        title="No inventory records"
        description="No tracked stock items are available for this property."
    /></BaseCard>
    <template v-else>
      <section class="inventory-kpis" aria-label="Inventory summary">
        <InventoryKpiCard
          label="Total inventory value"
          :value="formatInventoryCurrency(kpis.totalStockValue)"
          description="Current quantity × unit cost"
        />
        <InventoryKpiCard
          label="Items below par"
          :value="String(kpis.belowParCount)"
          description="All items below target level"
          :tone="kpis.belowParCount ? 'warning' : 'neutral'"
        />
        <InventoryKpiCard
          label="Requires reorder"
          :value="String(kpis.reorderCount)"
          description="At reorder level or out of stock"
          :tone="kpis.reorderCount ? 'warning' : 'neutral'"
        />
        <InventoryKpiCard
          label="Healthy stock"
          :value="healthyPercentage"
          description="Items at or above par"
        />
      </section>

      <div class="inventory-analysis">
        <BaseCard class="attention-panel"
          ><template #header
            ><div class="section-heading">
              <h2>Needs attention first</h2>
              <p>Ranked by stock status, estimated cover and shortage</p>
            </div></template
          ><InventoryAttentionList :items="attentionItems" @select="inventoryStore.openItem"
        /></BaseCard>
        <BaseCard class="category-panel"
          ><template #header
            ><div class="section-heading">
              <h2>Category summary</h2>
              <p>Current value and replenishment pressure</p>
            </div></template
          ><InventoryCategoryTable :rows="categorySummary"
        /></BaseCard>
      </div>

      <BaseCard class="inventory-panel">
        <template #header
          ><div class="inventory-heading">
            <div class="section-heading">
              <h2>Inventory items</h2>
              <p>{{ filteredItems.length }} of {{ items.length }} tracked items</p>
            </div>
            <BaseButton
              v-if="hasActiveControls"
              variant="ghost"
              size="small"
              @click="inventoryStore.resetControls"
              >Reset controls</BaseButton
            >
          </div></template
        >
        <div class="inventory-controls" aria-label="Inventory filters and sorting">
          <BaseSelect v-model="statusModel" label="Stock status" :options="statusOptions" />
          <BaseSelect v-model="categoryModel" label="Category" :options="categoryOptions" />
          <BaseSelect v-model="locationModel" label="Location" :options="locationOptions" />
          <BaseSelect v-model="sortModel" label="Sort by" :options="sortOptions" />
        </div>
        <InventoryList
          v-if="filteredItems.length"
          :items="filteredItems"
          @select="inventoryStore.openItem"
        />
        <EmptyState
          v-else
          title="No matching inventory"
          description="Adjust or reset the controls to see tracked items."
          ><template #action
            ><BaseButton variant="secondary" @click="inventoryStore.resetControls"
              >Reset controls</BaseButton
            ></template
          ></EmptyState
        >
      </BaseCard>
    </template>

    <InventoryItemDetailModal
      :open="selectedItemId !== null"
      :item="selectedItem"
      @close="inventoryStore.closeItem"
    />
  </section>
</template>

<style scoped lang="scss">
.inventory-page {
  display: grid;
  min-width: 0;
  gap: var(--space-6);
}
.inventory-page :deep(.page-header) {
  margin-bottom: 0;
}
.inventory-kpis,
.inventory-loading {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--space-4);
}
.inventory-loading span:not(.sr-only) {
  min-height: 8rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-surface-subtle);
}
.inventory-analysis {
  display: grid;
  grid-template-columns: minmax(20rem, 0.8fr) minmax(0, 1.2fr);
  gap: var(--space-6);
}
.attention-panel,
.category-panel,
.inventory-panel {
  min-width: 0;
}
.attention-panel :deep(.card__content),
.category-panel :deep(.card__content),
.inventory-panel :deep(.card__content) {
  padding: 0;
}
.section-heading h2 {
  margin: 0;
  color: var(--color-text-strong);
  font-size: var(--font-size-md);
}
.section-heading p {
  margin: var(--space-1) 0 0;
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
}
.inventory-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
}
.inventory-controls {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 13rem));
  gap: var(--space-4);
  padding: var(--space-4);
  border-bottom: 1px solid var(--color-border);
}
.inventory-message {
  min-height: 22rem;
}
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}
@media (max-width: 72rem) {
  .inventory-kpis,
  .inventory-loading {
    grid-template-columns: repeat(2, 1fr);
  }
  .inventory-analysis {
    grid-template-columns: 1fr;
  }
  .inventory-controls {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 48rem) {
  .inventory-kpis,
  .inventory-loading,
  .inventory-controls {
    grid-template-columns: 1fr;
  }
  .inventory-controls {
    gap: var(--space-3);
  }
}
</style>
