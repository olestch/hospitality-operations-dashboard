import { describe, expect, it } from 'vitest'

import type { HospitalityMetricKey } from '@/modules/analytics/types/revenue'
import {
  formatHospitalityMetricValue,
  getHospitalityMetricChartIdentity,
} from '@/modules/analytics/utils/hospitalityMetricFormatting'

describe('hospitality metric chart configuration', () => {
  it.each([
    ['revenue', 200, '$200'],
    ['occupancy', 0.25, '25%'],
    ['adr', 165, '$165'],
    ['revpar', 19, '$19'],
  ] as const)('formats %s values explicitly', (metric, value, expected) => {
    expect(formatHospitalityMetricValue(metric, value)).toBe(expected)
  })

  it('keeps formatting and chart identity deterministic across repeated transitions', () => {
    const transitions: readonly { metric: HospitalityMetricKey; value: number }[] = [
      { metric: 'revenue', value: 200 },
      { metric: 'occupancy', value: 0.25 },
      { metric: 'adr', value: 165 },
      { metric: 'revpar', value: 19 },
      { metric: 'occupancy', value: 0.30000000000000004 },
      { metric: 'revpar', value: 20 },
    ]

    expect(
      transitions.map(({ metric, value }) => formatHospitalityMetricValue(metric, value)),
    ).toEqual(['$200', '25%', '$165', '$19', '30%', '$20'])
    expect(transitions.map(({ metric }) => getHospitalityMetricChartIdentity(metric))).toEqual([
      'analytics-performance-trend-revenue',
      'analytics-performance-trend-occupancy',
      'analytics-performance-trend-adr',
      'analytics-performance-trend-revpar',
      'analytics-performance-trend-occupancy',
      'analytics-performance-trend-revpar',
    ])
  })
})
