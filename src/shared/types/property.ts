export interface Property {
  id: string
  name: string
  city: string
  country: string
  timezone: string
  roomCount: number
}

export type RoomStatus = 'available' | 'occupied' | 'maintenance' | 'out-of-service'
export const HOUSEKEEPING_STATUSES = ['dirty', 'cleaned', 'inspected'] as const
export type HousekeepingStatus = (typeof HOUSEKEEPING_STATUSES)[number]

export function isHousekeepingStatus(value: unknown): value is HousekeepingStatus {
  return HOUSEKEEPING_STATUSES.some((status) => status === value)
}

export interface Room {
  id: string
  propertyId: string
  name: string
  number: string
  type: string
  capacity: number
  status: RoomStatus
  housekeepingStatus: HousekeepingStatus
}
