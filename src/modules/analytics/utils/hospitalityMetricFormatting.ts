import type { HospitalityMetricKey } from '@/modules/analytics/types/revenue'
import { DEMO_CURRENCY } from '@/mocks/demoPeriod'

const currencyFormatter = new Intl.NumberFormat('en', {
  style: 'currency',
  currency: DEMO_CURRENCY,
  maximumFractionDigits: 0,
})
const percentageFormatter = new Intl.NumberFormat('en', {
  style: 'percent',
  maximumFractionDigits: 1,
})

export function formatHospitalityMetricValue(metric: HospitalityMetricKey, value: number): string {
  return metric === 'occupancy'
    ? percentageFormatter.format(value)
    : currencyFormatter.format(value)
}

export function getHospitalityMetricChartIdentity(metric: HospitalityMetricKey): string {
  return `analytics-performance-trend-${metric}`
}
