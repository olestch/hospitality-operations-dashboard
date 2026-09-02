import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { usePropertyStore } from '@/app/stores/propertyStore'
import { getBookings } from '@/modules/bookings/api/bookingsRepository'
import { useBookingsStore } from '@/modules/bookings/stores/bookingsStore'
import { getRooms } from '@/shared/api/propertiesRepository'
import type { Property, Room } from '@/shared/types/property'

vi.mock('@/modules/bookings/api/bookingsRepository', () => ({ getBookings: vi.fn() }))
vi.mock('@/shared/api/propertiesRepository', () => ({ getRooms: vi.fn() }))

describe('booking filter state', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.mocked(getBookings).mockReset()
    vi.mocked(getRooms).mockReset()
  })

  it('resets every filter without reloading repository data', () => {
    const store = useBookingsStore()
    store.statusFilter = 'confirmed'
    store.sourceFilter = 'Direct'
    store.roomTypeFilter = 'Suite'

    store.resetFilters()

    expect(store.statusFilter).toBeNull()
    expect(store.sourceFilter).toBeNull()
    expect(store.roomTypeFilter).toBeNull()
    expect(getBookings).not.toHaveBeenCalled()
    expect(getRooms).not.toHaveBeenCalled()
  })

  it('keeps room readiness independent from local reservation filters', async () => {
    const property: Property = {
      id: 'property-1',
      name: 'Property 1',
      city: 'Alder',
      country: 'Norland',
      timezone: 'Europe/Lisbon',
      roomCount: 1,
    }
    const room: Room = {
      id: 'room-1',
      propertyId: property.id,
      name: 'Room 1',
      number: '1',
      type: 'Standard',
      capacity: 2,
      status: 'available',
      housekeepingStatus: 'inspected',
    }
    vi.mocked(getRooms).mockResolvedValue([room])
    vi.mocked(getBookings).mockResolvedValue([])
    const propertyStore = usePropertyStore()
    propertyStore.properties = [property]
    const store = useBookingsStore()

    propertyStore.selectedPropertyId = property.id
    await vi.waitFor(() => expect(store.status).toBe('success'))
    expect(store.housekeepingReadiness).toEqual({
      counts: { dirty: 0, cleaned: 0, inspected: 1 },
      totalRooms: 1,
    })
    const roomRequests = vi.mocked(getRooms).mock.calls.length
    const bookingRequests = vi.mocked(getBookings).mock.calls.length

    store.statusFilter = 'confirmed'
    store.sourceFilter = 'Direct'
    store.roomTypeFilter = 'Standard'

    expect(store.housekeepingReadiness.totalRooms).toBe(1)
    expect(getRooms).toHaveBeenCalledTimes(roomRequests)
    expect(getBookings).toHaveBeenCalledTimes(bookingRequests)
  })
})
