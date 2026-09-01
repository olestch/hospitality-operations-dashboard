import type { RevenueMetric } from '@/modules/analytics/types/revenue'
import { allocateBookingRevenue } from '@/modules/analytics/utils/revenueAllocation'
import { bookingOverlapsRange } from '@/modules/bookings/utils/reservationTimeline'
import { mockBookings } from '@/mocks/data/bookings'
import { DEMO_PERIOD } from '@/mocks/demoPeriod'
import { mockProperties, mockRooms } from '@/mocks/data/properties'

const DAY_IN_MILLISECONDS = 86_400_000

function toIsoDate(timestamp: number): string {
  return new Date(timestamp).toISOString().slice(0, 10)
}

function createDailyMetrics(): RevenueMetric[] {
  const start = Date.parse(`${DEMO_PERIOD.start}T00:00:00Z`)
  const end = Date.parse(`${DEMO_PERIOD.end}T00:00:00Z`)

  return mockProperties.flatMap((property) => {
    const metrics: RevenueMetric[] = []
    const sellableRoomIds = new Set(
      mockRooms
        .filter(
          (room) =>
            room.propertyId === property.id &&
            room.status !== 'maintenance' &&
            room.status !== 'out-of-service',
        )
        .map((room) => room.id),
    )
    const propertyBookings = mockBookings.filter((booking) => booking.propertyId === property.id)

    for (let timestamp = start; timestamp <= end; timestamp += DAY_IN_MILLISECONDS) {
      const date = toIsoDate(timestamp)
      const range = { start: date, end: date }
      const activeBookings = propertyBookings.filter(
        (booking) => sellableRoomIds.has(booking.roomId) && bookingOverlapsRange(booking, range),
      )
      const occupiedRoomNights = new Set(activeBookings.map((booking) => booking.roomId)).size
      const sellableRoomNights = sellableRoomIds.size
      const revenue = activeBookings.reduce(
        (total, booking) => total + allocateBookingRevenue(booking, range).revenue,
        0,
      )
      const occupancyRate = sellableRoomNights ? occupiedRoomNights / sellableRoomNights : 0
      const adr = occupiedRoomNights ? revenue / occupiedRoomNights : 0

      metrics.push({
        date,
        period: 'day',
        propertyId: property.id,
        revenue,
        occupancyRate,
        adr,
        revpar: sellableRoomNights ? revenue / sellableRoomNights : 0,
        occupiedRoomNights,
        sellableRoomNights,
      })
    }

    return metrics
  })
}

function createMonthlyMetrics(dailyMetrics: readonly RevenueMetric[]): RevenueMetric[] {
  return mockProperties.flatMap((property) =>
    ['2025-01', '2025-02', '2025-03'].map((month) => {
      const entries = dailyMetrics.filter(
        (metric) => metric.propertyId === property.id && metric.date.startsWith(month),
      )
      const revenue = entries.reduce((total, metric) => total + metric.revenue, 0)
      const occupiedRoomNights = entries.reduce(
        (total, metric) => total + metric.occupiedRoomNights,
        0,
      )
      const sellableRoomNights = entries.reduce(
        (total, metric) => total + metric.sellableRoomNights,
        0,
      )
      const occupancyRate = sellableRoomNights ? occupiedRoomNights / sellableRoomNights : 0
      const adr = occupiedRoomNights ? revenue / occupiedRoomNights : 0

      return {
        date: `${month}-01`,
        period: 'month' as const,
        propertyId: property.id,
        revenue,
        occupancyRate,
        adr,
        revpar: sellableRoomNights ? revenue / sellableRoomNights : 0,
        occupiedRoomNights,
        sellableRoomNights,
      }
    }),
  )
}

const dailyRevenueMetrics = createDailyMetrics()

export const mockRevenueMetrics: readonly RevenueMetric[] = [
  ...dailyRevenueMetrics,
  ...createMonthlyMetrics(dailyRevenueMetrics),
]
