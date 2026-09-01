import { describe, expect, it } from 'vitest'

import {
  aggregatePeriodPerformance,
  calculateRevenueBySource,
  calculateRoomTypePerformance,
} from '@/modules/analytics/utils/hospitalityMetrics'
import { mockBookings } from '@/mocks/data/bookings'
import { mockProperties, mockRooms } from '@/mocks/data/properties'
import { mockRevenueMetrics } from '@/mocks/data/revenue'
import { DEMO_PERIOD } from '@/mocks/demoPeriod'

describe('deterministic analytics data consistency', () => {
  it.each(mockProperties.map((property) => [property.name, property.id] as const))(
    'keeps period, source, and room-type totals aligned for %s',
    (_propertyName, propertyId) => {
      const rooms = mockRooms.filter((room) => room.propertyId === propertyId)
      const bookings = mockBookings.filter((booking) => booking.propertyId === propertyId)
      const metrics = mockRevenueMetrics.filter((metric) => metric.propertyId === propertyId)
      const performance = aggregatePeriodPerformance(metrics, DEMO_PERIOD)
      const sourceRevenue = calculateRevenueBySource(rooms, bookings, DEMO_PERIOD).reduce(
        (total, source) => total + source.revenue,
        0,
      )
      const roomTypes = calculateRoomTypePerformance(rooms, bookings, DEMO_PERIOD)

      expect(performance).not.toBeNull()
      expect(sourceRevenue).toBeCloseTo(performance?.revenue ?? 0)
      expect(roomTypes.reduce((total, roomType) => total + roomType.revenue, 0)).toBeCloseTo(
        performance?.revenue ?? 0,
      )
      expect(roomTypes.reduce((total, roomType) => total + roomType.occupiedRoomNights, 0)).toBe(
        performance?.occupiedRoomNights,
      )
      expect(roomTypes.reduce((total, roomType) => total + roomType.sellableRoomNights, 0)).toBe(
        performance?.sellableRoomNights,
      )
    },
  )
})
