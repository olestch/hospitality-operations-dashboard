import { describe, expect, it } from 'vitest'

import { mockBookings } from '@/mocks/data/bookings'
import { mockInspections } from '@/mocks/data/inspections'
import { mockInventory } from '@/mocks/data/inventory'
import { mockProperties } from '@/mocks/data/properties'
import { mockRevenueMetrics } from '@/mocks/data/revenue'
import { validateMockData } from '@/mocks/validateMockData'

describe('cross-feature demo cohesion', () => {
  it('satisfies all declared mock-data invariants', () => {
    expect(() => validateMockData()).not.toThrow()
  })

  it('gives every property a coherent record in each operational area', () => {
    for (const property of mockProperties) {
      expect(mockBookings.some((booking) => booking.propertyId === property.id)).toBe(true)
      expect(mockRevenueMetrics.some((metric) => metric.propertyId === property.id)).toBe(true)
      expect(mockInspections.some((inspection) => inspection.propertyId === property.id)).toBe(true)
      expect(mockInventory.some((item) => item.propertyId === property.id)).toBe(true)
    }
  })
})
