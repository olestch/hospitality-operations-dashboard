export type InventoryStatus = 'present' | 'missing' | 'damaged'

export interface InventoryItem {
  id: string
  propertyId: string
  roomId: string
  location: string
  name: string
  inventoryNumber: string
  cost: number
  lastInspectionDate: string
  status: InventoryStatus
  photos: string[]
}

export interface InventoryFilters {
  propertyId?: string
  roomId?: string
  status?: InventoryStatus
  location?: string
}
