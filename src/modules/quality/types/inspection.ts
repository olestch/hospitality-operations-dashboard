export type InspectionStatus = 'scheduled' | 'completed'
export type InspectionCheckStatus = 'pass' | 'fail' | 'not-applicable'

export interface InspectionCheck {
  id: string
  label: string
  status: InspectionCheckStatus
  note?: string
  photos?: string[]
}

export interface InspectionChecklistGroup {
  id: string
  title: string
  checks: InspectionCheck[]
}

export interface InspectionSection {
  id: string
  title: string
  groups: InspectionChecklistGroup[]
}

export interface Inspection {
  id: string
  propertyId: string
  title: string
  type: string
  scheduledDate: string
  completedDate: string | null
  status: InspectionStatus
  score: number | null
  violations: number
}

export interface InspectionDetail extends Inspection {
  sections: InspectionSection[]
}

export interface InspectionFilters {
  propertyId?: string
  status?: InspectionStatus
  dateFrom?: string
  dateTo?: string
}
