import { addDays, daysBetween, type DateRange } from '@/modules/bookings/utils/reservationTimeline'

export type AnalyticsPeriodPreset = 'last-7-days' | 'last-30-days' | 'full-demo-period'

export interface AnalyticsPeriod {
  preset: AnalyticsPeriodPreset
  label: string
  range: DateRange
  dayCount: number
}

const PRESET_DAYS: Partial<Record<AnalyticsPeriodPreset, number>> = {
  'last-7-days': 7,
  'last-30-days': 30,
}

export function resolveAnalyticsPeriod(
  preset: AnalyticsPeriodPreset,
  demoDate: string,
  demoPeriod: DateRange,
): AnalyticsPeriod {
  if (preset === 'full-demo-period') {
    return {
      preset,
      label: 'Full demo period',
      range: { ...demoPeriod },
      dayCount: Math.max(daysBetween(demoPeriod.start, demoPeriod.end) + 1, 0),
    }
  }

  const requestedDays = PRESET_DAYS[preset] ?? 1
  const end = demoDate > demoPeriod.end ? demoPeriod.end : demoDate
  const requestedStart = addDays(end, -(requestedDays - 1))
  const start = requestedStart < demoPeriod.start ? demoPeriod.start : requestedStart
  return {
    preset,
    label: preset === 'last-7-days' ? 'Last 7 days' : 'Last 30 days',
    range: { start, end },
    dayCount: Math.max(daysBetween(start, end) + 1, 0),
  }
}

export function getPreviousComparablePeriod(
  current: AnalyticsPeriod,
  demoPeriod: DateRange,
): DateRange | null {
  if (current.dayCount <= 0) return null
  const end = addDays(current.range.start, -1)
  const start = addDays(end, -(current.dayCount - 1))
  return start < demoPeriod.start ? null : { start, end }
}
