import type { Booking, BookingSource, BookingStatus } from '@/modules/bookings/types/booking'
import type { Room } from '@/shared/types/property'

const DAY_MS = 86_400_000

export interface DateRange {
  start: string
  end: string
}

export interface TimelineDay {
  date: string
  dayNumber: number
  weekday: string
  isDemoDate: boolean
}

export interface TimelineMonthGroup {
  key: string
  label: string
  startColumn: number
  span: number
}

export interface BookingSpan {
  booking: Booking
  startColumn: number
  span: number
  clippedAtStart: boolean
  clippedAtEnd: boolean
}

export interface ReservationGridRow {
  room: Room
  bookings: BookingSpan[]
}

export interface BookingGridFilters {
  status: BookingStatus | null
  source: BookingSource | null
  roomType: string | null
}

export interface ReservationSummary {
  activeBookings: number
  occupancyRate: number
  arrivals: number
  departures: number
  occupiedRoomDays: number
  sellableRoomDays: number
}

export interface ReservationViewData {
  rooms: Room[]
  operationalBookings: Booking[]
  renderedBookings: Booking[]
}

export interface BookingConflict {
  first: Booking
  second: Booking
}

function toTimestamp(date: string): number {
  return Date.parse(`${date}T00:00:00Z`)
}

export function addDays(date: string, days: number): string {
  return new Date(toTimestamp(date) + days * DAY_MS).toISOString().slice(0, 10)
}

export function daysBetween(start: string, end: string): number {
  return Math.round((toTimestamp(end) - toTimestamp(start)) / DAY_MS)
}

export function generateVisibleDays(range: DateRange, demoDate: string): TimelineDay[] {
  const count = daysBetween(range.start, range.end) + 1
  if (count <= 0) return []

  return Array.from({ length: count }, (_, index) => {
    const date = addDays(range.start, index)
    const parsedDate = new Date(`${date}T00:00:00Z`)
    return {
      date,
      dayNumber: parsedDate.getUTCDate(),
      weekday: parsedDate.toLocaleDateString('en', { weekday: 'short', timeZone: 'UTC' }),
      isDemoDate: date === demoDate,
    }
  })
}

export function isValidDateRange(range: DateRange): boolean {
  return range.start <= range.end
}

export function bookingDatesOverlapRange(
  checkIn: string,
  checkOut: string,
  range: DateRange,
): boolean {
  if (!isValidDateRange(range)) return false
  return checkIn < addDays(range.end, 1) && checkOut > range.start
}

export function groupDaysByMonth(days: readonly TimelineDay[]): TimelineMonthGroup[] {
  const groups: TimelineMonthGroup[] = []

  days.forEach((day, index) => {
    const key = day.date.slice(0, 7)
    const current = groups[groups.length - 1]
    if (current?.key === key) {
      current.span += 1
      return
    }
    groups.push({
      key,
      label: new Date(`${day.date}T00:00:00Z`).toLocaleDateString('en', {
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
      }),
      startColumn: index + 1,
      span: 1,
    })
  })

  return groups
}

export function bookingOverlapsRange(booking: Booking, range: DateRange): boolean {
  return (
    booking.status !== 'cancelled' &&
    bookingDatesOverlapRange(booking.checkIn, booking.checkOut, range)
  )
}

export function bookingsConflict(first: Booking, second: Booking): boolean {
  return (
    first.roomId === second.roomId &&
    first.status !== 'cancelled' &&
    second.status !== 'cancelled' &&
    first.checkIn < second.checkOut &&
    second.checkIn < first.checkOut
  )
}

export function findBookingConflicts(bookings: readonly Booking[]): BookingConflict[] {
  const conflicts: BookingConflict[] = []
  const bookingsByRoom = indexBookingsByRoom(
    bookings.filter((booking) => booking.status !== 'cancelled'),
  )

  for (const roomBookings of bookingsByRoom.values()) {
    const sortedBookings = [...roomBookings].sort((first, second) =>
      first.checkIn.localeCompare(second.checkIn),
    )
    for (let firstIndex = 0; firstIndex < sortedBookings.length; firstIndex += 1) {
      const first = sortedBookings[firstIndex]
      if (!first) continue
      for (
        let secondIndex = firstIndex + 1;
        secondIndex < sortedBookings.length;
        secondIndex += 1
      ) {
        const second = sortedBookings[secondIndex]
        if (!second || second.checkIn >= first.checkOut) break
        if (bookingsConflict(first, second)) conflicts.push({ first, second })
      }
    }
  }

  return conflicts
}

