import { describe, expect, it } from 'vitest'

import {
  ALL_BOOKING_FILTERS,
  fromBookingFilterModel,
  toBookingFilterModel,
} from '@/modules/bookings/utils/bookingFilters'

const statuses = ['confirmed', 'checked-in', 'checked-out'] as const
const sources = ['Direct', 'Expedia'] as const
const roomTypes = ['Standard', 'Suite'] as const

describe('booking select filter models', () => {
  it('moves from all to a concrete status and back to all', () => {
    expect(toBookingFilterModel(null)).toBe(ALL_BOOKING_FILTERS)
    expect(fromBookingFilterModel('confirmed', statuses)).toBe('confirmed')
    expect(fromBookingFilterModel(ALL_BOOKING_FILTERS, statuses)).toBeNull()
  })

  it('uses the same explicit all state for source and room type', () => {
    expect(fromBookingFilterModel(ALL_BOOKING_FILTERS, sources)).toBeNull()
    expect(fromBookingFilterModel(ALL_BOOKING_FILTERS, roomTypes)).toBeNull()
    expect(fromBookingFilterModel('Expedia', sources)).toBe('Expedia')
    expect(fromBookingFilterModel('Suite', roomTypes)).toBe('Suite')
  })
})
