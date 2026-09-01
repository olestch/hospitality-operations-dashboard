import type {
  FindingResolution,
  FindingSeverity,
  Inspection,
  InspectionCategory,
  InspectionCategoryScore,
  InspectionDetail,
  InspectionFinding,
  InspectionStatus,
} from '@/modules/quality/types/inspection'

interface InspectionSeed {
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
  categoryScores?: InspectionCategoryScore[]
  findings?: InspectionFinding[]
  notes?: string
}

function makeFinding(
  id: string,
  category: InspectionCategory,
  severity: FindingSeverity,
  resolution: FindingResolution,
  title: string,
  location: string,
): InspectionFinding {
  return {
    id,
    category,
    severity,
    resolution,
    title,
    location,
    description: `${title} requires documented operational follow-up.`,
  }
}

function makeDetail(seed: InspectionSeed): InspectionDetail {
  const findings = seed.findings ?? []
  const categoryScores = seed.categoryScores ?? []
  const categories = new Set([
    seed.category,
    ...categoryScores.map((item) => item.category),
    ...findings.map((item) => item.category),
  ])
  const categorySummaries = [...categories].map((category) => {
    const categoryFindings = findings.filter((finding) => finding.category === category)
    const openFindings = categoryFindings.filter((finding) => finding.resolution !== 'resolved')
    const highestOpenSeverity = openFindings.reduce<FindingSeverity | null>((highest, finding) => {
      const order: Record<FindingSeverity, number> = { low: 0, medium: 1, high: 2, critical: 3 }
      return !highest || order[finding.severity] > order[highest] ? finding.severity : highest
    }, null)
    return {
      category,
      score: categoryScores.find((item) => item.category === category)?.score ?? null,
      findingCount: categoryFindings.length,
      openFindingCount: openFindings.length,
      severeOpenFindingCount: openFindings.filter(
        (finding) => finding.severity === 'high' || finding.severity === 'critical',
      ).length,
      highestOpenSeverity,
    }
  })

  return { ...seed, categoryScores, findings, categorySummaries }
}

