import type { Booking } from '@/modules/bookings/types/booking'
import {
  daysBetween,
  getBookingSpan,
  type DateRange,
} from '@/modules/bookings/utils/reservationTimeline'

export interface BookingRevenueAllocation {
  occupiedNights: number
  totalNights: number
  revenue: number
}

/**
 * Revenue is allocated evenly across occupied stay nights. Calculations keep full
 * precision; rounding belongs to the UI formatter.
 */
export function allocateBookingRevenue(
  booking: Booking,
  range: DateRange,
): BookingRevenueAllocation {
  const totalNights = Math.max(daysBetween(booking.checkIn, booking.checkOut), 0)
  const span = getBookingSpan(booking, range)
  const occupiedNights = span?.span ?? 0

  return {
    occupiedNights,
    totalNights,
    revenue:
      booking.status === 'cancelled' || totalNights === 0
        ? 0
        : (booking.totalAmount / totalNights) * occupiedNights,
  }
}
