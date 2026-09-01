import type {
  FindingSeverity,
  Inspection,
  InspectionCategory,
  InspectionFinding,
  InspectionStatus,
} from '@/modules/quality/types/inspection'

export const QUALITY_WARNING_SCORE = 80
export const SEVERITY_ORDER: Readonly<Record<FindingSeverity, number>> = {
  low: 0,
  medium: 1,
  high: 2,
  critical: 3,
}

export type InspectionAttention = 'normal' | 'warning' | 'critical'
export type AttentionFilter = InspectionAttention | null

export interface QualitySummary {
  averageScore: number | null
  completedCount: number
  openFindingCount: number
  severeOpenFindingCount: number
}

export interface CategoryBreakdown {
  category: InspectionCategory
  findingCount: number
  openFindingCount: number
  severeOpenFindingCount: number
  averageScore: number | null
}

export interface QualityTrendPoint {
  inspectionId: string
  date: string
  score: number
}

export interface InspectionListFilters {
  status: InspectionStatus | null
  attention: AttentionFilter
  category: InspectionCategory | null
}

export function isFindingOpen(finding: InspectionFinding): boolean {
  return finding.resolution !== 'resolved'
}

export function countFindings(
  findings: readonly InspectionFinding[],
  predicate: (finding: InspectionFinding) => boolean = () => true,
): number {
  return findings.filter(predicate).length
}

export function getHighestSeverity(findings: readonly InspectionFinding[]): FindingSeverity | null {
  return findings.reduce<FindingSeverity | null>((highest, finding) => {
    if (!highest || SEVERITY_ORDER[finding.severity] > SEVERITY_ORDER[highest]) {
      return finding.severity
    }
    return highest
  }, null)
}

export function getInspectionAttention(inspection: Inspection): InspectionAttention {
  const severeOpen = inspection.categorySummaries.some(
    (summary) => summary.severeOpenFindingCount > 0,
  )
  const criticalOpen = inspection.categorySummaries.some(
    (summary) => summary.highestOpenSeverity === 'critical',
  )
  if (criticalOpen) return 'critical'
  if (severeOpen || (inspection.score !== null && inspection.score < QUALITY_WARNING_SCORE)) {
    return 'warning'
  }
  return 'normal'
}

export function calculateQualitySummary(inspections: readonly Inspection[]): QualitySummary {
  const completed = inspections.filter(
    (inspection): inspection is Inspection & { score: number } =>
      inspection.status === 'completed' && inspection.score !== null,
  )
  const openFindingCount = inspections.reduce(
    (total, inspection) =>
      total + inspection.categorySummaries.reduce((sum, item) => sum + item.openFindingCount, 0),
    0,
  )
  const severeOpenFindingCount = inspections.reduce(
    (total, inspection) =>
      total +
      inspection.categorySummaries.reduce((sum, item) => sum + item.severeOpenFindingCount, 0),
    0,
  )
  return {
    averageScore: completed.length
      ? completed.reduce((sum, inspection) => sum + inspection.score, 0) / completed.length
      : null,
    completedCount: completed.length,
    openFindingCount,
    severeOpenFindingCount,
  }
}

export function createQualityTrend(inspections: readonly Inspection[]): QualityTrendPoint[] {
  return inspections
    .filter(
      (inspection): inspection is Inspection & { completedDate: string; score: number } =>
        inspection.status === 'completed' &&
        inspection.completedDate !== null &&
        inspection.score !== null,
    )
    .map((inspection) => ({
      inspectionId: inspection.id,
      date: inspection.completedDate,
      score: inspection.score,
    }))
    .sort((first, second) => first.date.localeCompare(second.date))
}

export function calculateCategoryBreakdown(
  inspections: readonly Inspection[],
): CategoryBreakdown[] {
  const categories = new Map<
    InspectionCategory,
    { findingCount: number; open: number; severe: number; scores: number[] }
  >()
  for (const inspection of inspections) {
    for (const summary of inspection.categorySummaries) {
      const current = categories.get(summary.category) ?? {
        findingCount: 0,
        open: 0,
        severe: 0,
        scores: [],
      }
      current.findingCount += summary.findingCount
      current.open += summary.openFindingCount
      current.severe += summary.severeOpenFindingCount
      if (summary.score !== null) current.scores.push(summary.score)
      categories.set(summary.category, current)
    }
  }
  return [...categories.entries()]
    .map(([category, values]) => ({
      category,
      findingCount: values.findingCount,
      openFindingCount: values.open,
      severeOpenFindingCount: values.severe,
      averageScore: values.scores.length
        ? values.scores.reduce((sum, score) => sum + score, 0) / values.scores.length
        : null,
    }))
    .sort((first, second) => second.openFindingCount - first.openFindingCount)
}

export function filterInspections(
  inspections: readonly Inspection[],
  filters: InspectionListFilters,
): Inspection[] {
  return inspections
    .filter(
      (inspection) =>
        (!filters.status || inspection.status === filters.status) &&
        (!filters.attention || getInspectionAttention(inspection) === filters.attention) &&
        (!filters.category ||
          inspection.category === filters.category ||
          inspection.categorySummaries.some((item) => item.category === filters.category)),
    )
    .sort((first, second) => second.scheduledDate.localeCompare(first.scheduledDate))
}
