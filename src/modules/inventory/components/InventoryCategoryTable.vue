<script setup lang="ts">
import type { InventoryCategorySummary } from '@/modules/inventory/utils/inventoryAnalysis'
import { formatInventoryCurrency } from '@/modules/inventory/utils/inventoryFormatting'
import { formatInventoryLabel } from '@/modules/inventory/utils/inventoryLabels'

defineProps<{ rows: readonly InventoryCategorySummary[] }>()
</script>

<template>
  <div class="category-wrap">
    <table>
      <caption class="sr-only">
        Inventory value and stock pressure by category
      </caption>
      <thead>
        <tr>
          <th>Category</th>
          <th>Items</th>
          <th>Stock value</th>
          <th>Below par</th>
          <th>Reorder / out</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" :key="row.category">
          <th scope="row">{{ formatInventoryLabel(row.category) }}</th>
          <td>{{ row.itemCount }}</td>
          <td>{{ formatInventoryCurrency(row.stockValue) }}</td>
          <td>{{ row.belowParCount }}</td>
          <td>{{ row.reorderCount }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped lang="scss">
.category-wrap {
  overflow-x: auto;
}
table {
  width: 100%;
  min-width: 34rem;
  border-collapse: collapse;
  font-size: var(--font-size-sm);
}
th,
td {
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--color-border);
  text-align: right;
}
th:first-child {
  text-align: left;
}
thead th {
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
}
tbody th {
  color: var(--color-text-strong);
  font-weight: var(--font-weight-medium);
}
tbody tr:last-child > * {
  border-bottom: 0;
}
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}
</style>
