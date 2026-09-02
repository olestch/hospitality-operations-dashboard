import type { Booking } from '@/modules/bookings/types/booking'
import { bookingDateTimeKey, isValidLocalTime } from '@/modules/bookings/utils/bookingTime'
import { findBookingConflicts } from '@/modules/bookings/utils/reservationTimeline'
import type { Room } from '@/shared/types/property'

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) throw new Error(`Booking data integrity error: ${message}`)
}

function isValidIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const parsed = Date.parse(`${value}T00:00:00Z`)
  return Number.isFinite(parsed) && new Date(parsed).toISOString().slice(0, 10) === value
}

export function validateBookingData(
  bookings: readonly Booking[],
  rooms: readonly Room[],
  propertyIds: ReadonlySet<string>,
): void {
  const roomById = new Map(rooms.map((room) => [room.id, room]))
  const bookingIds = new Set<string>()

  for (const booking of bookings) {
    assert(!bookingIds.has(booking.id), `${booking.id} is duplicated`)
    bookingIds.add(booking.id)

    const room = roomById.get(booking.roomId)
    assert(propertyIds.has(booking.propertyId), `${booking.id} references an unknown property`)
    assert(room !== undefined, `${booking.id} references an unknown room`)
    assert(room.propertyId === booking.propertyId, `${booking.id} room belongs to another property`)
    assert(isValidIsoDate(booking.checkIn), `${booking.id} has an invalid check-in date`)
    assert(isValidIsoDate(booking.checkOut), `${booking.id} has an invalid check-out date`)
    assert(isValidLocalTime(booking.checkInTime), `${booking.id} has an invalid check-in time`)
    assert(isValidLocalTime(booking.checkOutTime), `${booking.id} has an invalid check-out time`)
    assert(booking.checkIn < booking.checkOut, `${booking.id} must contain at least one night`)
    assert(
      bookingDateTimeKey(booking.checkIn, booking.checkInTime) <
        bookingDateTimeKey(booking.checkOut, booking.checkOutTime),
      `${booking.id} has an invalid local datetime interval`,
    )
    assert(booking.paidAmount <= booking.totalAmount, `${booking.id} paid amount exceeds total`)
  }

  const conflict = findBookingConflicts(bookings)[0]
  assert(
    conflict === undefined,
    conflict
      ? `${conflict.first.id} overlaps ${conflict.second.id} in room ${conflict.first.roomId}`
      : 'booking overlap detected',
  )
}
