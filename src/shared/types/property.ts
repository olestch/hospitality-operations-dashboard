export interface Property {
  id: string
  name: string
  city: string
  country: string
  timezone: string
  roomCount: number
}

export type RoomStatus = 'available' | 'occupied' | 'maintenance' | 'out-of-service'

export interface Room {
  id: string
  propertyId: string
  name: string
  number: string
  type: string
  capacity: number
  status: RoomStatus
}
