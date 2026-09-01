import { describe, expect, it } from 'vitest'

import { compareMetric } from '@/modules/analytics/utils/metricComparison'

describe('metric comparison', () => {
  it('reports an increase', () => {
    expect(compareMetric(120, 100)).toMatchObject({
      direction: 'up',
      absoluteChange: 20,
      percentageChange: 0.2,
    })
  })

  it('reports a decrease', () => {
    expect(compareMetric(80, 100)).toMatchObject({
      direction: 'down',
      absoluteChange: -20,
      percentageChange: -0.2,
    })
  })

  it('normalizes floating-point noise to flat', () => {
    expect(compareMetric(0.1 + 0.2, 0.3)).toMatchObject({
      direction: 'flat',
      absoluteChange: 0,
      percentageChange: 0,
    })
  })

  it('does not invent a percentage when previous is zero', () => {
    expect(compareMetric(10, 0)).toMatchObject({ direction: 'up', percentageChange: null })
  })

  it('treats two zero values as flat', () => {
    expect(compareMetric(0, 0)).toMatchObject({ direction: 'flat', percentageChange: 0 })
  })

  it('represents an unavailable previous period', () => {
    expect(compareMetric(10, null)).toEqual({
      current: 10,
      previous: null,
      absoluteChange: null,
      percentageChange: null,
      direction: 'unavailable',
    })
  })
})
