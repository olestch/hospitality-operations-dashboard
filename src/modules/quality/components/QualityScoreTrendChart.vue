<script setup lang="ts">
import type { ApexAxisChartSeries, ApexOptions } from 'apexcharts'
import { computed, defineAsyncComponent } from 'vue'

import type { QualityTrendPoint } from '@/modules/quality/utils/qualityMetrics'
import EmptyState from '@/shared/ui/EmptyState.vue'

const props = defineProps<{ points: readonly QualityTrendPoint[] }>()
const VueApexCharts = defineAsyncComponent(() => import('vue3-apexcharts'))
const dateFormatter = new Intl.DateTimeFormat('en', {
  month: 'short',
  day: 'numeric',
  timeZone: 'UTC',
})
const categories = computed(() =>
  props.points.map((point) => dateFormatter.format(new Date(`${point.date}T00:00:00Z`))),
)
const series = computed<ApexAxisChartSeries>(() => [
  { name: 'Inspection score', data: props.points.map((point) => point.score) },
])
const options = computed<ApexOptions>(() => ({
  chart: { toolbar: { show: false }, animations: { enabled: false }, fontFamily: 'inherit' },
  colors: ['#2563eb'],
  stroke: { curve: 'straight', width: 2 },
  markers: { size: 4 },
  dataLabels: { enabled: false },
  grid: { borderColor: '#e5e7eb', strokeDashArray: 3 },
  xaxis: { categories: categories.value, labels: { style: { colors: '#64748b' } } },
  yaxis: {
    min: 0,
    max: 100,
    tickAmount: 5,
    labels: { formatter: (value) => `${Math.round(value)}` },
  },
  tooltip: { y: { formatter: (value) => `${Math.round(value)} / 100` } },
}))
</script>

<template>
  <VueApexCharts
    v-if="points.length"
    type="line"
    height="280"
    :options="options"
    :series="series"
  />
  <EmptyState
    v-else
    title="No completed scores"
    description="Completed inspections will appear here."
  />
</template>
