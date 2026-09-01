import type { Booking } from '@/modules/bookings/types/booking'
import type { Room } from '@/shared/types/property'

export interface DailyOperationsSummary {
  occupiedRooms: number
  availableRooms: number
  unavailableRooms: number
  arrivals: number
  departures: number
}

/**
 * Booking stays use a half-open interval: check-in is inclusive and check-out is exclusive.
 * A guest departing on the demo date is therefore a departure, but no longer occupies the room.
 */
export function isBookingOccupiedOnDate(booking: Booking, date: string): boolean {
  return booking.status !== 'cancelled' && booking.checkIn <= date && date < booking.checkOut
}

export function getArrivalsForDate(bookings: readonly Booking[], date: string): Booking[] {
  return bookings.filter((booking) => booking.status !== 'cancelled' && booking.checkIn === date)
}

export function getDeparturesForDate(bookings: readonly Booking[], date: string): Booking[] {
  return bookings.filter((booking) => booking.status !== 'cancelled' && booking.checkOut === date)
}

export function summarizeDailyOperations(
  rooms: readonly Room[],
  bookings: readonly Booking[],
  date: string,
): DailyOperationsSummary {
  const unavailableRoomIds = new Set(
    rooms
      .filter((room) => room.status === 'maintenance' || room.status === 'out-of-service')
      .map((room) => room.id),
  )
  const occupiedRoomIds = new Set(
    bookings
      .filter((booking) => isBookingOccupiedOnDate(booking, date))
      .map((booking) => booking.roomId)
      .filter((roomId) => !unavailableRoomIds.has(roomId)),
  )

  return {
    occupiedRooms: occupiedRoomIds.size,
    unavailableRooms: unavailableRoomIds.size,
    availableRooms: Math.max(rooms.length - occupiedRoomIds.size - unavailableRoomIds.size, 0),
    arrivals: getArrivalsForDate(bookings, date).length,
    departures: getDeparturesForDate(bookings, date).length,
  }
}

export function getUpcomingBookings(
  bookings: readonly Booking[],
  afterDate: string,
  limit = 5,
): Booking[] {
  return bookings
    .filter((booking) => booking.status !== 'cancelled' && booking.checkIn > afterDate)
    .sort((first, second) => first.checkIn.localeCompare(second.checkIn))
    .slice(0, limit)
}