const inspectionDetails: InspectionDetail[] = [
  makeDetail({
    id: 'ins-001',
    propertyId: 'prop-north-quay',
    title: 'January guest room review',
    category: 'guest-room',
    area: 'Rooms 201–220',
    inspector: 'Maya Chen',
    scheduledDate: '2025-01-09',
    completedDate: '2025-01-09',
    status: 'completed',
    score: 94,
    categoryScores: [
      { category: 'guest-room', score: 96 },
      { category: 'housekeeping', score: 92 },
    ],
    findings: [
      makeFinding(
        'find-001',
        'housekeeping',
        'low',
        'resolved',
        'Replace worn shower seal',
        'Room 214',
      ),
    ],
    notes: 'Guest rooms were consistently prepared and service-ready.',
  }),
  makeDetail({
    id: 'ins-002',
    propertyId: 'prop-north-quay',
    title: 'Housekeeping process review',
    category: 'housekeeping',
    area: 'Housekeeping and linen rooms',
    inspector: 'Jon Bell',
    scheduledDate: '2025-02-18',
    completedDate: '2025-02-19',
    status: 'completed',
    score: 76,
    categoryScores: [
      { category: 'housekeeping', score: 74 },
      { category: 'safety', score: 78 },
    ],
    findings: [
      makeFinding(
        'find-002',
        'housekeeping',
        'high',
        'open',
        'Restore chemical labelling',
        'Linen room',
      ),
      makeFinding(
        'find-003',
        'safety',
        'medium',
        'in-progress',
        'Clear emergency access route',
        'Level 2',
      ),
    ],
  }),
  makeDetail({
    id: 'ins-003',
    propertyId: 'prop-north-quay',
    title: 'Quarterly safety review',
    category: 'safety',
    area: 'All guest floors',
    inspector: 'Priya Rao',
    scheduledDate: '2025-03-12',
    completedDate: '2025-03-12',
    status: 'completed',
    score: 68,
    categoryScores: [{ category: 'safety', score: 68 }],
    findings: [
      makeFinding(
        'find-004',
        'safety',
        'critical',
        'open',
        'Repair fire-door closer',
        'East stairwell',
      ),
      makeFinding(
        'find-005',
        'safety',
        'high',
        'open',
        'Replace expired extinguisher tag',
        'Level 3',
      ),
      makeFinding('find-006', 'public-area', 'low', 'resolved', 'Secure directional sign', 'Lobby'),
    ],
  }),
  makeDetail({
    id: 'ins-004',
    propertyId: 'prop-north-quay',
    title: 'Spring public area walk-through',
    category: 'public-area',
    area: 'Lobby and guest corridors',
    inspector: 'Maya Chen',
    scheduledDate: '2025-03-24',
    completedDate: null,
    status: 'scheduled',
    score: null,
  }),
  makeDetail({
    id: 'ins-005',
    propertyId: 'prop-maple-court',
    title: 'Public area standards review',
    category: 'public-area',
    area: 'Arrival and lobby',
    inspector: 'Jon Bell',
    scheduledDate: '2025-01-21',
    completedDate: '2025-01-21',
    status: 'completed',
    score: 88,
    categoryScores: [{ category: 'public-area', score: 88 }],
    findings: [
      makeFinding(
        'find-007',
        'public-area',
        'medium',
        'open',
        'Adjust entrance door closer',
        'Main entrance',
      ),
    ],
  }),
  makeDetail({
    id: 'ins-006',
    propertyId: 'prop-maple-court',
    title: 'February guest room review',
    category: 'guest-room',
    area: 'Rooms 101–118',
    inspector: 'Maya Chen',
    scheduledDate: '2025-02-25',
    completedDate: '2025-02-25',
    status: 'completed',
    score: 92,
    categoryScores: [
      { category: 'guest-room', score: 94 },
      { category: 'housekeeping', score: 90 },
    ],
    findings: [
      makeFinding(
        'find-008',
        'guest-room',
        'low',
        'resolved',
        'Replace scratched bedside tray',
        'Room 112',
      ),
    ],
  }),
  makeDetail({
    id: 'ins-007',
    propertyId: 'prop-maple-court',
    title: 'Kitchen hygiene review',
    category: 'food-safety',
    area: 'Main kitchen and stores',
    inspector: 'Priya Rao',
    scheduledDate: '2025-03-08',
    completedDate: '2025-03-08',
    status: 'completed',
    score: 79,
    categoryScores: [{ category: 'food-safety', score: 79 }],
    findings: [
      makeFinding(
        'find-009',
        'food-safety',
        'high',
        'in-progress',
        'Correct cold-store temperature log',
        'Cold store',
      ),
      makeFinding(
        'find-010',
        'food-safety',
        'medium',
        'resolved',
        'Relabel dry goods containers',
        'Dry store',
      ),
    ],
  }),
  makeDetail({
    id: 'ins-008',
    propertyId: 'prop-maple-court',
    title: 'Quarterly inventory review',
    category: 'inventory',
    area: 'Guest floors',
    inspector: 'Jon Bell',
    scheduledDate: '2025-03-28',
    completedDate: null,
    status: 'scheduled',
    score: null,
  }),
  makeDetail({
    id: 'ins-009',
    propertyId: 'prop-sunfield',
    title: 'Fire readiness review',
    category: 'safety',
    area: 'Back of house and guest floors',
    inspector: 'Priya Rao',
    scheduledDate: '2025-01-30',
    completedDate: '2025-01-30',
    status: 'completed',
    score: 97,
    categoryScores: [{ category: 'safety', score: 97 }],
    findings: [],
  }),
  makeDetail({
    id: 'ins-010',
    propertyId: 'prop-sunfield',
    title: 'Guest room quality review',
    category: 'guest-room',
    area: 'Rooms 301–316',
    inspector: 'Maya Chen',
    scheduledDate: '2025-02-20',
    completedDate: '2025-02-20',
    status: 'completed',
    score: 84,
    categoryScores: [
      { category: 'guest-room', score: 86 },
      { category: 'housekeeping', score: 82 },
    ],
    findings: [
      makeFinding('find-011', 'guest-room', 'medium', 'open', 'Repair wardrobe hinge', 'Room 309'),
    ],
  }),
  makeDetail({
    id: 'ins-011',
    propertyId: 'prop-sunfield',
    title: 'Kitchen hygiene review',
    category: 'food-safety',
    area: 'Kitchen and breakfast service',
    inspector: 'Jon Bell',
    scheduledDate: '2025-03-07',
    completedDate: '2025-03-07',
    status: 'completed',
    score: 90,
    categoryScores: [{ category: 'food-safety', score: 90 }],
    findings: [
      makeFinding(
        'find-012',
        'food-safety',
        'low',
        'resolved',
        'Renew cleaning schedule display',
        'Kitchen entrance',
      ),
    ],
  }),
  makeDetail({
    id: 'ins-012',
    propertyId: 'prop-sunfield',
    title: 'Public area follow-up',
    category: 'public-area',
    area: 'Lobby and restaurant',
    inspector: 'Priya Rao',
    scheduledDate: '2025-03-19',
    completedDate: null,
    status: 'in-progress',
    score: null,
    findings: [
      makeFinding(
        'find-013',
        'public-area',
        'high',
        'open',
        'Isolate damaged lobby socket',
        'Lobby',
      ),
    ],
  }),
]

export const mockInspectionDetails: readonly InspectionDetail[] = inspectionDetails
export const mockInspections: readonly Inspection[] = inspectionDetails.map((detail) => ({
  id: detail.id,
  propertyId: detail.propertyId,
  title: detail.title,
  category: detail.category,
  area: detail.area,
  inspector: detail.inspector,
  scheduledDate: detail.scheduledDate,
  completedDate: detail.completedDate,
  status: detail.status,
  score: detail.score,
  categorySummaries: detail.categorySummaries,
}))
