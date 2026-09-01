import { describe, expect, it } from 'vitest'

import type { Booking } from '@/modules/bookings/types/booking'
import {
  bookingOverlapsRange,
  calculateReservationSummary,
  filterReservationData,
  generateVisibleDays,
  getBookingSpan,
  groupDaysByMonth,
  type DateRange,
} from '@/modules/bookings/utils/reservationTimeline'
import type { Room } from '@/shared/types/property'

const range: DateRange = { start: '2025-02-25', end: '2025-03-05' }
const booking: Booking = {
  id: 'booking-1',
  propertyId: 'property-1',
  roomId: 'room-1',
  guestName: 'Guest One',
  guestCount: 2,
  source: 'Direct',
  checkIn: '2025-02-27',
  checkOut: '2025-03-03',
  status: 'confirmed',
  totalAmount: 500,
  paidAmount: 250,
}
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
  {
    id: 'room-2',
    propertyId: 'property-1',
    name: 'Room 2',
    number: '2',
    type: 'Suite',
    capacity: 3,
    status: 'maintenance',
  },
]

describe('reservation timeline dates', () => {
  it('generates every visible day inclusively', () => {
    const days = generateVisibleDays({ start: '2025-03-01', end: '2025-03-03' }, '2025-03-02')
    expect(days.map((day) => day.date)).toEqual(['2025-03-01', '2025-03-02', '2025-03-03'])
    expect(days[1]?.isDemoDate).toBe(true)
  })

  it('groups days across month boundaries', () => {
    const groups = groupDaysByMonth(generateVisibleDays(range, '2025-03-01'))
    expect(groups.map(({ key, span }) => ({ key, span }))).toEqual([
      { key: '2025-02', span: 4 },
      { key: '2025-03', span: 5 },
    ])
  })
})

describe('booking geometry', () => {
  it('places a booking fully inside the range with checkout-exclusive span', () => {
    expect(getBookingSpan(booking, range)).toMatchObject({
      startColumn: 3,
      span: 4,
      clippedAtStart: false,
      clippedAtEnd: false,
    })
  })

  it('clips a booking at range start', () => {
    expect(getBookingSpan({ ...booking, checkIn: '2025-02-20' }, range)).toMatchObject({
      startColumn: 1,
      span: 6,
      clippedAtStart: true,
    })
  })

  it('clips a booking at range end', () => {
    expect(getBookingSpan({ ...booking, checkOut: '2025-03-10' }, range)).toMatchObject({
      startColumn: 3,
      span: 7,
      clippedAtEnd: true,
    })
  })

  it('rejects a booking completely outside the range', () => {
    const outside = { ...booking, checkIn: '2025-03-06', checkOut: '2025-03-08' }
    expect(bookingOverlapsRange(outside, range)).toBe(false)
    expect(getBookingSpan(outside, range)).toBeNull()
  })

  it('excludes cancelled bookings from occupancy', () => {
    expect(getBookingSpan({ ...booking, status: 'cancelled' }, range)).toBeNull()
  })
})

describe('reservation filters and summary', () => {
  it('combines status, source, and room type filters', () => {
    const second = {
      ...booking,
      id: 'booking-2',
      roomId: 'room-2',
      source: 'Expedia' as const,
      status: 'checked-in' as const,
    }
    const result = filterReservationData(rooms, [booking, second], {
      status: 'confirmed',
      source: 'Direct',
      roomType: 'Standard',
    })
    expect(result.rooms.map((room) => room.id)).toEqual(['room-1'])
    expect(result.bookings.map((item) => item.id)).toEqual(['booking-1'])
  })

  it('excludes unavailable rooms from the occupancy denominator', () => {
    const summary = calculateReservationSummary(rooms, [booking], range)
    expect(summary.sellableRoomDays).toBe(9)
    expect(summary.occupiedRoomDays).toBe(4)
    expect(summary.occupancyRate).toBeCloseTo(4 / 9)
  })
})
