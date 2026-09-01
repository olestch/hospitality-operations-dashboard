import type { Inspection, InspectionDetail } from '@/modules/quality/types/inspection'

export const mockInspections: readonly Inspection[] = [
  {
    id: 'ins-001',
    propertyId: 'prop-north-quay',
    title: 'January guest room review',
    type: 'Room quality',
    scheduledDate: '2025-01-09',
    completedDate: '2025-01-09',
    status: 'completed',
    score: 94,
    violations: 1,
  },
  {
    id: 'ins-002',
    propertyId: 'prop-maple-court',
    title: 'Public area standards review',
    type: 'Public areas',
    scheduledDate: '2025-01-21',
    completedDate: '2025-01-21',
    status: 'completed',
    score: 88,
    violations: 2,
  },
  {
    id: 'ins-003',
    propertyId: 'prop-sunfield',
    title: 'Fire readiness review',
    type: 'Safety',
    scheduledDate: '2025-02-04',
    completedDate: '2025-02-04',
    status: 'completed',
    score: 97,
    violations: 0,
  },
  {
    id: 'ins-004',
    propertyId: 'prop-north-quay',
    title: 'Housekeeping process review',
    type: 'Operations',
    scheduledDate: '2025-02-18',
    completedDate: '2025-02-19',
    status: 'completed',
    score: 91,
    violations: 1,
  },
  {
    id: 'ins-005',
    propertyId: 'prop-maple-court',
    title: 'February guest room review',
    type: 'Room quality',
    scheduledDate: '2025-02-25',
    completedDate: '2025-02-25',
    status: 'completed',
    score: 92,
    violations: 1,
  },
  {
    id: 'ins-006',
    propertyId: 'prop-sunfield',
    title: 'Kitchen hygiene review',
    type: 'Food safety',
    scheduledDate: '2025-03-07',
    completedDate: '2025-03-07',
    status: 'completed',
    score: 90,
    violations: 2,
  },
  {
    id: 'ins-007',
    propertyId: 'prop-north-quay',
    title: 'Quarterly safety review',
    type: 'Safety',
    scheduledDate: '2025-03-24',
    completedDate: null,
    status: 'scheduled',
    score: null,
    violations: 0,
  },
  {
    id: 'ins-008',
    propertyId: 'prop-maple-court',
    title: 'Quarterly inventory review',
    type: 'Inventory',
    scheduledDate: '2025-03-28',
    completedDate: null,
    status: 'scheduled',
    score: null,
    violations: 0,
  },
]

export const mockInspectionDetails: readonly InspectionDetail[] = [
  {
    ...mockInspections[0]!,
    sections: [
      {
        id: 'sec-001-room',
        title: 'Guest room',
        groups: [
          {
            id: 'grp-001-sleep',
            title: 'Sleeping area',
            checks: [
              { id: 'chk-001-bed', label: 'Bed presentation meets standard', status: 'pass' },
              { id: 'chk-001-light', label: 'All lighting is operational', status: 'pass' },
            ],
          },
          {
            id: 'grp-001-bath',
            title: 'Bathroom',
            checks: [
              { id: 'chk-001-linen', label: 'Linen set is complete', status: 'pass' },
              {
                id: 'chk-001-seal',
                label: 'Shower seals are intact',
                status: 'fail',
                note: 'Minor wear recorded for follow-up.',
                photos: [],
              },
            ],
          },
        ],
      },
      {
        id: 'sec-001-service',
        title: 'Service readiness',
        groups: [
          {
            id: 'grp-001-info',
            title: 'Guest information',
            checks: [
              { id: 'chk-001-guide', label: 'Current guest guide is available', status: 'pass' },
              { id: 'chk-001-menu', label: 'Dining information is current', status: 'pass' },
            ],
          },
        ],
      },
    ],
  },
  {
    ...mockInspections[1]!,
    sections: [
      {
        id: 'sec-002-arrival',
        title: 'Arrival experience',
        groups: [
          {
            id: 'grp-002-entry',
            title: 'Entrance',
            checks: [
              { id: 'chk-002-sign', label: 'Entry signage is clear', status: 'pass' },
              {
                id: 'chk-002-door',
                label: 'Entrance doors operate quietly',
                status: 'fail',
                note: 'Closer requires adjustment.',
              },
            ],
          },
          {
            id: 'grp-002-lobby',
            title: 'Lobby',
            checks: [
              { id: 'chk-002-seat', label: 'Seating is clean and undamaged', status: 'pass' },
              {
                id: 'chk-002-display',
                label: 'Information display is current',
                status: 'fail',
                note: 'One outdated notice removed.',
              },
            ],
          },
        ],
      },
      {
        id: 'sec-002-access',
        title: 'Accessibility',
        groups: [
          {
            id: 'grp-002-route',
            title: 'Guest route',
            checks: [
              { id: 'chk-002-clear', label: 'Primary route is unobstructed', status: 'pass' },
              { id: 'chk-002-lift', label: 'Lift controls are legible', status: 'pass' },
            ],
          },
        ],
      },
    ],
  },
]
