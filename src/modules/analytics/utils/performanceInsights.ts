import type { HospitalityMetricKey } from '@/modules/analytics/types/revenue'
import type {
  PeriodPerformance,
  RevenueSourcePerformance,
  RoomTypePerformance,
} from '@/modules/analytics/utils/hospitalityMetrics'
import type { MetricComparison } from '@/modules/analytics/utils/metricComparison'

export type PerformanceComparisons = Record<HospitalityMetricKey, MetricComparison>

export interface PerformanceInsight {
  id: string
  message: string
  tone: 'neutral' | 'positive' | 'attention'
}

export function generatePerformanceInsights(
  current: PeriodPerformance,
  previous: PeriodPerformance | null,
  comparisons: PerformanceComparisons,
  sources: readonly RevenueSourcePerformance[],
  roomTypes: readonly RoomTypePerformance[],
): PerformanceInsight[] {
  const insights: PerformanceInsight[] = []
  const occupancyChange = comparisons.occupancy.absoluteChange

  if (occupancyChange !== null && Math.abs(occupancyChange) >= 0.05) {
    insights.push({
      id: 'occupancy-change',
      message: `Occupancy ${occupancyChange > 0 ? 'increased' : 'decreased'} by ${Math.abs(occupancyChange * 100).toFixed(1)} percentage points versus the previous period.`,
      tone: occupancyChange > 0 ? 'positive' : 'attention',
    })
  }

  if (
    comparisons.adr.direction !== 'unavailable' &&
    comparisons.occupancy.direction !== 'unavailable' &&
    comparisons.adr.direction !== 'flat' &&
    comparisons.occupancy.direction !== 'flat' &&
    comparisons.adr.direction !== comparisons.occupancy.direction
  ) {
    insights.push({
      id: 'adr-occupancy-divergence',
      message: `ADR ${comparisons.adr.direction === 'up' ? 'increased' : 'decreased'} while occupancy ${comparisons.occupancy.direction === 'up' ? 'increased' : 'decreased'}.`,
      tone: 'neutral',
    })
  }

  if (
    previous &&
    comparisons.revenue.direction === 'up' &&
    current.occupiedRoomNights > previous.occupiedRoomNights
  ) {
    insights.push({
      id: 'revenue-and-volume',
      message: 'Revenue and occupied room-nights both increased versus the previous period.',
      tone: 'positive',
    })
  }

  const leadingSource = sources[0]
  if (leadingSource && leadingSource.share >= 0.55) {
    insights.push({
      id: 'source-concentration',
      message: `${leadingSource.source} represents ${(leadingSource.share * 100).toFixed(1)}% of attributed booking revenue.`,
      tone: 'attention',
    })
  }

  const lowRoomType = roomTypes
    .filter((roomType) => roomType.sellableRoomNights > 0)
    .sort((first, second) => first.occupancy - second.occupancy)[0]
  if (lowRoomType && current.occupancy - lowRoomType.occupancy >= 0.15) {
    insights.push({
      id: 'room-type-gap',
      message: `${lowRoomType.roomType} occupancy is ${((current.occupancy - lowRoomType.occupancy) * 100).toFixed(1)} percentage points below the property average.`,
      tone: 'attention',
    })
  }

  return insights.length
    ? insights.slice(0, 4)
    : [
        {
          id: 'stable-performance',
          message: 'No material performance shifts were detected for the selected period.',
          tone: 'neutral',
        },
      ]
}
