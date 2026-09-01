<script setup lang="ts">
import type { InventoryItem } from '@/modules/inventory/types/inventory'
import {
  formatDaysOfStock,
  formatInventoryQuantity,
} from '@/modules/inventory/utils/inventoryFormatting'
import { formatInventoryLabel } from '@/modules/inventory/utils/inventoryLabels'
import { calculateDaysOfStock, deriveStockStatus } from '@/modules/inventory/utils/stockLevels'
import BaseBadge from '@/shared/ui/BaseBadge.vue'
import EmptyState from '@/shared/ui/EmptyState.vue'

defineProps<{ items: readonly InventoryItem[] }>()
const emit = defineEmits<{ select: [itemId: string] }>()
function badgeVariant(item: InventoryItem): 'neutral' | 'warning' | 'danger' {
  const status = deriveStockStatus(item)
  return status === 'out-of-stock' ? 'danger' : status === 'reorder' ? 'warning' : 'neutral'
}
</script>

<template>
  <ol v-if="items.length" class="attention-list">
    <li v-for="item in items" :key="item.id">
      <button type="button" @click="emit('select', item.id)">
        <span class="attention-list__main"
          ><strong>{{ item.name }}</strong
          ><small
            >{{ formatInventoryQuantity(item) }} on hand ·
            {{ formatDaysOfStock(calculateDaysOfStock(item)) }}</small
          ></span
        >
        <BaseBadge :variant="badgeVariant(item)">{{
          formatInventoryLabel(deriveStockStatus(item))
        }}</BaseBadge>
      </button>
    </li>
  </ol>
  <EmptyState
    v-else
    title="Stock levels are healthy"
    description="All tracked items are at or above par."
  />
</template>

<style scoped lang="scss">
.attention-list {
  margin: 0;
  padding: 0;
  list-style: none;
  counter-reset: attention;
}
.attention-list li {
  border-bottom: 1px solid var(--color-border);
  counter-increment: attention;
}
.attention-list li:last-child {
  border-bottom: 0;
}
.attention-list button {
  display: grid;
  width: 100%;
  grid-template-columns: 1.5rem minmax(0, 1fr) auto;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  border: 0;
  background: none;
  color: inherit;
  text-align: left;
  cursor: pointer;
}
.attention-list button::before {
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
  content: counter(attention);
}
.attention-list__main {
  display: grid;
  min-width: 0;
  gap: var(--space-1);
}
.attention-list strong {
  overflow: hidden;
  color: var(--color-text-strong);
  font-size: var(--font-size-sm);
  text-overflow: ellipsis;
  white-space: nowrap;
}
.attention-list small {
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
}
</style>
