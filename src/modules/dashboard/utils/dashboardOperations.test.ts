import { describe, expect, it } from 'vitest'

import type { Booking } from '@/modules/bookings/types/booking'
import {
  getArrivalsForDate,
  getDeparturesForDate,
  isBookingOccupiedOnDate,
  summarizeDailyOperations,
} from '@/modules/dashboard/utils/dashboardOperations'
import type { Room } from '@/shared/types/property'

const booking: Booking = {
  id: 'booking-test',
  propertyId: 'property-test',
  roomId: 'room-1',
  guestName: 'Test Guest',
  guestCount: 1,
  source: 'Direct',
  checkIn: '2025-03-10',
  checkInTime: '15:00',
  checkOut: '2025-03-12',
  checkOutTime: '11:00',
  status: 'confirmed',
  totalAmount: 200,
  paidAmount: 100,
}

const rooms: Room[] = [
  {
    id: 'room-1',
    propertyId: 'property-test',
    name: 'Room 1',
    number: '1',
    type: 'Standard',
    capacity: 2,
    status: 'available',
    housekeepingStatus: 'inspected',
  },
  {
    id: 'room-2',
    propertyId: 'property-test',
    name: 'Room 2',
    number: '2',
    type: 'Standard',
    capacity: 2,
    status: 'maintenance',
    housekeepingStatus: 'dirty',
  },
  {
    id: 'room-3',
    propertyId: 'property-test',
    name: 'Room 3',
    number: '3',
    type: 'Standard',
    capacity: 2,
    status: 'available',
    housekeepingStatus: 'cleaned',
  },
]

describe('dashboard booking interval semantics', () => {
  it('includes check-in and excludes check-out from occupancy', () => {
    expect(isBookingOccupiedOnDate(booking, '2025-03-10')).toBe(true)
    expect(isBookingOccupiedOnDate(booking, '2025-03-11')).toBe(true)
    expect(isBookingOccupiedOnDate(booking, '2025-03-12')).toBe(false)
  })

  it('excludes cancelled bookings from occupancy', () => {
    expect(isBookingOccupiedOnDate({ ...booking, status: 'cancelled' }, '2025-03-10')).toBe(false)
  })

  it('derives arrivals and departures on their exact boundary dates', () => {
    expect(getArrivalsForDate([booking], '2025-03-10')).toEqual([booking])
    expect(getDeparturesForDate([booking], '2025-03-12')).toEqual([booking])
  })

  it('summarizes occupied, available, and unavailable rooms without overlap', () => {
    expect(summarizeDailyOperations(rooms, [booking], '2025-03-10')).toEqual({
      occupiedRooms: 1,
      availableRooms: 1,
      unavailableRooms: 1,
      arrivals: 1,
      departures: 0,
    })
  })
})
