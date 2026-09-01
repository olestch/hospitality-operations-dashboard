import type { RevenueMetric } from '@/modules/analytics/types/revenue'
import { DEMO_PERIOD } from '@/mocks/demoPeriod'
import { mockProperties } from '@/mocks/data/properties'

const DAY_IN_MILLISECONDS = 86_400_000

function toIsoDate(timestamp: number): string {
  return new Date(timestamp).toISOString().slice(0, 10)
}

function round(value: number, precision = 2): number {
  const factor = 10 ** precision
  return Math.round(value * factor) / factor
}

function createDailyMetrics(): RevenueMetric[] {
  const start = Date.parse(`${DEMO_PERIOD.start}T00:00:00Z`)
  const end = Date.parse(`${DEMO_PERIOD.end}T00:00:00Z`)

  return mockProperties.flatMap((property, propertyIndex) => {
    const metrics: RevenueMetric[] = []

    for (
      let timestamp = start, dayIndex = 0;
      timestamp <= end;
      timestamp += DAY_IN_MILLISECONDS, dayIndex += 1
    ) {
      const occupancyRate = round(0.48 + ((dayIndex * 7 + propertyIndex * 11) % 41) / 100)
      const adr = round(112 + propertyIndex * 14 + ((dayIndex * 5) % 27))
      const occupiedRooms = Math.round(property.roomCount * occupancyRate)
      const revenue = round(occupiedRooms * adr)

      metrics.push({
        date: toIsoDate(timestamp),
        period: 'day',
        propertyId: property.id,
        revenue,
        occupancyRate,
        adr,
        revpar: round(adr * occupancyRate),
      })
    }

    return metrics
  })
}

function createMonthlyMetrics(dailyMetrics: readonly RevenueMetric[]): RevenueMetric[] {
  return mockProperties.flatMap((property) =>
    ['2025-01', '2025-02', '2025-03'].map((month) => {
      const entries = dailyMetrics.filter(
        (metric) => metric.propertyId === property.id && metric.date.startsWith(month),
      )
      const revenue = round(entries.reduce((total, metric) => total + metric.revenue, 0))
      const occupancyRate = round(
        entries.reduce((total, metric) => total + metric.occupancyRate, 0) / entries.length,
      )
      const adr = round(entries.reduce((total, metric) => total + metric.adr, 0) / entries.length)

      return {
        date: `${month}-01`,
        period: 'month' as const,
        propertyId: property.id,
        revenue,
        occupancyRate,
        adr,
        revpar: round(adr * occupancyRate),
      }
    }),
  )
}

const dailyRevenueMetrics = createDailyMetrics()

export const mockRevenueMetrics: readonly RevenueMetric[] = [
  ...dailyRevenueMetrics,
  ...createMonthlyMetrics(dailyRevenueMetrics),
]
