<script setup lang="ts">
import type { ApexAxisChartSeries, ApexOptions } from 'apexcharts'
import { computed, defineAsyncComponent } from 'vue'

import { CHART_THEME } from '@/shared/charts/chartTheme'

import type { RevenueMetric } from '@/modules/analytics/types/revenue'
import { DEMO_CURRENCY } from '@/mocks/demoPeriod'

const props = defineProps<{ metrics: readonly RevenueMetric[] }>()
const VueApexCharts = defineAsyncComponent(() => import('vue3-apexcharts'))
const currencyFormatter = new Intl.NumberFormat('en', {
  style: 'currency',
  currency: DEMO_CURRENCY,
  maximumFractionDigits: 0,
})
const dateFormatter = new Intl.DateTimeFormat('en', {
  month: 'short',
  day: 'numeric',
  timeZone: 'UTC',
})

const series = computed<ApexAxisChartSeries>(() => [
  { name: 'Revenue', data: props.metrics.map((metric) => metric.revenue) },
])
const options = computed<ApexOptions>(() => ({
  chart: {
    id: 'overview-revenue',
    toolbar: { show: false },
    animations: { enabled: false },
    fontFamily: 'inherit',
  },
  colors: [CHART_THEME.primary],
  dataLabels: { enabled: false },
  grid: { borderColor: CHART_THEME.border, strokeDashArray: 4, padding: { left: 8, right: 8 } },
  markers: { size: 0, hover: { size: 4 } },
  stroke: { curve: 'smooth', width: 3 },
  tooltip: { y: { formatter: (value: number) => currencyFormatter.format(value) } },
  xaxis: {
    categories: props.metrics.map((metric) =>
      dateFormatter.format(new Date(`${metric.date}T00:00:00Z`)),
    ),
    axisBorder: { show: false },
    axisTicks: { show: false },
    labels: {
      rotate: 0,
      style: { colors: CHART_THEME.text, fontSize: '12px' },
    },
    tickAmount: 5,
  },
  yaxis: {
    labels: {
      formatter: (value: number) => currencyFormatter.format(value),
      style: { colors: CHART_THEME.text },
    },
  },
}))
</script>

<template>
  <figure class="revenue-chart" aria-labelledby="revenue-chart-title">
    <figcaption id="revenue-chart-title" class="revenue-chart__caption">
      Daily revenue for the 30 days ending on the fixed demo date.
    </figcaption>
    <VueApexCharts type="line" height="300" :options="options" :series="series" />
  </figure>
</template>

<style scoped lang="scss">
.revenue-chart {
  margin: 0;
}
.revenue-chart__caption {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}
</style>
