<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed } from 'vue'

import { usePropertyStore } from '@/app/stores/propertyStore'
import AnalyticsKpiCard from '@/modules/analytics/components/AnalyticsKpiCard.vue'
import HospitalityMetricChart from '@/modules/analytics/components/HospitalityMetricChart.vue'
import RevenueSourceChart from '@/modules/analytics/components/RevenueSourceChart.vue'
import RoomTypePerformanceTable from '@/modules/analytics/components/RoomTypePerformanceTable.vue'
import { useAnalyticsStore } from '@/modules/analytics/stores/analyticsStore'
import type { HospitalityMetricKey } from '@/modules/analytics/types/revenue'
import type { AnalyticsPeriodPreset } from '@/modules/analytics/utils/analyticsPeriods'
import BaseButton from '@/shared/ui/BaseButton.vue'
import BaseCard from '@/shared/ui/BaseCard.vue'
import type { SelectOption, SelectValue } from '@/shared/ui/BaseSelect.vue'
import BaseSelect from '@/shared/ui/BaseSelect.vue'
import BaseTabs, { type TabItem } from '@/shared/ui/BaseTabs.vue'
import EmptyState from '@/shared/ui/EmptyState.vue'
import PageHeader from '@/shared/ui/PageHeader.vue'

const propertyStore = usePropertyStore()
const analyticsStore = useAnalyticsStore()
const {
  status,
  error,
  selectedPeriod,
  selectedMetric,
  period,
  previousRange,
  kpis,
  trend,
  sourceComposition,
  roomTypePerformance,
  insights,
  hasData,
  hasPeriodActivity,
} = storeToRefs(analyticsStore)

const periodPresets = [
  'last-7-days',
  'last-30-days',
  'full-demo-period',
] as const satisfies readonly AnalyticsPeriodPreset[]
const periodOptions: readonly SelectOption[] = [
  { label: 'Last 7 days', value: 'last-7-days' },
  { label: 'Last 30 days', value: 'last-30-days' },
  { label: 'Full demo period', value: 'full-demo-period' },
]
const metricTabs: readonly TabItem[] = [
  { id: 'revenue', label: 'Revenue' },
  { id: 'occupancy', label: 'Occupancy' },
  { id: 'adr', label: 'ADR' },
  { id: 'revpar', label: 'RevPAR' },
]
const metricKeys = metricTabs.map((tab) => tab.id) as HospitalityMetricKey[]
const periodModel = computed<SelectValue | null>({
  get: () => selectedPeriod.value,
  set: (value) => {
    selectedPeriod.value = periodPresets.find((preset) => preset === value) ?? 'last-30-days'
  },
})
const metricModel = computed({
  get: () => selectedMetric.value,
  set: (value: string) => {
    selectedMetric.value = metricKeys.find((metric) => metric === value) ?? 'revenue'
  },
})
const dateFormatter = new Intl.DateTimeFormat('en', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
})
const pageDescription = computed(
  () =>
    `${propertyStore.selectedProperty?.name ?? 'Selected property'} · Performance through the fixed demo dataset`,
)
const rangeLabel = computed(
  () => `${formatDate(period.value.range.start)} – ${formatDate(period.value.range.end)}`,
)
const comparisonLabel = computed(() =>
  previousRange.value
    ? `Compared with ${formatDate(previousRange.value.start)} – ${formatDate(previousRange.value.end)}`
    : 'No equal preceding period is available',
)

function formatDate(value: string): string {
  return dateFormatter.format(new Date(`${value}T00:00:00Z`))
}
</script>

