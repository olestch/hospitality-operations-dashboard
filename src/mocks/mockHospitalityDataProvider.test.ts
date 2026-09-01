import { describe, expect, it } from 'vitest'

import { mockBookings } from '@/mocks/data/bookings'
import { mockHospitalityDataProvider } from '@/mocks/mockHospitalityDataProvider'

describe('mock booking range filtering', () => {
  it('excludes a stay that checks out exactly at dateFrom', async () => {
    const target = mockBookings.find((booking) => booking.status !== 'cancelled')
    expect(target).toBeDefined()
    if (!target) return

    const result = await mockHospitalityDataProvider.getBookings({
      roomId: target.roomId,
      dateFrom: target.checkOut,
      dateTo: target.checkOut,
    })
    expect(result.some((booking) => booking.id === target.id)).toBe(false)
  })

  it('includes a stay that checks in exactly at dateTo', async () => {
    const target = mockBookings.find((booking) => booking.status !== 'cancelled')
    expect(target).toBeDefined()
    if (!target) return

    const result = await mockHospitalityDataProvider.getBookings({
      roomId: target.roomId,
      dateFrom: target.checkIn,
      dateTo: target.checkIn,
    })
    expect(result.some((booking) => booking.id === target.id)).toBe(true)
  })
})
