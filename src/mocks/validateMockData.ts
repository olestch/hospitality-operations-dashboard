import { mockBookings } from '@/mocks/data/bookings'
import { findBookingConflicts } from '@/modules/bookings/utils/reservationTimeline'
import { mockInspectionDetails, mockInspections } from '@/mocks/data/inspections'
import { mockInventory } from '@/mocks/data/inventory'
import { mockProperties, mockRooms } from '@/mocks/data/properties'
import { mockRevenueMetrics } from '@/mocks/data/revenue'
import { mockCurrentUser } from '@/mocks/data/user'

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) throw new Error(`Mock data integrity error: ${message}`)
}

export function validateMockData(): void {
  const propertyIds = new Set(mockProperties.map((property) => property.id))
  const roomsById = new Map(mockRooms.map((room) => [room.id, room]))
  const inspectionIds = new Set(mockInspections.map((inspection) => inspection.id))

  for (const property of mockProperties) {
    const actualRoomCount = mockRooms.filter((room) => room.propertyId === property.id).length
    assert(actualRoomCount === property.roomCount, `${property.id} roomCount does not match rooms`)
  }

  for (const room of mockRooms) {
    assert(propertyIds.has(room.propertyId), `${room.id} references an unknown property`)
  }

  for (const booking of mockBookings) {
    const room = roomsById.get(booking.roomId)
    assert(propertyIds.has(booking.propertyId), `${booking.id} references an unknown property`)
    assert(room !== undefined, `${booking.id} references an unknown room`)
    assert(room.propertyId === booking.propertyId, `${booking.id} room belongs to another property`)
    assert(booking.checkIn < booking.checkOut, `${booking.id} has an invalid date range`)
    assert(booking.paidAmount <= booking.totalAmount, `${booking.id} paid amount exceeds total`)
  }

  for (const conflict of findBookingConflicts(mockBookings)) {
    assert(
      false,
      `${conflict.first.id} overlaps ${conflict.second.id} in room ${conflict.first.roomId}`,
    )
  }

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

  for (const inspection of mockInspections) {
    assert(
      propertyIds.has(inspection.propertyId),
      `${inspection.id} references an unknown property`,
    )
    assert(
      inspection.status === 'completed'
        ? inspection.completedDate !== null
        : inspection.completedDate === null,
      `${inspection.id} completion state is inconsistent`,
    )
  }

  for (const detail of mockInspectionDetails) {
    assert(inspectionIds.has(detail.id), `${detail.id} detail has no inspection summary`)
  }

  for (const item of mockInventory) {
    const room = roomsById.get(item.roomId)
    assert(propertyIds.has(item.propertyId), `${item.id} references an unknown property`)
    assert(room !== undefined, `${item.id} references an unknown room`)
    assert(room.propertyId === item.propertyId, `${item.id} room belongs to another property`)
  }

  assert(
    propertyIds.has(mockCurrentUser.preferredPropertyId),
    'demo user references an unknown preferred property',
  )
}
