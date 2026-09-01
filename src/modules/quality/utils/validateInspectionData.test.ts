import { describe, expect, it } from 'vitest'

import type { Inspection, InspectionDetail } from '@/modules/quality/types/inspection'
import { validateInspectionData } from '@/modules/quality/utils/validateInspectionData'

function validInspection(): Inspection {
  return {
    id: 'ins-a',
    propertyId: 'property-a',
    title: 'Review',
    category: 'safety',
    area: 'Lobby',
    inspector: 'Inspector',
    scheduledDate: '2025-03-01',
    completedDate: '2025-03-01',
    status: 'completed',
    score: 90,
    categorySummaries: [
      {
        category: 'safety',
        score: 90,
        findingCount: 0,
        openFindingCount: 0,
        severeOpenFindingCount: 0,
        highestOpenSeverity: null,
      },
    ],
  }
}
function validDetail(summary: Inspection): InspectionDetail {
  return { ...summary, categoryScores: [{ category: 'safety', score: 90 }], findings: [] }
}
const propertyIds = new Set(['property-a'])

describe('inspection mock validation', () => {
  it('accepts coherent inspection data', () => {
    const summary = validInspection()
    expect(() =>
      validateInspectionData([summary], [validDetail(summary)], propertyIds),
    ).not.toThrow()
  })

  it('rejects scores outside 0–100', () => {
    const summary = { ...validInspection(), score: 101 }
    expect(() => validateInspectionData([summary], [validDetail(summary)], propertyIds)).toThrow(
      /score is outside/,
    )
  })

  it('rejects orphan details', () => {
    const summary = validInspection()
    expect(() => validateInspectionData([], [validDetail(summary)], propertyIds)).toThrow(
      /no inspection summary/,
    )
  })

  it('rejects missing details', () => {
    expect(() => validateInspectionData([validInspection()], [], propertyIds)).toThrow(
      /exactly one/,
    )
  })

  it('rejects duplicate detail records', () => {
    const summary = validInspection()
    const detail = validDetail(summary)
    expect(() => validateInspectionData([summary], [detail, detail], propertyIds)).toThrow(
      /exactly one/,
    )
  })

  it('rejects unknown property references', () => {
    const summary = { ...validInspection(), propertyId: 'missing' }
    expect(() => validateInspectionData([summary], [validDetail(summary)], propertyIds)).toThrow(
      /unknown property/,
    )
  })

  it('rejects duplicate finding ids across details', () => {
    const first = validInspection()
    const second = { ...validInspection(), id: 'ins-b' }
    const finding = {
      id: 'finding-a',
      category: 'safety' as const,
      title: 'Finding',
      description: 'Description',
      severity: 'high' as const,
      resolution: 'open' as const,
    }
    const findingSummary = [
      {
        category: 'safety' as const,
        score: 90,
        findingCount: 1,
        openFindingCount: 1,
        severeOpenFindingCount: 1,
        highestOpenSeverity: 'high' as const,
      },
    ]
    const firstWithFinding = { ...first, categorySummaries: findingSummary }
    const secondWithFinding = { ...second, categorySummaries: findingSummary }
    const details = [
      { ...validDetail(firstWithFinding), findings: [finding] },
      { ...validDetail(secondWithFinding), findings: [finding] },
    ]
    expect(() =>
      validateInspectionData([firstWithFinding, secondWithFinding], details, propertyIds),
    ).toThrow(/finding id is duplicated/)
  })

  it('rejects inconsistent completion state', () => {
    const summary = { ...validInspection(), status: 'scheduled' as const }
    expect(() => validateInspectionData([summary], [validDetail(summary)], propertyIds)).toThrow(
      /completion state/,
    )
  })

  it('rejects unknown status values at runtime', () => {
    const summary = { ...validInspection(), status: 'unknown' } as unknown as Inspection
    expect(() => validateInspectionData([summary], [validDetail(summary)], propertyIds)).toThrow(
      /unknown status/,
    )
  })

  it('rejects invalid category scores', () => {
    const summary = validInspection()
    const detail = {
      ...validDetail(summary),
      categoryScores: [{ category: 'safety' as const, score: -1 }],
    }
    expect(() => validateInspectionData([summary], [detail], propertyIds)).toThrow(
      /category score is outside/,
    )
  })

  it('rejects unknown finding severity values', () => {
    const summary = validInspection()
    const invalidFinding = {
      id: 'finding-a',
      category: 'safety',
      title: 'Finding',
      description: 'Description',
      severity: 'urgent',
      resolution: 'open',
    } as unknown as InspectionDetail['findings'][number]
    const detail = { ...validDetail(summary), findings: [invalidFinding] }
    expect(() => validateInspectionData([summary], [detail], propertyIds)).toThrow(
      /unknown severity/,
    )
  })
})
