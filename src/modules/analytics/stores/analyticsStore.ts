import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'

import { usePropertyStore } from '@/app/stores/propertyStore'
import { getRevenueMetrics } from '@/modules/analytics/api/revenueRepository'
import type { HospitalityMetricKey, RevenueMetric } from '@/modules/analytics/types/revenue'
import {
  getPreviousComparablePeriod,
  resolveAnalyticsPeriod,
  type AnalyticsPeriodPreset,
} from '@/modules/analytics/utils/analyticsPeriods'
import {
  aggregatePeriodPerformance,
  calculateRevenueBySource,
  calculateRoomTypePerformance,
  getDailyMetrics,
  getHospitalityMetricValue,
} from '@/modules/analytics/utils/hospitalityMetrics'
import { compareMetric, type MetricComparison } from '@/modules/analytics/utils/metricComparison'
import {
  generatePerformanceInsights,
  type PerformanceComparisons,
} from '@/modules/analytics/utils/performanceInsights'
import { getBookings } from '@/modules/bookings/api/bookingsRepository'
import type { Booking } from '@/modules/bookings/types/booking'
import { DEMO_DATE, DEMO_PERIOD } from '@/mocks/demoPeriod'
import { getRooms } from '@/shared/api/propertiesRepository'
import type { Room } from '@/shared/types/property'
import type { RequestStatus } from '@/shared/types/request'

export type AnalyticsKpiFormat = 'currency' | 'percentage'

export interface AnalyticsKpi {
  key: HospitalityMetricKey
  label: string
  format: AnalyticsKpiFormat
  comparison: MetricComparison
}

const KPI_DEFINITIONS: readonly Omit<AnalyticsKpi, 'comparison'>[] = [
  { key: 'revenue', label: 'Revenue', format: 'currency' },
  { key: 'occupancy', label: 'Occupancy', format: 'percentage' },
  { key: 'adr', label: 'ADR', format: 'currency' },
  { key: 'revpar', label: 'RevPAR', format: 'currency' },
]

export const useAnalyticsStore = defineStore('analytics', () => {
  const propertyStore = usePropertyStore()
  const status = ref<RequestStatus>('idle')
  const error = ref<string | null>(null)
  const rooms = ref<Room[]>([])
  const bookings = ref<Booking[]>([])
  const revenueMetrics = ref<RevenueMetric[]>([])
  const selectedPeriod = ref<AnalyticsPeriodPreset>('last-30-days')
  const selectedMetric = ref<HospitalityMetricKey>('revenue')
  let latestRequest = 0

  const period = computed(() =>
    resolveAnalyticsPeriod(selectedPeriod.value, DEMO_DATE, DEMO_PERIOD),
  )
  const previousRange = computed(() => getPreviousComparablePeriod(period.value, DEMO_PERIOD))
  const currentPerformance = computed(() =>
    aggregatePeriodPerformance(revenueMetrics.value, period.value.range),
  )
  const previousPerformance = computed(() =>
    previousRange.value
      ? aggregatePeriodPerformance(revenueMetrics.value, previousRange.value)
      : null,
  )
  const comparisons = computed<PerformanceComparisons | null>(() => {
    const current = currentPerformance.value
    if (!current) return null
    const previous = previousPerformance.value
    return {
      revenue: compareMetric(current.revenue, previous?.revenue ?? null),
      occupancy: compareMetric(current.occupancy, previous?.occupancy ?? null),
      adr: compareMetric(current.adr, previous?.adr ?? null),
      revpar: compareMetric(current.revpar, previous?.revpar ?? null),
    }
  })
  const kpis = computed<AnalyticsKpi[]>(() => {
    if (!comparisons.value) return []
    return KPI_DEFINITIONS.map((definition) => ({
      ...definition,
      comparison: comparisons.value?.[definition.key] ?? compareMetric(0, null),
    }))
  })
  const trend = computed(() => getDailyMetrics(revenueMetrics.value, period.value.range))
  const sourceComposition = computed(() =>
    calculateRevenueBySource(rooms.value, bookings.value, period.value.range),
  )
  const roomTypePerformance = computed(() =>
    calculateRoomTypePerformance(rooms.value, bookings.value, period.value.range),
  )
  const insights = computed(() => {
    if (!currentPerformance.value || !comparisons.value) return []
    return generatePerformanceInsights(
      currentPerformance.value,
      previousPerformance.value,
      comparisons.value,
      sourceComposition.value,
      roomTypePerformance.value,
    )
  })
  const selectedMetricValue = computed(() =>
    currentPerformance.value
      ? getHospitalityMetricValue(currentPerformance.value, selectedMetric.value)
      : null,
  )
  const hasData = computed(() => rooms.value.length > 0 && currentPerformance.value !== null)
  const hasPeriodActivity = computed(
    () =>
      (currentPerformance.value?.occupiedRoomNights ?? 0) > 0 ||
      (currentPerformance.value?.revenue ?? 0) > 0,
  )

  async function load(propertyId: string): Promise<void> {
    const requestId = ++latestRequest
    status.value = 'loading'
    error.value = null

    try {
      const [nextRooms, nextBookings, nextRevenueMetrics] = await Promise.all([
        getRooms(propertyId),
        getBookings({ propertyId, dateFrom: DEMO_PERIOD.start, dateTo: DEMO_PERIOD.end }),
        getRevenueMetrics({
          propertyId,
          period: 'day',
          dateFrom: DEMO_PERIOD.start,
          dateTo: DEMO_PERIOD.end,
        }),
      ])
      if (requestId !== latestRequest) return
      rooms.value = nextRooms
      bookings.value = nextBookings
      revenueMetrics.value = nextRevenueMetrics
      status.value = 'success'
    } catch (reason: unknown) {
      if (requestId !== latestRequest) return
      error.value = reason instanceof Error ? reason.message : 'Unable to load analytics data'
      status.value = 'failure'
    }
  }

  async function retry(): Promise<void> {
    if (propertyStore.selectedPropertyId) await load(propertyStore.selectedPropertyId)
  }

  watch(
    () => propertyStore.selectedPropertyId,
    (propertyId) => {
      if (propertyId) void load(propertyId)
    },
    { immediate: true },
  )

  return {
    status,
    error,
    selectedPeriod,
    selectedMetric,
    period,
    previousRange,
    currentPerformance,
    previousPerformance,
    kpis,
    trend,
    sourceComposition,
    roomTypePerformance,
    insights,
    selectedMetricValue,
    hasData,
    hasPeriodActivity,
    retry,
  }
})
