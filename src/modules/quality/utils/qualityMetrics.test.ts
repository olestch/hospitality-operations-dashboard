import { describe, expect, it } from 'vitest'

import type { Inspection, InspectionFinding } from '@/modules/quality/types/inspection'
import {
  calculateCategoryBreakdown,
  calculateQualitySummary,
  countFindings,
  createQualityTrend,
  filterInspections,
  getHighestSeverity,
  getInspectionAttention,
  isFindingOpen,
  SEVERITY_ORDER,
} from '@/modules/quality/utils/qualityMetrics'

function inspection(overrides: Partial<Inspection> = {}): Inspection {
  return {
    id: 'ins-a',
    propertyId: 'property-a',
    title: 'Quality review',
    category: 'guest-room',
    area: 'Rooms',
    inspector: 'Inspector',
    scheduledDate: '2025-03-01',
    completedDate: '2025-03-01',
    status: 'completed',
    score: 90,
    categorySummaries: [
      {
        category: 'guest-room',
        score: 90,
        findingCount: 2,
        openFindingCount: 1,
        severeOpenFindingCount: 0,
        highestOpenSeverity: 'medium',
      },
    ],
    ...overrides,
  }
}

function finding(overrides: Partial<InspectionFinding> = {}): InspectionFinding {
  return {
    id: 'finding-a',
    category: 'guest-room',
    title: 'Finding',
    description: 'Description',
    severity: 'medium',
    resolution: 'open',
    ...overrides,
  }
}

describe('finding utilities', () => {
  it('defines strict ascending severity ordering', () => {
    expect(SEVERITY_ORDER.low).toBeLessThan(SEVERITY_ORDER.medium)
    expect(SEVERITY_ORDER.medium).toBeLessThan(SEVERITY_ORDER.high)
    expect(SEVERITY_ORDER.high).toBeLessThan(SEVERITY_ORDER.critical)
  })

  it('counts findings with an optional predicate', () => {
    const findings = [finding(), finding({ id: 'finding-b', resolution: 'resolved' })]
    expect(countFindings(findings)).toBe(2)
    expect(countFindings(findings, isFindingOpen)).toBe(1)
  })

  it('returns the highest severity and handles an empty list', () => {
    expect(
      getHighestSeverity([
        finding({ severity: 'low' }),
        finding({ id: 'b', severity: 'critical' }),
      ]),
    ).toBe('critical')
    expect(getHighestSeverity([])).toBeNull()
  })

  it.each([
    ['open', true],
    ['in-progress', true],
    ['resolved', false],
  ] as const)('classifies %s resolution as open=%s', (resolution, expected) => {
    expect(isFindingOpen(finding({ resolution }))).toBe(expected)
  })
})

describe('quality aggregation', () => {
  it('calculates completed average and finding totals', () => {
    const result = calculateQualitySummary([
      inspection(),
      inspection({
        id: 'ins-b',
        score: 70,
        categorySummaries: [
          {
            category: 'safety',
            score: 70,
            findingCount: 3,
            openFindingCount: 2,
            severeOpenFindingCount: 2,
            highestOpenSeverity: 'critical',
          },
        ],
      }),
      inspection({
        id: 'ins-c',
        status: 'scheduled',
        score: null,
        completedDate: null,
        categorySummaries: [],
      }),
    ])
    expect(result).toEqual({
      averageScore: 80,
      completedCount: 2,
      openFindingCount: 3,
      severeOpenFindingCount: 2,
    })
  })

  it('keeps average score unavailable without completed inspections', () => {
    expect(
      calculateQualitySummary([
        inspection({ status: 'scheduled', score: null, completedDate: null }),
      ]).averageScore,
    ).toBeNull()
    expect(calculateQualitySummary([]).averageScore).toBeNull()
  })

  it('aggregates category counts and averages', () => {
    const rows = calculateCategoryBreakdown([
      inspection(),
      inspection({
        id: 'ins-b',
        categorySummaries: [
          {
            category: 'guest-room',
            score: 70,
            findingCount: 1,
            openFindingCount: 1,
            severeOpenFindingCount: 1,
            highestOpenSeverity: 'high',
          },
        ],
      }),
    ])
    expect(rows).toEqual([
      {
        category: 'guest-room',
        findingCount: 3,
        openFindingCount: 2,
        severeOpenFindingCount: 1,
        averageScore: 80,
      },
    ])
  })

  it('builds a chronological completed-only trend', () => {
    const points = createQualityTrend([
      inspection({
        id: 'late',
        scheduledDate: '2025-03-03',
        completedDate: '2025-03-04',
        score: 88,
      }),
      inspection({ id: 'scheduled', status: 'scheduled', completedDate: null, score: null }),
      inspection({
        id: 'early',
        scheduledDate: '2025-01-01',
        completedDate: '2025-01-02',
        score: 91,
      }),
    ])
    expect(points.map((point) => point.inspectionId)).toEqual(['early', 'late'])
  })
})

describe('inspection filtering and attention', () => {
  const normal = inspection({ id: 'normal', scheduledDate: '2025-01-01', categorySummaries: [] })
  const warning = inspection({
    id: 'warning',
    scheduledDate: '2025-02-01',
    score: 79,
    category: 'housekeeping',
    categorySummaries: [],
  })
  const critical = inspection({
    id: 'critical',
    scheduledDate: '2025-03-01',
    category: 'safety',
    categorySummaries: [
      {
        category: 'safety',
        score: 68,
        findingCount: 1,
        openFindingCount: 1,
        severeOpenFindingCount: 1,
        highestOpenSeverity: 'critical',
      },
    ],
  })

  it('uses critical findings before score and severe warning rules', () => {
    expect(getInspectionAttention(normal)).toBe('normal')
    expect(getInspectionAttention(warning)).toBe('warning')
    expect(getInspectionAttention(critical)).toBe('critical')
  })

  it('combines filters and sorts newest first', () => {
    expect(
      filterInspections([normal, warning, critical], {
        status: 'completed',
        attention: 'critical',
        category: 'safety',
      }).map((item) => item.id),
    ).toEqual(['critical'])
  })

  it('returns the newest-first complete list when filters are reset', () => {
    expect(
      filterInspections([normal, warning, critical], {
        status: null,
        attention: null,
        category: null,
      }).map((item) => item.id),
    ).toEqual(['critical', 'warning', 'normal'])
  })
})
