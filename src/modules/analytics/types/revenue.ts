export type RevenuePeriod = 'day' | 'month'

export interface RevenueMetric {
  date: string
  period: RevenuePeriod
  propertyId: string
  revenue: number
  occupancyRate: number
  adr: number
  revpar: number
  occupiedRoomNights: number
  sellableRoomNights: number
}

export interface RevenueMetricFilters {
  propertyId?: string
  period?: RevenuePeriod
  dateFrom?: string
  dateTo?: string
}

export type HospitalityMetricKey = 'revenue' | 'occupancy' | 'adr' | 'revpar'
