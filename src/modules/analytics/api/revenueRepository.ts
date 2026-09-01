import { dataProvider } from '@/data'
import type { RevenueMetric, RevenueMetricFilters } from '@/modules/analytics/types/revenue'

export async function getRevenueMetrics(
  filters: RevenueMetricFilters = {},
): Promise<RevenueMetric[]> {
  return dataProvider.getRevenueMetrics(filters)
}
