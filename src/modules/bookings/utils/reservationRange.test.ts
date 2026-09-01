import { describe, expect, it } from 'vitest'

import {
  createRangeStarts,
  createVisibleRange,
  getAdjacentRangeStart,
} from '@/modules/bookings/utils/reservationRange'
import { DEMO_PERIOD } from '@/mocks/demoPeriod'

const rangeStarts = createRangeStarts({
  period: DEMO_PERIOD,
  preferredStart: '2025-02-25',
  visibleDayCount: 28,
})

describe('reservation range navigation', () => {
  it('creates predictable logical starts including clamped boundaries', () => {
    expect(rangeStarts).toEqual(['2025-01-01', '2025-01-28', '2025-02-25', '2025-03-04'])
  })

  it('moves forward and backward between logical ranges', () => {
    expect(getAdjacentRangeStart('2025-01-28', 1, rangeStarts)).toBe('2025-02-25')
    expect(getAdjacentRangeStart('2025-02-25', -1, rangeStarts)).toBe('2025-01-28')
  })

  it('clamps the final range to the demo-period end', () => {
    const finalStart = getAdjacentRangeStart('2025-02-25', 1, rangeStarts)
    expect(finalStart).toBe('2025-03-04')
    expect(createVisibleRange(finalStart, 28).end).toBe(DEMO_PERIOD.end)
    expect(getAdjacentRangeStart(finalStart, 1, rangeStarts)).toBe(finalStart)
  })

  it('returns to the previous logical range after the clamped final range', () => {
    expect(getAdjacentRangeStart('2025-03-04', -1, rangeStarts)).toBe('2025-02-25')
  })

  it('does not move before the demo-period start', () => {
    expect(getAdjacentRangeStart(DEMO_PERIOD.start, -1, rangeStarts)).toBe(DEMO_PERIOD.start)
  })
})
