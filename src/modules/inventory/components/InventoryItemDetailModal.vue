<script setup lang="ts">
import type { InventoryItem } from '@/modules/inventory/types/inventory'
import {
  formatDaysOfStock,
  formatInventoryCurrency,
  formatInventoryDate,
  formatInventoryQuantity,
  formatStockPosition,
} from '@/modules/inventory/utils/inventoryFormatting'
import { formatInventoryLabel } from '@/modules/inventory/utils/inventoryLabels'
import {
  calculateDaysOfStock,
  calculateStockValue,
  deriveStockStatus,
} from '@/modules/inventory/utils/stockLevels'
import BaseBadge from '@/shared/ui/BaseBadge.vue'
import BaseModal from '@/shared/ui/BaseModal.vue'

defineProps<{ open: boolean; item: InventoryItem | null }>()
const emit = defineEmits<{ close: [] }>()
function badgeVariant(item: InventoryItem): 'neutral' | 'success' | 'warning' | 'danger' {
  const status = deriveStockStatus(item)
  if (status === 'healthy') return 'success'
  if (status === 'out-of-stock') return 'danger'
  return 'warning'
}
</script>

<template>
  <BaseModal :open :title="item?.name ?? 'Inventory item'" size="large" @close="emit('close')">
    <article v-if="item" class="item-detail">
      <div class="item-detail__status">
        <BaseBadge :variant="badgeVariant(item)">{{
          formatInventoryLabel(deriveStockStatus(item))
        }}</BaseBadge>
        <p>{{ formatStockPosition(item) }}</p>
      </div>
      <dl>
        <div>
          <dt>Category</dt>
          <dd>{{ formatInventoryLabel(item.category) }}</dd>
        </div>
        <div>
          <dt>Storage location</dt>
          <dd>{{ item.location ?? 'Not recorded' }}</dd>
        </div>
        <div>
          <dt>Quantity on hand</dt>
          <dd>{{ formatInventoryQuantity(item) }}</dd>
        </div>
        <div>
          <dt>Par level</dt>
          <dd>{{ formatInventoryQuantity(item, item.parLevel) }}</dd>
        </div>
        <div>
          <dt>Reorder level</dt>
          <dd>{{ formatInventoryQuantity(item, item.reorderLevel) }}</dd>
        </div>
        <div>
          <dt>Unit cost</dt>
          <dd>
            {{ formatInventoryCurrency(item.unitCost) }} per {{ formatInventoryLabel(item.unit) }}
          </dd>
        </div>
        <div>
          <dt>Total stock value</dt>
          <dd>{{ formatInventoryCurrency(calculateStockValue(item)) }}</dd>
        </div>
        <div>
          <dt>Average daily consumption</dt>
          <dd>
            {{
              item.averageDailyConsumption === undefined
                ? 'Not recorded'
                : formatInventoryQuantity(item, item.averageDailyConsumption)
            }}
          </dd>
        </div>
        <div>
          <dt>Estimated days of stock</dt>
          <dd>{{ formatDaysOfStock(calculateDaysOfStock(item)) }}</dd>
        </div>
        <div>
          <dt>Supplier</dt>
          <dd>{{ item.supplierLabel ?? 'Not recorded' }}</dd>
        </div>
        <div>
          <dt>Last restocked</dt>
          <dd>
            {{
              item.lastRestockedDate ? formatInventoryDate(item.lastRestockedDate) : 'Not recorded'
            }}
          </dd>
        </div>
      </dl>
      <p class="item-detail__note">
        Days of stock is a simple estimate based on current quantity and recorded average daily
        consumption. It is unavailable when consumption is missing or zero.
      </p>
    </article>
  </BaseModal>
</template>

<style scoped lang="scss">
.item-detail {
  display: grid;
  gap: var(--space-6);
}
.item-detail__status {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4);
  border-radius: var(--radius-md);
  background: var(--color-surface-subtle);
}
.item-detail__status p {
  margin: 0;
  color: var(--color-text);
  font-size: var(--font-size-sm);
}
dl {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-5);
  margin: 0;
}
dl div {
  display: grid;
  gap: var(--space-1);
}
dt {
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
}
dd {
  margin: 0;
  color: var(--color-text-strong);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}
.item-detail__note {
  margin: 0;
  padding-top: var(--space-4);
  border-top: 1px solid var(--color-border);
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
}
@media (max-width: 48rem) {
  .item-detail__status {
    align-items: flex-start;
    flex-direction: column;
  }
  dl {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
