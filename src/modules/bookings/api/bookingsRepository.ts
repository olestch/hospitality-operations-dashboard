import { dataProvider } from '@/data'
import type { Booking, BookingFilters } from '@/modules/bookings/types/booking'

export async function getBookings(filters: BookingFilters = {}): Promise<Booking[]> {
  return dataProvider.getBookings(filters)
}
