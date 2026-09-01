import type { HospitalityDataProvider } from '@/data/HospitalityDataProvider'
import type { RevenueMetricFilters } from '@/modules/analytics/types/revenue'
import type { BookingFilters } from '@/modules/bookings/types/booking'
import { bookingDatesOverlapRange } from '@/modules/bookings/utils/reservationTimeline'
import type { InventoryFilters } from '@/modules/inventory/types/inventory'
import type { InspectionFilters } from '@/modules/quality/types/inspection'
import { mockBookings } from '@/mocks/data/bookings'
import { mockInspectionDetails, mockInspections } from '@/mocks/data/inspections'
import { mockInventory } from '@/mocks/data/inventory'
import { mockProperties, mockRooms } from '@/mocks/data/properties'
import { mockRevenueMetrics } from '@/mocks/data/revenue'
import { mockCurrentUser } from '@/mocks/data/user'
import { validateMockData } from '@/mocks/validateMockData'
import { delay } from '@/shared/utils/delay'

const MOCK_DELAY_MS = 45

if (import.meta.env.DEV) validateMockData()

function overlapsRange(start: string, end: string, dateFrom?: string, dateTo?: string): boolean {
  if (!dateFrom && !dateTo) return true
  return bookingDatesOverlapRange(start, end, {
    start: dateFrom ?? start,
    end: dateTo ?? end,
  })
}

function isWithinRange(date: string, dateFrom?: string, dateTo?: string): boolean {
  return (!dateFrom || date >= dateFrom) && (!dateTo || date <= dateTo)
}

export const mockHospitalityDataProvider: HospitalityDataProvider = {
  async getProperties() {
    await delay(MOCK_DELAY_MS)
    return [...mockProperties]
  },
  async getProperty(id) {
    await delay(MOCK_DELAY_MS)
    return mockProperties.find((property) => property.id === id) ?? null
  },
  async getRooms(propertyId) {
    await delay(MOCK_DELAY_MS)
    return mockRooms.filter((room) => room.propertyId === propertyId)
  },
  async getBookings(filters: BookingFilters = {}) {
    await delay(MOCK_DELAY_MS)
    return mockBookings.filter(
      (booking) =>
        (!filters.propertyId || booking.propertyId === filters.propertyId) &&
        (!filters.roomId || booking.roomId === filters.roomId) &&
        (!filters.status || booking.status === filters.status) &&
        (!filters.source || booking.source === filters.source) &&
        overlapsRange(booking.checkIn, booking.checkOut, filters.dateFrom, filters.dateTo),
    )
  },
  async getRevenueMetrics(filters: RevenueMetricFilters = {}) {
    await delay(MOCK_DELAY_MS)
    return mockRevenueMetrics.filter(
      (metric) =>
        (!filters.propertyId || metric.propertyId === filters.propertyId) &&
        (!filters.period || metric.period === filters.period) &&
        isWithinRange(metric.date, filters.dateFrom, filters.dateTo),
    )
  },
  async getInspections(filters: InspectionFilters = {}) {
    await delay(MOCK_DELAY_MS)
    return mockInspections.filter(
      (inspection) =>
        (!filters.propertyId || inspection.propertyId === filters.propertyId) &&
        (!filters.status || inspection.status === filters.status) &&
        isWithinRange(inspection.scheduledDate, filters.dateFrom, filters.dateTo),
    )
  },
  async getInspection(id) {
    await delay(MOCK_DELAY_MS)
    const detail = mockInspectionDetails.find((inspection) => inspection.id === id)
    return detail ?? null
  },
  async getInventory(filters: InventoryFilters = {}) {
    await delay(MOCK_DELAY_MS)
    return mockInventory.filter(
      (item) =>
        (!filters.propertyId || item.propertyId === filters.propertyId) &&
        (!filters.roomId || item.roomId === filters.roomId) &&
        (!filters.status || item.status === filters.status) &&
        (!filters.location || item.location === filters.location),
    )
  },
  async getCurrentUser() {
    await delay(MOCK_DELAY_MS)
    return { ...mockCurrentUser }
  },
}
