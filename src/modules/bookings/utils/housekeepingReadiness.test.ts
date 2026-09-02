import { describe, expect, it } from 'vitest'

import {
  calculateHousekeepingReadiness,
  getHousekeepingPercentage,
} from '@/modules/bookings/utils/housekeepingReadiness'
import { mockProperties, mockRooms } from '@/mocks/data/properties'
import {
  isHousekeepingStatus,
  type HousekeepingStatus,
  type Room,
  type RoomStatus,
} from '@/shared/types/property'

function room(
  id: string,
  housekeepingStatus: HousekeepingStatus,
  status: RoomStatus = 'available',
): Room {
  return {
    id,
    propertyId: 'property-1',
    name: `Room ${id}`,
    number: id,
    type: 'Standard',
    capacity: 2,
    status,
    housekeepingStatus,
  }
}

describe('housekeeping readiness aggregation', () => {
  it('counts each readiness status across operational rooms', () => {
    expect(
      calculateHousekeepingReadiness([
        room('101', 'dirty'),
        room('102', 'cleaned'),
        room('103', 'inspected'),
        room('104', 'inspected', 'occupied'),
      ]),
    ).toEqual({
      counts: { dirty: 1, cleaned: 1, inspected: 2 },
      totalRooms: 4,
    })
  })

  it('excludes maintenance and out-of-service rooms from readiness', () => {
    expect(
      calculateHousekeepingReadiness([
        room('101', 'inspected'),
        room('102', 'dirty', 'maintenance'),
        room('103', 'cleaned', 'out-of-service'),
      ]),
    ).toEqual({
      counts: { dirty: 0, cleaned: 0, inspected: 1 },
      totalRooms: 1,
    })
  })

  it('returns an explicit zero distribution when no room is eligible', () => {
    const summary = calculateHousekeepingReadiness([room('101', 'dirty', 'maintenance')])

    expect(summary).toEqual({
      counts: { dirty: 0, cleaned: 0, inspected: 0 },
      totalRooms: 0,
    })
    expect(getHousekeepingPercentage(0, summary.totalRooms)).toBe(0)
  })

  it('calculates percentages from derived counts', () => {
    expect(getHousekeepingPercentage(2, 6)).toBeCloseTo(1 / 3)
  })

  it('recognizes only supported deterministic housekeeping statuses', () => {
    expect(isHousekeepingStatus('dirty')).toBe(true)
    expect(isHousekeepingStatus('cleaned')).toBe(true)
    expect(isHousekeepingStatus('inspected')).toBe(true)
    expect(isHousekeepingStatus('ready')).toBe(false)
    expect(isHousekeepingStatus(undefined)).toBe(false)
  })

  it.each(mockProperties.map((property) => [property.name, property.id] as const))(
    'provides a useful three-status distribution for %s',
    (_propertyName, propertyId) => {
      const summary = calculateHousekeepingReadiness(
        mockRooms.filter((item) => item.propertyId === propertyId),
      )

      expect(summary.counts.dirty).toBeGreaterThan(0)
      expect(summary.counts.cleaned).toBeGreaterThan(0)
      expect(summary.counts.inspected).toBeGreaterThan(0)
      expect(summary.totalRooms).toBe(
        mockRooms.filter(
          (item) =>
            item.propertyId === propertyId &&
            item.status !== 'maintenance' &&
            item.status !== 'out-of-service',
        ).length,
      )
    },
  )
})
