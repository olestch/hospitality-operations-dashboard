import { describe, expect, it } from 'vitest'

import type { Booking } from '@/modules/bookings/types/booking'
import {
  bookingOverlapsRange,
  bookingVisuallyOverlapsRange,
  bookingsConflict,
  calculateReservationSummary,
  createReservationViewData,
  filterReservationData,
  findBookingConflicts,
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
  checkInTime: '16:00',
  checkOut: '2025-03-03',
  checkOutTime: '11:00',
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
      startFraction: 2 / 3,
      endFraction: 11 / 24,
      startOffset: 2 + 2 / 3,
      endOffset: 6 + 11 / 24,
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

  it('shows the partial checkout day at the range start without adding an occupied night', () => {
    const departing = { ...booking, checkIn: '2025-02-20', checkOut: range.start }
    expect(bookingOverlapsRange(departing, range)).toBe(false)
    expect(bookingVisuallyOverlapsRange(departing, range)).toBe(true)
    expect(getBookingSpan(departing, range)).toMatchObject({
      startOffset: 0,
      endOffset: 11 / 24,
      span: 0,
      clippedAtStart: true,
    })
    expect(calculateReservationSummary([rooms[0]!], [departing], range).occupiedRoomDays).toBe(0)
  })

  it('places bookings that start at either visible boundary', () => {
    expect(getBookingSpan({ ...booking, checkIn: range.start }, range)).toMatchObject({
      startColumn: 1,
    })
    expect(
      getBookingSpan({ ...booking, checkIn: range.end, checkOut: '2025-03-06' }, range),
    ).toMatchObject({ startColumn: 9, span: 1 })
  })

  it('includes the final visible night when checkout is the day after the range', () => {
    expect(
      getBookingSpan({ ...booking, checkIn: '2025-03-03', checkOut: '2025-03-06' }, range),
    ).toMatchObject({ startColumn: 7, span: 3, clippedAtEnd: true, endOffset: 9 })
  })

  it('keeps a one-night booking visible', () => {
    expect(
      getBookingSpan({ ...booking, checkIn: '2025-03-01', checkOut: '2025-03-02' }, range),
    ).toMatchObject({ startColumn: 5, span: 1 })
  })

  it('clips a booking spanning both visible boundaries', () => {
    expect(
      getBookingSpan({ ...booking, checkIn: '2025-02-20', checkOut: '2025-03-10' }, range),
    ).toMatchObject({
      startColumn: 1,
      span: 9,
      clippedAtStart: true,
      clippedAtEnd: true,
    })
  })

  it('uses proportional midnight, noon, and near-end-of-day boundaries', () => {
    expect(
      getBookingSpan(
        {
          ...booking,
          checkIn: range.start,
          checkInTime: '00:00',
          checkOut: '2025-02-26',
          checkOutTime: '12:00',
        },
        range,
      ),
    ).toMatchObject({ startOffset: 0, endOffset: 1.5, width: 1.5 })
    expect(
      getBookingSpan(
        {
          ...booking,
          checkIn: range.start,
          checkInTime: '23:59',
          checkOut: '2025-02-26',
          checkOutTime: '12:00',
        },
        range,
      )?.startOffset,
    ).toBeCloseTo(1439 / 1440, 6)
  })

  it('clips visual geometry to the full visible range', () => {
    expect(
      getBookingSpan(
        {
          ...booking,
          checkIn: '2025-02-20',
          checkOut: '2025-03-10',
        },
        range,
      ),
    ).toMatchObject({ startOffset: 0, endOffset: 9, width: 9 })
  })

  it('treats a reversed range as empty', () => {
    const reversedRange = { start: '2025-03-05', end: '2025-03-01' }
    expect(generateVisibleDays(reversedRange, '2025-03-03')).toEqual([])
    expect(bookingOverlapsRange(booking, reversedRange)).toBe(false)
    expect(calculateReservationSummary(rooms, [booking], reversedRange)).toMatchObject({
      activeBookings: 0,
      occupancyRate: 0,
      arrivals: 0,
      departures: 0,
    })
  })
})

describe('booking conflicts', () => {
  it('detects overlapping active bookings in the same room', () => {
    const overlapping = { ...booking, id: 'booking-2', checkIn: '2025-03-01' }
    expect(bookingsConflict(booking, overlapping)).toBe(true)
    expect(findBookingConflicts([booking, overlapping])).toEqual([
      { first: booking, second: overlapping },
    ])
  })

  it('allows adjacent, cancelled, and different-room bookings', () => {
    expect(
      bookingsConflict(booking, { ...booking, id: 'adjacent', checkIn: booking.checkOut }),
    ).toBe(false)
    expect(bookingsConflict(booking, { ...booking, id: 'cancelled', status: 'cancelled' })).toBe(
      false,
    )
    expect(bookingsConflict(booking, { ...booking, id: 'other-room', roomId: 'room-2' })).toBe(
      false,
    )
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

  it('deduplicates occupied room-days and never exceeds full occupancy', () => {
    const overlapping = { ...booking, id: 'booking-2', checkIn: '2025-03-01' }
    const summary = calculateReservationSummary([rooms[0]!], [booking, overlapping], range)
    expect(summary.occupiedRoomDays).toBe(4)
    expect(summary.occupancyRate).toBeLessThanOrEqual(1)
  })

  it('returns zero occupancy when no rooms are sellable', () => {
    const summary = calculateReservationSummary([rooms[1]!], [booking], range)
    expect(summary.sellableRoomDays).toBe(0)
    expect(summary.occupancyRate).toBe(0)
  })

  it('excludes cancelled bookings from arrivals and departures', () => {
    const summary = calculateReservationSummary(
      [rooms[0]!],
      [{ ...booking, status: 'cancelled' }],
      range,
    )
    expect(summary.arrivals).toBe(0)
    expect(summary.departures).toBe(0)
  })

  it('keeps operational summary bookings independent of status and source filters', () => {
    const second = {
      ...booking,
      id: 'booking-2',
      roomId: 'room-2',
      source: 'Expedia' as const,
      status: 'checked-in' as const,
    }
    const view = createReservationViewData(rooms, [booking, second], {
      status: 'confirmed',
      source: 'Direct',
      roomType: null,
    })
    expect(view.renderedBookings.map((item) => item.id)).toEqual(['booking-1'])
    expect(view.operationalBookings.map((item) => item.id)).toEqual(['booking-1', 'booking-2'])
  })

  it('applies room type to both operational bookings and room capacity', () => {
    const second = { ...booking, id: 'booking-2', roomId: 'room-2' }
    const view = createReservationViewData(rooms, [booking, second], {
      status: null,
      source: null,
      roomType: 'Standard',
    })
    const summary = calculateReservationSummary(view.rooms, view.operationalBookings, range)
    expect(view.rooms.map((room) => room.id)).toEqual(['room-1'])
    expect(view.operationalBookings.map((item) => item.id)).toEqual(['booking-1'])
    expect(summary.sellableRoomDays).toBe(9)
  })
})
