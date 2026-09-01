<script setup lang="ts">
import type { InventoryItem } from '@/modules/inventory/types/inventory'
import {
  formatDaysOfStock,
  formatInventoryCurrency,
  formatInventoryQuantity,
} from '@/modules/inventory/utils/inventoryFormatting'
import { formatInventoryLabel } from '@/modules/inventory/utils/inventoryLabels'
import {
  calculateDaysOfStock,
  calculateStockValue,
  deriveStockStatus,
} from '@/modules/inventory/utils/stockLevels'
import BaseBadge from '@/shared/ui/BaseBadge.vue'

defineProps<{ items: readonly InventoryItem[] }>()
const emit = defineEmits<{ select: [itemId: string] }>()
function badgeVariant(item: InventoryItem): 'neutral' | 'success' | 'warning' | 'danger' {
  const status = deriveStockStatus(item)
  if (status === 'healthy') return 'success'
  if (status === 'out-of-stock') return 'danger'
  return 'warning'
}
</script>

<template>
  <div class="inventory-table-wrap">
    <table class="inventory-table">
      <caption class="sr-only">
        Inventory items and operational stock levels
      </caption>
      <thead>
        <tr>
          <th>Item</th>
          <th>Category</th>
          <th>Location</th>
          <th>On hand</th>
          <th>Par</th>
          <th>Reorder</th>
          <th>Unit cost</th>
          <th>Stock value</th>
          <th>Days of stock</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in items" :key="item.id">
          <th scope="row">
            <button type="button" @click="emit('select', item.id)">{{ item.name }}</button>
          </th>
          <td>{{ formatInventoryLabel(item.category) }}</td>
          <td>{{ item.location ?? '—' }}</td>
          <td>{{ formatInventoryQuantity(item) }}</td>
          <td>{{ formatInventoryQuantity(item, item.parLevel) }}</td>
          <td>{{ formatInventoryQuantity(item, item.reorderLevel) }}</td>
          <td>{{ formatInventoryCurrency(item.unitCost) }}</td>
          <td>{{ formatInventoryCurrency(calculateStockValue(item)) }}</td>
          <td>{{ formatDaysOfStock(calculateDaysOfStock(item)) }}</td>
          <td>
            <BaseBadge :variant="badgeVariant(item)">{{
              formatInventoryLabel(deriveStockStatus(item))
            }}</BaseBadge>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  <ul class="inventory-cards">
    <li v-for="item in items" :key="item.id">
      <button type="button" @click="emit('select', item.id)">
        <span class="inventory-card__heading"
          ><strong>{{ item.name }}</strong
          ><BaseBadge :variant="badgeVariant(item)">{{
            formatInventoryLabel(deriveStockStatus(item))
          }}</BaseBadge></span
        >
        <span
          >{{ formatInventoryQuantity(item) }} on hand · Par
          {{ formatInventoryQuantity(item, item.parLevel) }}</span
        >
        <span
          >{{ formatInventoryCurrency(calculateStockValue(item)) }} value ·
          {{ formatDaysOfStock(calculateDaysOfStock(item)) }}</span
        >
      </button>
    </li>
  </ul>
</template>

<style scoped lang="scss">
.inventory-table-wrap {
  overflow-x: auto;
}
.inventory-table {
  width: 100%;
  min-width: 76rem;
  border-collapse: collapse;
  font-size: var(--font-size-xs);
}
th,
td {
  padding: var(--space-3);
  border-bottom: 1px solid var(--color-border);
  text-align: left;
  white-space: nowrap;
}
thead th {
  color: var(--color-text-muted);
  font-weight: var(--font-weight-semibold);
}
tbody tr:last-child > * {
  border-bottom: 0;
}
tbody th button {
  padding: 0;
  border: 0;
  background: none;
  color: var(--color-text-strong);
  font: inherit;
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
}
tbody th button:hover {
  color: var(--color-primary);
}
.inventory-cards {
  display: none;
  margin: 0;
  padding: 0;
  list-style: none;
}
.inventory-cards li {
  border-bottom: 1px solid var(--color-border);
}
.inventory-cards li:last-child {
  border-bottom: 0;
}
.inventory-cards button {
  display: grid;
  width: 100%;
  gap: var(--space-2);
  padding: var(--space-4);
  border: 0;
  background: none;
  color: var(--color-text-muted);
  font: inherit;
  font-size: var(--font-size-xs);
  text-align: left;
  cursor: pointer;
}
.inventory-card__heading {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: var(--space-3);
  color: var(--color-text-strong);
  font-size: var(--font-size-sm);
}
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}
@media (max-width: 48rem) {
  .inventory-table-wrap {
    display: none;
  }
  .inventory-cards {
    display: block;
  }
}
</style>
