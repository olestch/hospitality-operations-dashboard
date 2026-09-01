export type BookingStatus = 'confirmed' | 'checked-in' | 'checked-out' | 'cancelled'
export type BookingSource = 'Direct' | 'Booking.com' | 'Expedia' | 'Corporate'

export interface Booking {
  id: string
  propertyId: string
  roomId: string
  guestName: string
  guestCount: number
  source: BookingSource
  checkIn: string
  checkOut: string
  status: BookingStatus
  totalAmount: number
  paidAmount: number
}

export interface BookingFilters {
  propertyId?: string
  roomId?: string
  status?: BookingStatus
  source?: BookingSource
  dateFrom?: string
  dateTo?: string
}
