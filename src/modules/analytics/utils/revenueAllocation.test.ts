import { describe, expect, it } from 'vitest'

import type { Booking } from '@/modules/bookings/types/booking'
import { allocateBookingRevenue } from '@/modules/analytics/utils/revenueAllocation'

const booking: Booking = {
  id: 'booking-test',
  propertyId: 'property-test',
  roomId: 'room-1',
  guestName: 'Test Guest',
  guestCount: 2,
  source: 'Direct',
  checkIn: '2025-03-08',
  checkInTime: '15:00',
  checkOut: '2025-03-12',
  checkOutTime: '11:00',
  status: 'confirmed',
  totalAmount: 800,
  paidAmount: 800,
}

describe('stay-night revenue allocation', () => {
  it('allocates the full amount when the booking is fully inside the period', () => {
    expect(allocateBookingRevenue(booking, { start: '2025-03-08', end: '2025-03-11' })).toEqual({
      occupiedNights: 4,
      totalNights: 4,
      revenue: 800,
    })
  })

  it('allocates only nights overlapping the period start', () => {
    expect(
      allocateBookingRevenue(booking, { start: '2025-03-10', end: '2025-03-11' }).revenue,
    ).toBe(400)
  })

  it('allocates only nights overlapping the period end', () => {
    expect(
      allocateBookingRevenue(booking, { start: '2025-03-08', end: '2025-03-09' }).revenue,
    ).toBe(400)
  })

  it('allocates a booking that spans the entire selected period', () => {
    expect(
      allocateBookingRevenue(booking, { start: '2025-03-09', end: '2025-03-10' }),
    ).toMatchObject({ occupiedNights: 2, revenue: 400 })
  })

  it('keeps a one-night booking attributable', () => {
    const oneNight = { ...booking, checkIn: '2025-03-10', checkOut: '2025-03-11', totalAmount: 175 }
    expect(
      allocateBookingRevenue(oneNight, { start: '2025-03-10', end: '2025-03-10' }),
    ).toMatchObject({ occupiedNights: 1, totalNights: 1, revenue: 175 })
  })

  it('excludes the checkout day', () => {
    expect(
      allocateBookingRevenue(booking, { start: booking.checkOut, end: booking.checkOut }).revenue,
    ).toBe(0)
  })

  it('allocates no revenue from a cancelled booking', () => {
    expect(
      allocateBookingRevenue(
        { ...booking, status: 'cancelled' },
        { start: '2025-03-08', end: '2025-03-11' },
      ).revenue,
    ).toBe(0)
  })

  it('preserves the total amount when daily allocations are recombined', () => {
    const dates = ['2025-03-08', '2025-03-09', '2025-03-10', '2025-03-11']
    const total = dates.reduce(
      (sum, date) => sum + allocateBookingRevenue(booking, { start: date, end: date }).revenue,
      0,
    )
    expect(total).toBeCloseTo(booking.totalAmount)
  })

  it('keeps room-night revenue independent from arrival and departure times', () => {
    const adjustedTimes: Booking = {
      ...booking,
      checkInTime: '00:00',
      checkOutTime: '23:59',
    }
    const range = { start: '2025-03-09', end: '2025-03-10' }

    expect(allocateBookingRevenue(adjustedTimes, range)).toEqual(
      allocateBookingRevenue(booking, range),
    )
  })
})
