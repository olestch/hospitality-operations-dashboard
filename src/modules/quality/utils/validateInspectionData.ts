import type { Inspection, InspectionDetail } from '@/modules/quality/types/inspection'
import {
  FINDING_RESOLUTIONS,
  FINDING_SEVERITIES,
  INSPECTION_CATEGORIES,
  INSPECTION_STATUSES,
} from '@/modules/quality/types/inspection'

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) throw new Error(`Mock data integrity error: ${message}`)
}

function validScore(score: number | null): boolean {
  return score === null || (Number.isFinite(score) && score >= 0 && score <= 100)
}

const severityOrder = { low: 0, medium: 1, high: 2, critical: 3 } as const

export function validateInspectionData(
  inspections: readonly Inspection[],
  details: readonly InspectionDetail[],
  propertyIds: ReadonlySet<string>,
): void {
  const inspectionIds = new Set<string>()
  const findingIds = new Set<string>()

  for (const inspection of inspections) {
    assert(!inspectionIds.has(inspection.id), `${inspection.id} inspection id is duplicated`)
    inspectionIds.add(inspection.id)
    assert(
      propertyIds.has(inspection.propertyId),
      `${inspection.id} references an unknown property`,
    )
    assert(
      INSPECTION_STATUSES.includes(inspection.status),
      `${inspection.id} has an unknown status`,
    )
    assert(
      INSPECTION_CATEGORIES.includes(inspection.category),
      `${inspection.id} has an unknown category`,
    )
    assert(validScore(inspection.score), `${inspection.id} score is outside 0–100`)
    assert(
      inspection.status === 'completed'
        ? inspection.completedDate !== null && inspection.score !== null
        : inspection.completedDate === null && inspection.score === null,
      `${inspection.id} completion state is inconsistent`,
    )
    for (const summary of inspection.categorySummaries) {
      assert(
        INSPECTION_CATEGORIES.includes(summary.category),
        `${inspection.id} summary has an unknown category`,
      )
      assert(validScore(summary.score), `${inspection.id} category score is outside 0–100`)
      assert(
        summary.openFindingCount <= summary.findingCount &&
          summary.severeOpenFindingCount <= summary.openFindingCount,
        `${inspection.id} finding summary counts are inconsistent`,
      )
      assert(
        summary.highestOpenSeverity === null ||
          FINDING_SEVERITIES.includes(summary.highestOpenSeverity),
        `${inspection.id} finding summary has unknown severity`,
      )
    }
  }

  const detailCounts = new Map<string, number>()
  for (const detail of details) {
    assert(inspectionIds.has(detail.id), `${detail.id} detail has no inspection summary`)
    detailCounts.set(detail.id, (detailCounts.get(detail.id) ?? 0) + 1)
    for (const categoryScore of detail.categoryScores) {
      assert(
        INSPECTION_CATEGORIES.includes(categoryScore.category),
        `${detail.id} category score has an unknown category`,
      )
      assert(validScore(categoryScore.score), `${detail.id} category score is outside 0–100`)
    }
    for (const finding of detail.findings) {
      assert(!findingIds.has(finding.id), `${finding.id} finding id is duplicated`)
      findingIds.add(finding.id)
      assert(
        INSPECTION_CATEGORIES.includes(finding.category),
        `${finding.id} has an unknown category`,
      )
      assert(FINDING_SEVERITIES.includes(finding.severity), `${finding.id} has unknown severity`)
      assert(
        FINDING_RESOLUTIONS.includes(finding.resolution),
        `${finding.id} has unknown resolution`,
      )
    }

    const summary = inspections.find((inspection) => inspection.id === detail.id)
    if (summary) {
      assert(
        summary.propertyId === detail.propertyId,
        `${detail.id} detail property is inconsistent`,
      )
      assert(summary.status === detail.status, `${detail.id} detail status is inconsistent`)
      assert(summary.score === detail.score, `${detail.id} detail score is inconsistent`)
    }
    assert(
      detail.status === 'completed'
        ? detail.categoryScores.length > 0
        : detail.categoryScores.length === 0,
      `${detail.id} category scores are inconsistent with inspection status`,
    )
    const summarizedCategories = new Set(detail.categorySummaries.map((item) => item.category))
    assert(
      detail.categoryScores.every((item) => summarizedCategories.has(item.category)) &&
        detail.findings.every((finding) => summarizedCategories.has(finding.category)),
      `${detail.id} has category data without a matching summary`,
    )
    for (const categorySummary of detail.categorySummaries) {
      const findings = detail.findings.filter(
        (finding) => finding.category === categorySummary.category,
      )
      const openFindings = findings.filter((finding) => finding.resolution !== 'resolved')
      const highestOpenSeverity = openFindings.reduce<(typeof FINDING_SEVERITIES)[number] | null>(
        (highest, finding) =>
          !highest || severityOrder[finding.severity] > severityOrder[highest]
            ? finding.severity
            : highest,
        null,
      )
      assert(
        categorySummary.findingCount === findings.length &&
          categorySummary.openFindingCount === openFindings.length &&
          categorySummary.severeOpenFindingCount ===
            openFindings.filter(
              (finding) => finding.severity === 'high' || finding.severity === 'critical',
            ).length &&
          categorySummary.highestOpenSeverity === highestOpenSeverity,
        `${detail.id} finding summary does not match detail`,
      )
      assert(
        categorySummary.score ===
          (detail.categoryScores.find((item) => item.category === categorySummary.category)
            ?.score ?? null),
        `${detail.id} category score does not match detail`,
      )
    }
  }

  for (const inspection of inspections) {
    assert(
      detailCounts.get(inspection.id) === 1,
      `${inspection.id} must have exactly one inspection detail`,
    )
  }
}
