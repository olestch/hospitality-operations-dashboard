import { describe, expect, it } from 'vitest'

import type { RevenueMetric } from '@/modules/analytics/types/revenue'
import type { Booking } from '@/modules/bookings/types/booking'
import {
  aggregatePeriodPerformance,
  calculateRevenueBySource,
  calculateRoomTypePerformance,
} from '@/modules/analytics/utils/hospitalityMetrics'
import type { Room } from '@/shared/types/property'

const range = { start: '2025-03-10', end: '2025-03-11' }
const metrics: RevenueMetric[] = [
  {
    date: '2025-03-10',
    period: 'day',
    propertyId: 'property-test',
    revenue: 100,
    occupancyRate: 0.5,
    adr: 100,
    revpar: 50,
    occupiedRoomNights: 1,
    sellableRoomNights: 2,
  },
  {
    date: '2025-03-11',
    period: 'day',
    propertyId: 'property-test',
    revenue: 300,
    occupancyRate: 1,
    adr: 150,
    revpar: 150,
    occupiedRoomNights: 2,
    sellableRoomNights: 2,
  },
]
const rooms: Room[] = [
  {
    id: 'room-standard',
    propertyId: 'property-test',
    name: 'Standard',
    number: '101',
    type: 'Standard',
    capacity: 2,
    status: 'available',
  },
  {
    id: 'room-suite',
    propertyId: 'property-test',
    name: 'Suite',
    number: '201',
    type: 'Suite',
    capacity: 3,
    status: 'available',
  },
  {
    id: 'room-suite-blocked',
    propertyId: 'property-test',
    name: 'Blocked suite',
    number: '202',
    type: 'Suite',
    capacity: 3,
    status: 'maintenance',
  },
]
const booking: Booking = {
  id: 'booking-standard',
  propertyId: 'property-test',
  roomId: 'room-standard',
  guestName: 'Guest',
  guestCount: 2,
  source: 'Direct',
  checkIn: '2025-03-10',
  checkOut: '2025-03-12',
  status: 'confirmed',
  totalAmount: 400,
  paidAmount: 400,
}

describe('period hospitality metrics', () => {
  it('derives weighted occupancy, ADR, and RevPAR from totals', () => {
    expect(aggregatePeriodPerformance(metrics, range)).toMatchObject({
      revenue: 400,
      occupiedRoomNights: 3,
      sellableRoomNights: 4,
      occupancy: 0.75,
      adr: 400 / 3,
      revpar: 100,
    })
  })

  it('handles zero occupied nights without dividing by zero', () => {
    const emptyMetric = {
      ...metrics[0]!,
      revenue: 0,
      occupiedRoomNights: 0,
      occupancyRate: 0,
      adr: 0,
      revpar: 0,
    }
    expect(aggregatePeriodPerformance([emptyMetric], range)).toMatchObject({
      revenue: 0,
      occupancy: 0,
      adr: 0,
      revpar: 0,
    })
  })

  it('handles zero sellable capacity', () => {
    const unavailable = { ...metrics[0]!, sellableRoomNights: 0, occupiedRoomNights: 0 }
    expect(aggregatePeriodPerformance([unavailable], range)).toMatchObject({
      occupancy: 0,
      revpar: 0,
    })
  })
})

describe('room type and source analysis', () => {
  it('groups rooms and excludes unavailable capacity', () => {
    const result = calculateRoomTypePerformance(rooms, [booking], range)
    expect(result).toEqual([
      {
        roomType: 'Standard',
        roomCount: 1,
        occupiedRoomNights: 2,
        sellableRoomNights: 2,
        occupancy: 1,
        revenue: 400,
      },
      {
        roomType: 'Suite',
        roomCount: 2,
        occupiedRoomNights: 0,
        sellableRoomNights: 2,
        occupancy: 0,
        revenue: 0,
      },
    ])
  })

  it('attributes revenue to the booking room type', () => {
    const suiteBooking = {
      ...booking,
      id: 'booking-suite',
      roomId: 'room-suite',
      source: 'Corporate' as const,
    }
    const result = calculateRoomTypePerformance(rooms, [booking, suiteBooking], range)
    expect(result.find((row) => row.roomType === 'Standard')?.revenue).toBe(400)
    expect(result.find((row) => row.roomType === 'Suite')?.revenue).toBe(400)
  })

  it('excludes cancelled bookings from occupancy and revenue', () => {
    const result = calculateRoomTypePerformance(rooms, [{ ...booking, status: 'cancelled' }], range)
    expect(result.find((row) => row.roomType === 'Standard')).toMatchObject({
      occupiedRoomNights: 0,
      occupancy: 0,
      revenue: 0,
    })
  })

  it('does not treat unavailable rooms as source revenue', () => {
    const blockedBooking = { ...booking, id: 'blocked', roomId: 'room-suite-blocked' }
    expect(calculateRevenueBySource(rooms, [blockedBooking], range)).toEqual([])
  })

  it('returns source shares from allocated booking revenue', () => {
    const suiteBooking = {
      ...booking,
      id: 'booking-suite',
      roomId: 'room-suite',
      source: 'Corporate' as const,
      totalAmount: 200,
    }
    expect(calculateRevenueBySource(rooms, [booking, suiteBooking], range)).toEqual([
      { source: 'Direct', revenue: 400, share: 2 / 3 },
      { source: 'Corporate', revenue: 200, share: 1 / 3 },
    ])
  })
})
