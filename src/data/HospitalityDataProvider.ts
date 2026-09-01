import type { RevenueMetric, RevenueMetricFilters } from '@/modules/analytics/types/revenue'
import type { Booking, BookingFilters } from '@/modules/bookings/types/booking'
import type { InventoryFilters, InventoryItem } from '@/modules/inventory/types/inventory'
import type {
  Inspection,
  InspectionDetail,
  InspectionFilters,
} from '@/modules/quality/types/inspection'
import type { Property, Room } from '@/shared/types/property'
import type { UserProfile } from '@/shared/types/user'

export interface HospitalityDataProvider {
  getProperties(): Promise<Property[]>
  getProperty(id: string): Promise<Property | null>
  getRooms(propertyId: string): Promise<Room[]>
  getBookings(filters?: BookingFilters): Promise<Booking[]>
  getRevenueMetrics(filters?: RevenueMetricFilters): Promise<RevenueMetric[]>
  getInspections(filters?: InspectionFilters): Promise<Inspection[]>
  getInspection(id: string): Promise<InspectionDetail | null>
  getInventory(filters?: InventoryFilters): Promise<InventoryItem[]>
  getCurrentUser(): Promise<UserProfile>
}
