import { describe, expect, it } from 'vitest'

import type { PeriodPerformance } from '@/modules/analytics/utils/hospitalityMetrics'
import { compareMetric } from '@/modules/analytics/utils/metricComparison'
import { generatePerformanceInsights } from '@/modules/analytics/utils/performanceInsights'

const current: PeriodPerformance = {
  revenue: 1200,
  occupancy: 0.7,
  adr: 150,
  revpar: 105,
  occupiedRoomNights: 8,
  sellableRoomNights: 12,
  dailyDataPoints: 2,
}
const previous: PeriodPerformance = {
  revenue: 900,
  occupancy: 0.6,
  adr: 160,
  revpar: 96,
  occupiedRoomNights: 6,
  sellableRoomNights: 10,
  dailyDataPoints: 2,
}

function comparisons(
  overrides: Partial<
    Record<'revenue' | 'occupancy' | 'adr' | 'revpar', [number, number | null]>
  > = {},
) {
  return {
    revenue: compareMetric(...(overrides.revenue ?? [current.revenue, previous.revenue])),
    occupancy: compareMetric(...(overrides.occupancy ?? [current.occupancy, previous.occupancy])),
    adr: compareMetric(...(overrides.adr ?? [current.adr, previous.adr])),
    revpar: compareMetric(...(overrides.revpar ?? [current.revpar, previous.revpar])),
  }
}

describe('performance insights', () => {
  it('reports a material occupancy increase or decrease', () => {
    const insights = generatePerformanceInsights(current, previous, comparisons(), [], [])
    expect(insights.some((insight) => insight.id === 'occupancy-change')).toBe(true)
  })

  it('reports ADR and occupancy divergence without claiming causation', () => {
    const insights = generatePerformanceInsights(current, previous, comparisons(), [], [])
    expect(insights.find((insight) => insight.id === 'adr-occupancy-divergence')?.message).toBe(
      'ADR decreased while occupancy increased.',
    )
  })

  it('reports concentrated booking-source revenue', () => {
    const insights = generatePerformanceInsights(
      current,
      null,
      comparisons({
        revenue: [1200, null],
        occupancy: [0.7, null],
        adr: [150, null],
        revpar: [105, null],
      }),
      [{ source: 'Direct', revenue: 900, share: 0.75 }],
      [],
    )
    expect(insights.some((insight) => insight.id === 'source-concentration')).toBe(true)
  })

  it('uses a deterministic fallback when no rule is triggered', () => {
    const flat = { ...current, revenue: 0, occupancy: 0, adr: 0, revpar: 0, occupiedRoomNights: 0 }
    const flatComparisons = {
      revenue: compareMetric(0, 0),
      occupancy: compareMetric(0, 0),
      adr: compareMetric(0, 0),
      revpar: compareMetric(0, 0),
    }
    expect(generatePerformanceInsights(flat, flat, flatComparisons, [], [])).toEqual([
      {
        id: 'stable-performance',
        message: 'No material performance shifts were detected for the selected period.',
        tone: 'neutral',
      },
    ])
  })
})
