export type MetricDirection = 'up' | 'down' | 'flat' | 'unavailable'

export interface MetricComparison {
  current: number
  previous: number | null
  absoluteChange: number | null
  percentageChange: number | null
  direction: MetricDirection
}

const FLOATING_POINT_EPSILON = 1e-9

export function compareMetric(current: number, previous: number | null): MetricComparison {
  if (previous === null) {
    return {
      current,
      previous: null,
      absoluteChange: null,
      percentageChange: null,
      direction: 'unavailable',
    }
  }

  const rawChange = current - previous
  const absoluteChange = Math.abs(rawChange) < FLOATING_POINT_EPSILON ? 0 : rawChange
  const direction = absoluteChange === 0 ? 'flat' : absoluteChange > 0 ? 'up' : 'down'
  const percentageChange =
    previous === 0 ? (current === 0 ? 0 : null) : absoluteChange / Math.abs(previous)

  return { current, previous, absoluteChange, percentageChange, direction }
}
