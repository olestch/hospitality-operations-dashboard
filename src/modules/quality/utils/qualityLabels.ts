import type {
  FindingResolution,
  FindingSeverity,
  InspectionCategory,
  InspectionStatus,
} from '@/modules/quality/types/inspection'
import type { InspectionAttention } from '@/modules/quality/utils/qualityMetrics'

const labels = {
  'guest-room': 'Guest room',
  'public-area': 'Public area',
  safety: 'Safety',
  housekeeping: 'Housekeeping',
  'food-safety': 'Food safety',
  inventory: 'Inventory',
  scheduled: 'Scheduled',
  'in-progress': 'In progress',
  completed: 'Completed',
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
  open: 'Open',
  resolved: 'Resolved',
  normal: 'Normal',
  warning: 'Needs attention',
} as const

export function formatQualityLabel(
  value:
    | InspectionCategory
    | InspectionStatus
    | FindingSeverity
    | FindingResolution
    | InspectionAttention,
): string {
  return labels[value]
}
