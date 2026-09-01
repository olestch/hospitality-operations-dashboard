export const INSPECTION_STATUSES = ['scheduled', 'in-progress', 'completed'] as const
export type InspectionStatus = (typeof INSPECTION_STATUSES)[number]

export const INSPECTION_CATEGORIES = [
  'guest-room',
  'public-area',
  'safety',
  'housekeeping',
  'food-safety',
  'inventory',
] as const
export type InspectionCategory = (typeof INSPECTION_CATEGORIES)[number]

export const FINDING_SEVERITIES = ['low', 'medium', 'high', 'critical'] as const
export type FindingSeverity = (typeof FINDING_SEVERITIES)[number]

export const FINDING_RESOLUTIONS = ['open', 'in-progress', 'resolved'] as const
export type FindingResolution = (typeof FINDING_RESOLUTIONS)[number]

export interface InspectionCategorySummary {
  category: InspectionCategory
  score: number | null
  findingCount: number
  openFindingCount: number
  severeOpenFindingCount: number
  highestOpenSeverity: FindingSeverity | null
}

export interface Inspection {
  id: string
  propertyId: string
  title: string
  category: InspectionCategory
  area: string
  inspector: string
  scheduledDate: string
  completedDate: string | null
  status: InspectionStatus
  score: number | null
  categorySummaries: InspectionCategorySummary[]
}

export interface InspectionFinding {
  id: string
  category: InspectionCategory
  title: string
  description: string
  severity: FindingSeverity
  resolution: FindingResolution
  location?: string
  notes?: string
}

export interface InspectionCategoryScore {
  category: InspectionCategory
  score: number
}

export interface InspectionDetail extends Inspection {
  categoryScores: InspectionCategoryScore[]
  findings: InspectionFinding[]
  notes?: string
}

export interface InspectionFilters {
  propertyId?: string
  status?: InspectionStatus
  dateFrom?: string
  dateTo?: string
}
