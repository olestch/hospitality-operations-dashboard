<script setup lang="ts">
import { computed } from 'vue'

import type { DashboardKpi } from '@/modules/dashboard/stores/dashboardStore'
import { DEMO_CURRENCY } from '@/mocks/demoPeriod'
import BaseBadge from '@/shared/ui/BaseBadge.vue'
import BaseCard from '@/shared/ui/BaseCard.vue'

const props = defineProps<{ kpi: DashboardKpi }>()

const currencyFormatter = new Intl.NumberFormat('en', {
  style: 'currency',
  currency: DEMO_CURRENCY,
  maximumFractionDigits: 0,
})
const percentageFormatter = new Intl.NumberFormat('en', {
  style: 'percent',
  maximumFractionDigits: 1,
})

const formattedValue = computed(() =>
  props.kpi.format === 'currency'
    ? currencyFormatter.format(props.kpi.value)
    : percentageFormatter.format(props.kpi.value),
)
const comparison = computed(() => {
  const previous = props.kpi.previousValue
  if (previous === null) return null
  const difference = props.kpi.value - previous
  const direction = difference === 0 ? 'neutral' : difference > 0 ? 'positive' : 'negative'
  const value =
    props.kpi.format === 'percentage'
      ? `${Math.abs(difference * 100).toFixed(1)} pp`
      : previous === 0
        ? currencyFormatter.format(Math.abs(difference))
        : percentageFormatter.format(Math.abs(difference / previous))

  return { direction, value }
})
</script>

<template>
  <BaseCard class="kpi-card">
    <p class="kpi-card__label">{{ kpi.label }}</p>
    <p class="kpi-card__value">{{ formattedValue }}</p>
    <BaseBadge
      v-if="comparison"
      :variant="
        comparison.direction === 'positive'
          ? 'success'
          : comparison.direction === 'negative'
            ? 'danger'
            : 'neutral'
      "
    >
      {{
        comparison.direction === 'positive' ? '↑' : comparison.direction === 'negative' ? '↓' : '→'
      }}
      {{ comparison.value }} vs previous day
    </BaseBadge>
  </BaseCard>
</template>

<style scoped lang="scss">
.kpi-card :deep(.card__content) {
  padding: var(--space-5);
}
.kpi-card__label {
  margin: 0;
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}
.kpi-card__value {
  margin: var(--space-2) 0 var(--space-4);
  color: var(--color-text-strong);
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-tight);
  letter-spacing: -0.03em;
}
</style>
