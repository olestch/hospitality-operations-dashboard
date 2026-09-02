<script setup lang="ts">
import type { ApexAxisChartSeries, ApexOptions } from 'apexcharts'
import { computed, defineAsyncComponent } from 'vue'

import { CHART_THEME, createTemporalAreaFill } from '@/shared/charts/chartTheme'

import type { HospitalityMetricKey, RevenueMetric } from '@/modules/analytics/types/revenue'
import {
  formatHospitalityMetricValue,
  getHospitalityMetricChartIdentity,
} from '@/modules/analytics/utils/hospitalityMetricFormatting'

const props = defineProps<{
  metrics: readonly RevenueMetric[]
  metric: HospitalityMetricKey
  periodLabel: string
}>()
const VueApexCharts = defineAsyncComponent(() => import('vue3-apexcharts'))
const dateFormatter = new Intl.DateTimeFormat('en', {
  month: 'short',
  day: 'numeric',
  timeZone: 'UTC',
})
const metricLabels: Record<HospitalityMetricKey, string> = {
  revenue: 'Revenue',
  occupancy: 'Occupancy',
  adr: 'ADR',
  revpar: 'RevPAR',
}
const metricLabel = computed(() => metricLabels[props.metric])
const chartIdentity = computed(() => getHospitalityMetricChartIdentity(props.metric))
const values = computed(() =>
  props.metrics.map((metric) =>
    props.metric === 'occupancy' ? metric.occupancyRate : metric[props.metric],
  ),
)
const series = computed<ApexAxisChartSeries>(() => [
  { name: metricLabel.value, data: values.value },
])
const options = computed<ApexOptions>(() => {
  const metric = props.metric
  const formatter = (value: number): string => formatHospitalityMetricValue(metric, value)

  return {
    chart: {
      id: getHospitalityMetricChartIdentity(metric),
      toolbar: { show: false },
      animations: { enabled: false },
      fontFamily: 'inherit',
      zoom: { enabled: false },
    },
    colors: [CHART_THEME.primary],
    dataLabels: { enabled: false },
    fill: createTemporalAreaFill(),
    grid: { borderColor: CHART_THEME.border, strokeDashArray: 4, padding: { left: 8, right: 8 } },
    markers: { size: props.metrics.length <= 7 ? 3 : 0, hover: { size: 4 } },
    stroke: { curve: 'smooth', width: 2.5 },
    tooltip: { y: { formatter } },
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
      tickAmount: props.metrics.length <= 7 ? props.metrics.length - 1 : 5,
    },
    yaxis: {
      min: metric === 'occupancy' ? 0 : undefined,
      max: metric === 'occupancy' ? 1 : undefined,
      labels: { formatter, style: { colors: CHART_THEME.text } },
    },
  }
})
</script>

<template>
  <figure class="metric-chart" aria-labelledby="analytics-trend-caption">
    <figcaption id="analytics-trend-caption">
      Daily {{ metricLabel.toLowerCase() }} across {{ periodLabel.toLowerCase() }}.
      {{ metrics.length }} daily values are represented in the chart.
    </figcaption>
    <VueApexCharts
      :key="chartIdentity"
      type="area"
      height="340"
      :options="options"
      :series="series"
    />
  </figure>
</template>

<style scoped lang="scss">
.metric-chart {
  min-width: 0;
  margin: 0;
}
.metric-chart figcaption {
  margin: 0 0 var(--space-3);
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
}
</style>
