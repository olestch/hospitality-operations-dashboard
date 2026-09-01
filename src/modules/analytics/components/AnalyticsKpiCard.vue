<script setup lang="ts">
import { computed } from 'vue'

import type { AnalyticsKpi } from '@/modules/analytics/stores/analyticsStore'
import { DEMO_CURRENCY } from '@/mocks/demoPeriod'
import BaseBadge from '@/shared/ui/BaseBadge.vue'
import BaseCard from '@/shared/ui/BaseCard.vue'

const props = defineProps<{ kpi: AnalyticsKpi; periodLabel: string }>()
const currencyFormatter = new Intl.NumberFormat('en', {
  style: 'currency',
  currency: DEMO_CURRENCY,
  maximumFractionDigits: 0,
})
const percentageFormatter = new Intl.NumberFormat('en', {
  style: 'percent',
  maximumFractionDigits: 1,
})

const formattedValue = computed(() => formatValue(props.kpi.comparison.current))
const comparisonText = computed(() => {
  const comparison = props.kpi.comparison
  if (comparison.direction === 'unavailable') return 'No comparable previous period'
  if (comparison.direction === 'flat') return 'No change vs previous period'
  if (props.kpi.format === 'percentage' && comparison.absoluteChange !== null) {
    return `${Math.abs(comparison.absoluteChange * 100).toFixed(1)} pp vs previous period`
  }
  if (comparison.percentageChange === null) return 'Previous period was zero'
  return `${percentageFormatter.format(Math.abs(comparison.percentageChange))} vs previous period`
})
const badgeVariant = computed(() => {
  if (props.kpi.comparison.direction === 'up') return 'success'
  if (props.kpi.comparison.direction === 'down') return 'danger'
  return 'neutral'
})
const directionSymbol = computed(() => {
  if (props.kpi.comparison.direction === 'up') return '↑'
  if (props.kpi.comparison.direction === 'down') return '↓'
  if (props.kpi.comparison.direction === 'flat') return '→'
  return '—'
})

function formatValue(value: number): string {
  return props.kpi.format === 'currency'
    ? currencyFormatter.format(value)
    : percentageFormatter.format(value)
}
</script>

<template>
  <BaseCard class="analytics-kpi" as="article">
    <div class="analytics-kpi__heading">
      <p>{{ kpi.label }}</p>
      <span>{{ periodLabel }}</span>
    </div>
    <strong>{{ formattedValue }}</strong>
    <BaseBadge :variant="badgeVariant"> {{ directionSymbol }} {{ comparisonText }} </BaseBadge>
  </BaseCard>
</template>

<style scoped lang="scss">
.analytics-kpi :deep(.card__content) {
  display: grid;
  gap: var(--space-3);
  padding: var(--space-5);
}
.analytics-kpi__heading {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-3);
}
.analytics-kpi__heading p,
.analytics-kpi__heading span {
  margin: 0;
  color: var(--color-text-muted);
}
.analytics-kpi__heading p {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}
.analytics-kpi__heading span {
  font-size: var(--font-size-xs);
}
.analytics-kpi strong {
  color: var(--color-text-strong);
  font-size: var(--font-size-2xl);
  line-height: var(--line-height-tight);
  letter-spacing: -0.03em;
}
.analytics-kpi :deep(.badge) {
  width: max-content;
  max-width: 100%;
}
</style>
