import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getBookings } from '@/modules/bookings/api/bookingsRepository'
import { useBookingsStore } from '@/modules/bookings/stores/bookingsStore'
import { getRooms } from '@/shared/api/propertiesRepository'

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
})
