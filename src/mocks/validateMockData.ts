import { mockBookings } from '@/mocks/data/bookings'
import { validateBookingData } from '@/modules/bookings/utils/validateBookingData'
import { mockInspectionDetails, mockInspections } from '@/mocks/data/inspections'
import { mockInventory } from '@/mocks/data/inventory'
import { mockProperties, mockRooms } from '@/mocks/data/properties'
import { mockRevenueMetrics } from '@/mocks/data/revenue'
import { mockCurrentUser } from '@/mocks/data/user'
import { validateInventoryData } from '@/modules/inventory/utils/validateInventoryData'
import { validateInspectionData } from '@/modules/quality/utils/validateInspectionData'

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) throw new Error(`Mock data integrity error: ${message}`)
}

export function validateMockData(): void {
  const propertyIds = new Set(mockProperties.map((property) => property.id))

  for (const property of mockProperties) {
    const actualRoomCount = mockRooms.filter((room) => room.propertyId === property.id).length
    assert(actualRoomCount === property.roomCount, `${property.id} roomCount does not match rooms`)
  }

  for (const room of mockRooms) {
    assert(propertyIds.has(room.propertyId), `${room.id} references an unknown property`)
  }

  validateBookingData(mockBookings, mockRooms, propertyIds)

  for (const metric of mockRevenueMetrics) {
    assert(
      propertyIds.has(metric.propertyId),
      `${metric.date} metric references an unknown property`,
    )
    assert(
      metric.occupiedRoomNights <= metric.sellableRoomNights,
      `${metric.date} occupied room-nights exceed sellable capacity`,
    )
    assert(
      Math.abs(
        metric.occupancyRate -
          (metric.sellableRoomNights ? metric.occupiedRoomNights / metric.sellableRoomNights : 0),
      ) < 1e-9,
      `${metric.date} occupancy is inconsistent with room-night totals`,
    )
  }

  validateInspectionData(mockInspections, mockInspectionDetails, propertyIds)

  validateInventoryData(mockInventory, propertyIds)

  assert(
    propertyIds.has(mockCurrentUser.preferredPropertyId),
    'demo user references an unknown preferred property',
  )
}