export function getBookingSpan(booking: Booking, range: DateRange): BookingSpan | null {
  if (!bookingOverlapsRange(booking, range)) return null
  const rangeEndExclusive = addDays(range.end, 1)
  const clippedStart = booking.checkIn < range.start ? range.start : booking.checkIn
  const clippedEnd = booking.checkOut > rangeEndExclusive ? rangeEndExclusive : booking.checkOut

  return {
    booking,
    startColumn: daysBetween(range.start, clippedStart) + 1,
    span: daysBetween(clippedStart, clippedEnd),
    clippedAtStart: booking.checkIn < range.start,
    clippedAtEnd: booking.checkOut > rangeEndExclusive,
  }
}

export function indexBookingsByRoom(bookings: readonly Booking[]): Map<string, Booking[]> {
  const index = new Map<string, Booking[]>()
  for (const booking of bookings) {
    const roomBookings = index.get(booking.roomId) ?? []
    roomBookings.push(booking)
    index.set(booking.roomId, roomBookings)
  }
  return index
}

export function createReservationGrid(
  rooms: readonly Room[],
  bookings: readonly Booking[],
  range: DateRange,
): ReservationGridRow[] {
  const bookingIndex = indexBookingsByRoom(bookings)
  return rooms.map((room) => ({
    room,
    bookings: (bookingIndex.get(room.id) ?? [])
      .map((booking) => getBookingSpan(booking, range))
      .filter((span): span is BookingSpan => span !== null),
  }))
}

export function filterReservationData(
  rooms: readonly Room[],
  bookings: readonly Booking[],
  filters: BookingGridFilters,
): { rooms: Room[]; bookings: Booking[] } {
  const filteredRooms = filters.roomType
    ? rooms.filter((room) => room.type === filters.roomType)
    : [...rooms]
  const roomIds = new Set(filteredRooms.map((room) => room.id))
  const filteredBookings = bookings.filter(
    (booking) =>
      roomIds.has(booking.roomId) &&
      booking.status !== 'cancelled' &&
      (!filters.status || booking.status === filters.status) &&
      (!filters.source || booking.source === filters.source),
  )
  return { rooms: filteredRooms, bookings: filteredBookings }
}

export function createReservationViewData(
  rooms: readonly Room[],
  bookings: readonly Booking[],
  filters: BookingGridFilters,
): ReservationViewData {
  const operationalData = filterReservationData(rooms, bookings, {
    roomType: filters.roomType,
    source: null,
    status: null,
  })
  const renderedBookings = operationalData.bookings.filter(
    (booking) =>
      (!filters.status || booking.status === filters.status) &&
      (!filters.source || booking.source === filters.source),
  )

  return {
    rooms: operationalData.rooms,
    operationalBookings: operationalData.bookings,
    renderedBookings,
  }
}

export function calculateReservationSummary(
  rooms: readonly Room[],
  bookings: readonly Booking[],
  range: DateRange,
): ReservationSummary {
  const activeBookings = bookings.filter((booking) => bookingOverlapsRange(booking, range))
  const nonCancelledBookings = bookings.filter((booking) => booking.status !== 'cancelled')
  const sellableRooms = rooms.filter(
    (room) => room.status !== 'maintenance' && room.status !== 'out-of-service',
  )
  const sellableRoomIds = new Set(sellableRooms.map((room) => room.id))
  const visibleDayCount = daysBetween(range.start, range.end) + 1
  const occupiedRoomDays = new Set<string>()

  for (const booking of activeBookings) {
    if (!sellableRoomIds.has(booking.roomId)) continue
    const span = getBookingSpan(booking, range)
    if (!span) continue
    for (let dayOffset = 0; dayOffset < span.span; dayOffset += 1) {
      occupiedRoomDays.add(
        `${booking.roomId}:${addDays(range.start, span.startColumn - 1 + dayOffset)}`,
      )
    }
  }

  const sellableRoomDays = Math.max(sellableRooms.length * visibleDayCount, 0)
  return {
    activeBookings: activeBookings.length,
    occupancyRate: sellableRoomDays ? occupiedRoomDays.size / sellableRoomDays : 0,
    arrivals: nonCancelledBookings.filter(
      (booking) => booking.checkIn >= range.start && booking.checkIn <= range.end,
    ).length,
    departures: nonCancelledBookings.filter(
      (booking) => booking.checkOut >= range.start && booking.checkOut <= range.end,
    ).length,
    occupiedRoomDays: occupiedRoomDays.size,
    sellableRoomDays,
  }
}
