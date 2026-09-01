import type { HospitalityMetricKey, RevenueMetric } from '@/modules/analytics/types/revenue'
import type { Booking, BookingSource } from '@/modules/bookings/types/booking'
import {
  calculateReservationSummary,
  daysBetween,
  type DateRange,
} from '@/modules/bookings/utils/reservationTimeline'
import { allocateBookingRevenue } from '@/modules/analytics/utils/revenueAllocation'
import type { Room } from '@/shared/types/property'

export interface PeriodPerformance {
  revenue: number
  occupancy: number
  adr: number
  revpar: number
  occupiedRoomNights: number
  sellableRoomNights: number
  dailyDataPoints: number
}

export interface RevenueSourcePerformance {
  source: BookingSource
  revenue: number
  share: number
}

export interface RoomTypePerformance {
  roomType: string
  roomCount: number
  occupiedRoomNights: number
  sellableRoomNights: number
  occupancy: number
  revenue: number
}

export function aggregatePeriodPerformance(
  metrics: readonly RevenueMetric[],
  range: DateRange,
): PeriodPerformance | null {
  const dailyMetrics = metrics.filter(
    (metric) => metric.period === 'day' && metric.date >= range.start && metric.date <= range.end,
  )
  if (dailyMetrics.length === 0) return null

  const revenue = dailyMetrics.reduce((total, metric) => total + metric.revenue, 0)
  const occupiedRoomNights = dailyMetrics.reduce(
    (total, metric) => total + metric.occupiedRoomNights,
    0,
  )
  const sellableRoomNights = dailyMetrics.reduce(
    (total, metric) => total + metric.sellableRoomNights,
    0,
  )

  return {
    revenue,
    occupiedRoomNights,
    sellableRoomNights,
    occupancy: sellableRoomNights ? occupiedRoomNights / sellableRoomNights : 0,
    adr: occupiedRoomNights ? revenue / occupiedRoomNights : 0,
    revpar: sellableRoomNights ? revenue / sellableRoomNights : 0,
    dailyDataPoints: dailyMetrics.length,
  }
}

export function getDailyMetrics(
  metrics: readonly RevenueMetric[],
  range: DateRange,
): RevenueMetric[] {
  return metrics
    .filter(
      (metric) => metric.period === 'day' && metric.date >= range.start && metric.date <= range.end,
    )
    .sort((first, second) => first.date.localeCompare(second.date))
}

export function getHospitalityMetricValue(
  performance: Pick<PeriodPerformance, 'revenue' | 'occupancy' | 'adr' | 'revpar'>,
  metric: HospitalityMetricKey,
): number {
  return performance[metric]
}

export function calculateRevenueBySource(
  rooms: readonly Room[],
  bookings: readonly Booking[],
  range: DateRange,
): RevenueSourcePerformance[] {
  const sellableRoomIds = new Set(
    rooms
      .filter((room) => room.status !== 'maintenance' && room.status !== 'out-of-service')
      .map((room) => room.id),
  )
  const revenueBySource = new Map<BookingSource, number>()

  for (const booking of bookings) {
    if (!sellableRoomIds.has(booking.roomId)) continue
    const revenue = allocateBookingRevenue(booking, range).revenue
    if (revenue <= 0) continue
    revenueBySource.set(booking.source, (revenueBySource.get(booking.source) ?? 0) + revenue)
  }

  const totalRevenue = [...revenueBySource.values()].reduce((total, revenue) => total + revenue, 0)
  return [...revenueBySource.entries()]
    .map(([source, revenue]) => ({
      source,
      revenue,
      share: totalRevenue ? revenue / totalRevenue : 0,
    }))
    .sort((first, second) => second.revenue - first.revenue)
}

export function calculateRoomTypePerformance(
  rooms: readonly Room[],
  bookings: readonly Booking[],
  range: DateRange,
): RoomTypePerformance[] {
  const roomTypes = [...new Set(rooms.map((room) => room.type))].sort()

  return roomTypes.map((roomType) => {
    const typeRooms = rooms.filter((room) => room.type === roomType)
    const typeRoomIds = new Set(typeRooms.map((room) => room.id))
    const typeBookings = bookings.filter((booking) => typeRoomIds.has(booking.roomId))
    const summary = calculateReservationSummary(typeRooms, typeBookings, range)
    const sellableRoomIds = new Set(
      typeRooms
        .filter((room) => room.status !== 'maintenance' && room.status !== 'out-of-service')
        .map((room) => room.id),
    )
    const revenue = typeBookings.reduce(
      (total, booking) =>
        total +
        (sellableRoomIds.has(booking.roomId) ? allocateBookingRevenue(booking, range).revenue : 0),
      0,
    )

    return {
      roomType,
      roomCount: typeRooms.length,
      occupiedRoomNights: summary.occupiedRoomDays,
      sellableRoomNights: summary.sellableRoomDays,
      occupancy: summary.occupancyRate,
      revenue,
    }
  })
}

export function expectedDailyDataPoints(range: DateRange): number {
  return Math.max(daysBetween(range.start, range.end) + 1, 0)
}
