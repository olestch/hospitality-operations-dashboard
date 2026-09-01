<script setup lang="ts">
import type { ApexAxisChartSeries, ApexOptions } from 'apexcharts'
import { computed, defineAsyncComponent } from 'vue'

import type { RevenueSourcePerformance } from '@/modules/analytics/utils/hospitalityMetrics'
import { DEMO_CURRENCY } from '@/mocks/demoPeriod'

const props = defineProps<{ sources: readonly RevenueSourcePerformance[] }>()
const VueApexCharts = defineAsyncComponent(() => import('vue3-apexcharts'))
const currencyFormatter = new Intl.NumberFormat('en', {
  style: 'currency',
  currency: DEMO_CURRENCY,
  maximumFractionDigits: 0,
})
const percentageFormatter = new Intl.NumberFormat('en', {
  style: 'percent',
  maximumFractionDigits: 1,
})
const series = computed<ApexAxisChartSeries>(() => [
  { name: 'Attributed revenue', data: props.sources.map((source) => source.revenue) },
])
const options = computed<ApexOptions>(() => ({
  chart: {
    id: 'analytics-revenue-source',
    toolbar: { show: false },
    animations: { enabled: false },
    fontFamily: 'inherit',
  },
  colors: ['#216354'],
  dataLabels: { enabled: false },
  grid: { borderColor: '#dfe4e2', strokeDashArray: 4 },
  plotOptions: { bar: { horizontal: true, borderRadius: 3, barHeight: '52%' } },
  tooltip: { y: { formatter: (value: number) => currencyFormatter.format(value) } },
  xaxis: {
    categories: props.sources.map((source) => source.source),
    labels: {
      formatter: (value: string) => currencyFormatter.format(Number(value)),
      style: { colors: '#6d7773' },
    },
  },
  yaxis: { labels: { style: { colors: '#34403b' } } },
}))
</script>

<template>
  <figure class="source-chart" aria-labelledby="source-chart-caption">
    <figcaption id="source-chart-caption">
      Attributed booking revenue by source. Amounts are allocated by occupied stay nights.
    </figcaption>
    <VueApexCharts type="bar" height="250" :options="options" :series="series" />
    <dl class="source-chart__values">
      <div v-for="source in sources" :key="source.source">
        <dt>{{ source.source }}</dt>
        <dd>
          {{ currencyFormatter.format(source.revenue) }} ·
          {{ percentageFormatter.format(source.share) }}
        </dd>
      </div>
    </dl>
  </figure>
</template>

<style scoped lang="scss">
.source-chart {
  min-width: 0;
  margin: 0;
}
.source-chart figcaption {
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
}
.source-chart__values {
  display: grid;
  gap: var(--space-2);
  margin: var(--space-3) 0 0;
}
.source-chart__values div {
  display: flex;
  justify-content: space-between;
  gap: var(--space-3);
  font-size: var(--font-size-xs);
}
.source-chart__values dt {
  color: var(--color-text);
}
.source-chart__values dd {
  margin: 0;
  color: var(--color-text-muted);
  text-align: right;
}
</style>
