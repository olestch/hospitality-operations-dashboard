import { describe, expect, it } from 'vitest'

import type { Booking } from '@/modules/bookings/types/booking'
import { validateBookingData } from '@/modules/bookings/utils/validateBookingData'
import type { Room } from '@/shared/types/property'

const propertyIds = new Set(['property-1'])
const rooms: Room[] = [
  {
    id: 'room-1',
    propertyId: 'property-1',
    name: 'Room 1',
    number: '1',
    type: 'Standard',
    capacity: 2,
    status: 'available',
  },
]
const booking: Booking = {
  id: 'booking-1',
  propertyId: 'property-1',
  roomId: 'room-1',
  guestName: 'Guest One',
  guestCount: 2,
  source: 'Direct',
  checkIn: '2025-03-08',
  checkInTime: '16:00',
  checkOut: '2025-03-12',
  checkOutTime: '11:00',
  status: 'confirmed',
  totalAmount: 500,
  paidAmount: 250,
}

describe('booking data validation', () => {
  it('accepts a valid deterministic booking interval', () => {
    expect(() => validateBookingData([booking], rooms, propertyIds)).not.toThrow()
  })

  it('rejects malformed times and dates', () => {
    expect(() =>
      validateBookingData(
        [{ ...booking, checkInTime: '25:00' as Booking['checkInTime'] }],
        rooms,
        propertyIds,
      ),
    ).toThrow('invalid check-in time')
    expect(() =>
      validateBookingData([{ ...booking, checkOut: '2025-02-30' }], rooms, propertyIds),
    ).toThrow('invalid check-out date')
  })

  it('rejects duplicate IDs and invalid stay intervals', () => {
    expect(() => validateBookingData([booking, booking], rooms, propertyIds)).toThrow('duplicated')
    expect(() =>
      validateBookingData(
        [{ ...booking, checkOut: booking.checkIn, checkOutTime: '18:00' }],
        rooms,
        propertyIds,
      ),
    ).toThrow('at least one night')
  })

  it('rejects actual local-time overlaps in the same room', () => {
    const nextBooking: Booking = {
      ...booking,
      id: 'booking-2',
      checkIn: booking.checkOut,
      checkInTime: '10:00',
      checkOut: '2025-03-14',
      checkOutTime: '11:00',
    }
    expect(() => validateBookingData([booking, nextBooking], rooms, propertyIds)).toThrow(
      'overlaps',
    )
  })
})