<template>
  <section class="analytics-page">
    <PageHeader eyebrow="Insights" title="Analytics" :description="pageDescription" />

    <BaseCard class="analytics-controls">
      <div>
        <strong>{{ period.label }}</strong>
        <span>{{ rangeLabel }}</span>
        <small>{{ comparisonLabel }}</small>
      </div>
      <BaseSelect v-model="periodModel" label="Analytics period" :options="periodOptions" />
    </BaseCard>

    <div
      v-if="status === 'idle' || status === 'loading'"
      class="analytics-loading"
      role="status"
      aria-live="polite"
    >
      <span class="sr-only">Loading analytics data</span>
      <div class="analytics-loading__kpis">
        <span v-for="index in 4" :key="index" />
      </div>
      <span class="analytics-loading__chart" />
    </div>

    <BaseCard v-else-if="status === 'failure'" class="analytics-message" role="alert">
      <EmptyState title="Analytics could not be loaded" :description="error ?? 'Please try again.'">
        <template #action
          ><BaseButton @click="analyticsStore.retry">Try again</BaseButton></template
        >
      </EmptyState>
    </BaseCard>

    <BaseCard v-else-if="!hasData" class="analytics-message">
      <EmptyState
        title="No analytics data"
        description="There are no complete daily performance records for this property and period."
      />
    </BaseCard>

    <template v-else>
      <section class="analytics-kpis" aria-labelledby="analytics-kpi-heading">
        <h2 id="analytics-kpi-heading" class="sr-only">Period performance metrics</h2>
        <AnalyticsKpiCard
          v-for="kpi in kpis"
          :key="kpi.key"
          :kpi="kpi"
          :period-label="period.label"
        />
      </section>

      <p v-if="!hasPeriodActivity" class="analytics-notice" role="status">
        No occupied stays or attributed room revenue fall within this period. Capacity remains
        available, so occupancy and RevPAR are correctly shown as zero.
      </p>

      <BaseCard class="trend-panel">
        <template #header>
          <div class="section-heading">
            <div>
              <h2>Revenue &amp; performance trend</h2>
              <p>{{ rangeLabel }} · Select a metric without reloading property data</p>
            </div>
          </div>
        </template>
        <BaseTabs v-model="metricModel" :tabs="metricTabs" aria-label="Trend metric" />
        <HospitalityMetricChart
          :metrics="trend"
          :metric="selectedMetric"
          :period-label="period.label"
        />
      </BaseCard>

      <div class="analytics-secondary-grid">
        <BaseCard class="source-panel">
          <template #header>
            <div class="section-heading">
              <div>
                <h2>Revenue by booking source</h2>
                <p>Stay-night allocation within the selected period</p>
              </div>
            </div>
          </template>
          <RevenueSourceChart v-if="sourceComposition.length" :sources="sourceComposition" />
          <EmptyState
            v-else
            title="No source revenue"
            description="No booking revenue can be attributed to this period."
          />
        </BaseCard>

        <BaseCard class="insights-panel">
          <template #header>
            <div class="section-heading">
              <div>
                <h2>Performance insights</h2>
                <p>Deterministic signals from period comparisons</p>
              </div>
            </div>
          </template>
          <ul class="insight-list">
            <li v-for="insight in insights" :key="insight.id" :class="`is-${insight.tone}`">
              <span aria-hidden="true">{{
                insight.tone === 'positive' ? '↑' : insight.tone === 'attention' ? '!' : '→'
              }}</span>
              <p>{{ insight.message }}</p>
            </li>
          </ul>
        </BaseCard>
      </div>

      <BaseCard class="room-type-panel">
        <template #header>
          <div class="section-heading">
            <div>
              <h2>Occupancy by room type</h2>
              <p>Unavailable rooms are excluded from sellable capacity</p>
            </div>
          </div>
        </template>
        <RoomTypePerformanceTable :rows="roomTypePerformance" />
      </BaseCard>
    </template>
  </section>
</template>

<style scoped lang="scss">
.analytics-page {
  display: grid;
  min-width: 0;
  gap: var(--space-6);
}
.analytics-page :deep(.page-header) {
  margin-bottom: 0;
}
.analytics-controls :deep(.card__content) {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: var(--space-6);
}
.analytics-controls :deep(.select) {
  width: min(100%, 16rem);
}
.analytics-controls > :deep(.card__content) > div:first-child {
  display: grid;
  gap: var(--space-1);
}
.analytics-controls strong {
  color: var(--color-text-strong);
  font-size: var(--font-size-sm);
}
.analytics-controls span,
.analytics-controls small {
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
}
.analytics-kpis,
.analytics-loading__kpis {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--space-4);
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
.trend-panel,
.source-panel,
.insights-panel,
.room-type-panel {
  min-width: 0;
}
.trend-panel :deep(.card__content) {
  display: grid;
  min-width: 0;
  gap: var(--space-4);
  padding: 0 var(--space-4) var(--space-4);
}
.analytics-secondary-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(18rem, 0.8fr);
  gap: var(--space-6);
}
.insights-panel :deep(.card__content),
.room-type-panel :deep(.card__content) {
  padding: 0;
}
.insight-list {
  margin: 0;
  padding: 0;
  list-style: none;
}
.insight-list li {
  display: grid;
  grid-template-columns: 1.75rem 1fr;
  align-items: start;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-5);
  border-bottom: 1px solid var(--color-border);
}
.insight-list li:last-child {
  border-bottom: 0;
}
.insight-list span {
  display: grid;
  width: 1.75rem;
  aspect-ratio: 1;
  place-items: center;
  border-radius: var(--radius-full);
  background: var(--color-surface-subtle);
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
}
.insight-list .is-positive span {
  background: var(--color-success-soft);
  color: var(--color-success);
}
.insight-list .is-attention span {
  background: var(--color-warning-soft);
  color: var(--color-warning);
}
.insight-list p {
  margin: 0;
  color: var(--color-text);
  font-size: var(--font-size-sm);
}
.analytics-notice {
  margin: calc(var(--space-3) * -1) 0;
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface-subtle);
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
}
.analytics-loading {
  display: grid;
  gap: var(--space-6);
}
.analytics-loading__kpis span,
.analytics-loading__chart {
  display: block;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-surface-subtle);
  animation: pulse 1.2s ease-in-out infinite alternate;
}
.analytics-loading__kpis span {
  min-height: 9rem;
}
.analytics-loading__chart {
  min-height: 24rem;
}
.analytics-message {
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
@keyframes pulse {
  to {
    opacity: 0.55;
  }
}
@media (max-width: 72rem) {
  .analytics-kpis,
  .analytics-loading__kpis {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .analytics-secondary-grid {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 48rem) {
  .analytics-controls :deep(.card__content) {
    align-items: stretch;
    flex-direction: column;
  }
  .analytics-controls :deep(.select) {
    width: 100%;
  }
  .analytics-kpis,
  .analytics-loading__kpis {
    grid-template-columns: 1fr;
  }
  .trend-panel :deep(.card__content) {
    padding-inline: var(--space-2);
  }
}
@media (prefers-reduced-motion: reduce) {
  .analytics-loading__kpis span,
  .analytics-loading__chart {
    animation: none;
  }
}
</style>
