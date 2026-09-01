import { describe, expect, it } from 'vitest'

import {
  getPreviousComparablePeriod,
  resolveAnalyticsPeriod,
} from '@/modules/analytics/utils/analyticsPeriods'
import { DEMO_DATE, DEMO_PERIOD } from '@/mocks/demoPeriod'

describe('analytics periods', () => {
  it('resolves the last 7 days relative to the demo date', () => {
    expect(resolveAnalyticsPeriod('last-7-days', DEMO_DATE, DEMO_PERIOD)).toMatchObject({
      range: { start: '2025-03-04', end: '2025-03-10' },
      dayCount: 7,
    })
  })

  it('resolves the last 30 days relative to the demo date', () => {
    expect(resolveAnalyticsPeriod('last-30-days', DEMO_DATE, DEMO_PERIOD)).toMatchObject({
      range: { start: '2025-02-09', end: '2025-03-10' },
      dayCount: 30,
    })
  })

  it('uses the entire fixed demo period', () => {
    expect(resolveAnalyticsPeriod('full-demo-period', DEMO_DATE, DEMO_PERIOD)).toMatchObject({
      range: DEMO_PERIOD,
      dayCount: 90,
    })
  })

  it('clamps a relative period at the demo-period start', () => {
    expect(resolveAnalyticsPeriod('last-7-days', '2025-01-03', DEMO_PERIOD)).toMatchObject({
      range: { start: '2025-01-01', end: '2025-01-03' },
      dayCount: 3,
    })
  })

  it('creates an equal immediately preceding period', () => {
    const current = resolveAnalyticsPeriod('last-30-days', DEMO_DATE, DEMO_PERIOD)
    expect(getPreviousComparablePeriod(current, DEMO_PERIOD)).toEqual({
      start: '2025-01-10',
      end: '2025-02-08',
    })
  })

  it('marks comparison unavailable when a full prior period does not fit', () => {
    const current = resolveAnalyticsPeriod('full-demo-period', DEMO_DATE, DEMO_PERIOD)
    expect(getPreviousComparablePeriod(current, DEMO_PERIOD)).toBeNull()
  })
})
