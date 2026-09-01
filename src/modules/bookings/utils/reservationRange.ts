import { addDays } from '@/modules/bookings/utils/reservationTimeline'

import type { DateRange } from '@/modules/bookings/utils/reservationTimeline'

export interface ReservationRangeConfig {
  period: DateRange
  preferredStart: string
  visibleDayCount: number
}

export function createVisibleRange(start: string, visibleDayCount: number): DateRange {
  return { start, end: addDays(start, visibleDayCount - 1) }
}

export function createRangeStarts({
  period,
  preferredStart,
  visibleDayCount,
}: ReservationRangeConfig): string[] {
  if (visibleDayCount <= 0 || period.start > period.end) return []

  const latestStart = addDays(period.end, -(visibleDayCount - 1))
  const effectiveLatestStart = latestStart < period.start ? period.start : latestStart
  const initialStart = clamp(preferredStart, period.start, effectiveLatestStart)
  const starts = [initialStart]

  let cursor = initialStart
  while (cursor > period.start) {
    const previous = clamp(addDays(cursor, -visibleDayCount), period.start, effectiveLatestStart)
    if (previous === cursor) break
    starts.unshift(previous)
    cursor = previous
  }

  cursor = initialStart
  while (cursor < effectiveLatestStart) {
    const next = clamp(addDays(cursor, visibleDayCount), period.start, effectiveLatestStart)
    if (next === cursor) break
    starts.push(next)
    cursor = next
  }

  return starts
}

export function getAdjacentRangeStart(
  currentStart: string,
  direction: -1 | 1,
  rangeStarts: readonly string[],
): string {
  const currentIndex = rangeStarts.indexOf(currentStart)
  if (currentIndex < 0) return rangeStarts[0] ?? currentStart
  return rangeStarts[currentIndex + direction] ?? currentStart
}

function clamp(value: string, minimum: string, maximum: string): string {
  if (value < minimum) return minimum
  if (value > maximum) return maximum
  return value
}
