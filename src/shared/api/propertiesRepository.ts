import { dataProvider } from '@/data'
import { DataNotFoundError } from '@/shared/api/errors'
import type { Property, Room } from '@/shared/types/property'

export async function getProperties(): Promise<Property[]> {
  return dataProvider.getProperties()
}

export async function getProperty(id: string): Promise<Property> {
  const property = await dataProvider.getProperty(id)
  if (!property) throw new DataNotFoundError('Property', id)
  return property
}

export async function getRooms(propertyId: string): Promise<Room[]> {
  return dataProvider.getRooms(propertyId)
}
