import { describe, expect, it } from 'vitest'

import {
  bookingDateTimeKey,
  formatLocalTime,
  isValidLocalTime,
  localTimeToFraction,
} from '@/modules/bookings/utils/bookingTime'

describe('deterministic booking times', () => {
  it('validates zero-padded local times without timezone parsing', () => {
    expect(isValidLocalTime('00:00')).toBe(true)
    expect(isValidLocalTime('16:30')).toBe(true)
    expect(isValidLocalTime('24:00')).toBe(false)
    expect(isValidLocalTime('9:30')).toBe(false)
    expect(isValidLocalTime('12:60')).toBe(false)
  })

  it('calculates midnight, noon, and near-end-of-day fractions', () => {
    expect(localTimeToFraction('00:00')).toBe(0)
    expect(localTimeToFraction('12:00')).toBe(0.5)
    expect(localTimeToFraction('23:59')).toBeCloseTo(1439 / 1440, 6)
  })

  it('creates sortable local datetime keys and readable labels', () => {
    expect(bookingDateTimeKey('2025-03-08', '16:00')).toBe('2025-03-08T16:00')
    expect(formatLocalTime('00:00')).toBe('12:00 AM')
    expect(formatLocalTime('16:30')).toBe('4:30 PM')
  })

  it('rejects invalid values when geometry attempts to use them', () => {
    expect(() => localTimeToFraction('25:00')).toThrow(RangeError)
  })
})
