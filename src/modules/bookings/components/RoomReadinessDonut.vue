<script setup lang="ts">
import type { ApexNonAxisChartSeries, ApexOptions } from 'apexcharts'
import { computed, defineAsyncComponent } from 'vue'

import type { HousekeepingReadinessSummary } from '@/modules/bookings/utils/housekeepingReadiness'
import { getHousekeepingPercentage } from '@/modules/bookings/utils/housekeepingReadiness'
import { CHART_THEME } from '@/shared/charts/chartTheme'
import type { HousekeepingStatus } from '@/shared/types/property'
import BaseCard from '@/shared/ui/BaseCard.vue'
import EmptyState from '@/shared/ui/EmptyState.vue'

interface ReadinessEntry {
  status: HousekeepingStatus
  label: string
  description: string
  color: string
}

const props = defineProps<{ summary: HousekeepingReadinessSummary }>()
const VueApexCharts = defineAsyncComponent(() => import('vue3-apexcharts'))
const percentageFormatter = new Intl.NumberFormat('en', {
  style: 'percent',
  maximumFractionDigits: 0,
})
const entries: readonly ReadinessEntry[] = [
  {
    status: 'inspected',
    label: 'Ready',
    description: 'Final check complete',
    color: CHART_THEME.success,
  },
  {
    status: 'cleaned',
    label: 'Cleaned',
    description: 'Awaiting final inspection',
    color: CHART_THEME.warning,
  },
  {
    status: 'dirty',
    label: 'Needs cleaning',
    description: 'Housekeeping attention required',
    color: CHART_THEME.danger,
  },
]
const series = computed<ApexNonAxisChartSeries>(() =>
  entries.map((entry) => props.summary.counts[entry.status]),
)
const chartIdentity = computed(() => `bookings-room-readiness-${series.value.join('-')}`)
const accessibleSummary = computed(() =>
  entries.map((entry) => `${entry.label}: ${props.summary.counts[entry.status]}`).join(', '),
)
const options = computed<ApexOptions>(() => ({
  chart: {
    id: chartIdentity.value,
    animations: { enabled: false },
    fontFamily: 'inherit',
    sparkline: { enabled: true },
  },
  colors: entries.map((entry) => entry.color),
  dataLabels: { enabled: false },
  labels: entries.map((entry) => entry.label),
  legend: { show: false },
  plotOptions: {
    pie: {
      expandOnClick: false,
      donut: {
        size: '68%',
        labels: {
          show: true,
          name: { show: false },
          value: { show: false },
          total: {
            show: true,
            showAlways: true,
            label: 'Rooms',
            color: CHART_THEME.text,
            fontSize: '12px',
            formatter: () => String(props.summary.totalRooms),
          },
        },
      },
    },
  },
  states: {
    hover: { filter: { type: 'none' } },
    active: { filter: { type: 'none' } },
  },
  stroke: { colors: [CHART_THEME.surface], width: 3 },
  tooltip: {
    y: { formatter: (value: number) => `${value} room${value === 1 ? '' : 's'}` },
  },
}))

function formatPercentage(count: number): string {
  return percentageFormatter.format(getHousekeepingPercentage(count, props.summary.totalRooms))
}
</script>

<template>
  <BaseCard class="readiness-card">
    <figure v-if="summary.totalRooms" class="readiness-figure">
      <figcaption class="readiness-card__heading">
        <div>
          <h2>Room readiness</h2>
          <p>Housekeeping status across operational rooms</p>
          <span class="sr-only">
            {{ accessibleSummary }}. Maintenance and out-of-service rooms are excluded.
          </span>
        </div>
        <span>{{ summary.totalRooms }} represented</span>
      </figcaption>
      <div class="readiness-figure__chart" aria-hidden="true">
        <VueApexCharts
          :key="chartIdentity"
          type="donut"
          width="154"
          height="154"
          :options="options"
          :series="series"
        />
      </div>
      <ul class="readiness-legend">
        <li v-for="entry in entries" :key="entry.status">
          <span
            class="readiness-legend__marker"
            :style="{ backgroundColor: entry.color }"
            aria-hidden="true"
          />
          <span class="readiness-legend__label">
            <strong>{{ entry.label }}</strong>
            <small>{{ entry.description }}</small>
          </span>
          <span class="readiness-legend__value">
            <strong>{{ summary.counts[entry.status] }}</strong>
            <small>{{ formatPercentage(summary.counts[entry.status]) }}</small>
          </span>
        </li>
      </ul>
    </figure>
    <div v-else class="readiness-empty">
      <div class="readiness-card__heading">
        <div>
          <h2>Room readiness</h2>
          <p>Housekeeping status across operational rooms</p>
        </div>
        <span>0 represented</span>
      </div>
      <EmptyState
        title="No operational rooms"
        description="Maintenance and out-of-service rooms are excluded from readiness."
      />
    </div>
  </BaseCard>
</template>

<style scoped lang="scss">
.readiness-card {
  min-width: 0;
}
.readiness-card :deep(.card__content) {
  padding: var(--space-3) var(--space-5);
}
.readiness-card__heading {
  display: flex;
  min-width: 0;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-4);
}
.readiness-card__heading h2 {
  margin: 0;
  color: var(--color-text-strong);
  font-size: var(--font-size-md);
}
.readiness-card__heading p {
  margin: var(--space-1) 0 0;
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
}
.readiness-card__heading > span {
  flex: 0 0 auto;
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
}
.readiness-figure {
  display: grid;
  grid-template-columns: minmax(13rem, 0.7fr) 9rem minmax(18rem, 1fr);
  align-items: center;
  gap: var(--space-4);
  margin: 0;
}
.readiness-figure > .readiness-card__heading {
  display: grid;
}
.readiness-figure__chart {
  display: grid;
  min-width: 0;
  place-items: center;
}
.readiness-legend {
  display: grid;
  margin: 0;
  padding: 0;
  list-style: none;
}
.readiness-legend li {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: var(--space-3);
  min-width: 0;
  padding: var(--space-2) 0;
  border-bottom: 1px solid var(--color-border);
}
.readiness-legend li:last-child {
  border-bottom: 0;
}
.readiness-legend__marker {
  width: 0.625rem;
  height: 0.625rem;
  border-radius: var(--radius-full);
}
.readiness-legend__label,
.readiness-legend__value {
  display: grid;
  min-width: 0;
}
.readiness-legend__label strong,
.readiness-legend__value strong {
  color: var(--color-text-strong);
  font-size: var(--font-size-sm);
}
.readiness-legend small {
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
}
.readiness-legend__value {
  justify-items: end;
}
.readiness-empty {
  display: grid;
  gap: var(--space-4);
}
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}
@media (max-width: 64rem) {
  .readiness-figure {
    grid-template-columns: minmax(11rem, 0.65fr) 8.5rem minmax(16rem, 1fr);
  }
}
@media (max-width: 48rem) {
  .readiness-figure {
    grid-template-columns: 1fr;
    gap: var(--space-2);
  }
  .readiness-card :deep(.card__content) {
    padding: var(--space-3) var(--space-4);
  }
}
</style>
