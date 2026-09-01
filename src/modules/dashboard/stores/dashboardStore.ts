import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'

import { usePropertyStore } from '@/app/stores/propertyStore'
import { getRevenueMetrics } from '@/modules/analytics/api/revenueRepository'
import type { RevenueMetric } from '@/modules/analytics/types/revenue'
import { getBookings } from '@/modules/bookings/api/bookingsRepository'
import type { Booking } from '@/modules/bookings/types/booking'
import {
  getUpcomingBookings,
  summarizeDailyOperations,
} from '@/modules/dashboard/utils/dashboardOperations'
import { getInventory } from '@/modules/inventory/api/inventoryRepository'
import type { InventoryItem } from '@/modules/inventory/types/inventory'
import { getInspections } from '@/modules/quality/api/inspectionsRepository'
import type { Inspection } from '@/modules/quality/types/inspection'
import { DEMO_DATE, DEMO_PERIOD } from '@/mocks/demoPeriod'
import { getRooms } from '@/shared/api/propertiesRepository'
import type { Room } from '@/shared/types/property'
import type { RequestStatus } from '@/shared/types/request'

export type KpiFormat = 'currency' | 'percentage'

export interface DashboardKpi {
  key: 'revenue' | 'occupancy' | 'adr' | 'revpar'
  label: string
  value: number
  previousValue: number | null
  format: KpiFormat
}

export interface UpcomingBookingItem {
  booking: Booking
  roomName: string
}

function addDays(date: string, days: number): string {
  const timestamp = Date.parse(`${date}T00:00:00Z`) + days * 86_400_000
  return new Date(timestamp).toISOString().slice(0, 10)
}

export const useDashboardStore = defineStore('dashboard', () => {
  const propertyStore = usePropertyStore()
  const status = ref<RequestStatus>('idle')
  const error = ref<string | null>(null)
  const rooms = ref<Room[]>([])
  const bookings = ref<Booking[]>([])
  const revenueMetrics = ref<RevenueMetric[]>([])
  const inspections = ref<Inspection[]>([])
  const inventory = ref<InventoryItem[]>([])
  let latestRequest = 0

  const currentMetric = computed(
    () => revenueMetrics.value.find((metric) => metric.date === DEMO_DATE) ?? null,
  )
  const previousMetric = computed(
    () => revenueMetrics.value.find((metric) => metric.date === addDays(DEMO_DATE, -1)) ?? null,
  )
  const kpis = computed<DashboardKpi[]>(() => {
    const current = currentMetric.value
    if (!current) return []
    const previous = previousMetric.value

    return [
      {
        key: 'revenue',
        label: 'Revenue',
        value: current.revenue,
        previousValue: previous?.revenue ?? null,
        format: 'currency',
      },
      {
        key: 'occupancy',
        label: 'Occupancy',
        value: current.occupancyRate,
        previousValue: previous?.occupancyRate ?? null,
        format: 'percentage',
      },
      {
        key: 'adr',
        label: 'ADR',
        value: current.adr,
        previousValue: previous?.adr ?? null,
        format: 'currency',
      },
      {
        key: 'revpar',
        label: 'RevPAR',
        value: current.revpar,
        previousValue: previous?.revpar ?? null,
        format: 'currency',
      },
    ]
  })
  const dailyOperations = computed(() =>
    summarizeDailyOperations(rooms.value, bookings.value, DEMO_DATE),
  )
  const upcomingBookings = computed<UpcomingBookingItem[]>(() =>
    getUpcomingBookings(bookings.value, DEMO_DATE).map((booking) => ({
      booking,
      roomName: rooms.value.find((room) => room.id === booking.roomId)?.name ?? 'Unknown room',
    })),
  )
  const revenueTrend = computed(() =>
    revenueMetrics.value.filter(
      (metric) => metric.date >= addDays(DEMO_DATE, -29) && metric.date <= DEMO_DATE,
    ),
  )
  const unavailableRooms = computed(() =>
    rooms.value.filter((room) => room.status === 'maintenance' || room.status === 'out-of-service'),
  )
  const inventoryIssues = computed(() =>
    inventory.value.filter((item) => item.status === 'missing' || item.status === 'damaged'),
  )
  const upcomingInspections = computed(() =>
    inspections.value
      .filter(
        (inspection) => inspection.status === 'scheduled' && inspection.scheduledDate >= DEMO_DATE,
      )
      .sort((first, second) => first.scheduledDate.localeCompare(second.scheduledDate)),
  )
  const hasData = computed(() => rooms.value.length > 0 && currentMetric.value !== null)

  async function load(propertyId: string): Promise<void> {
    const requestId = ++latestRequest
    status.value = 'loading'
    error.value = null

    try {
      const [nextRooms, nextBookings, nextRevenue, nextInspections, nextInventory] =
        await Promise.all([
          getRooms(propertyId),
          getBookings({ propertyId, dateFrom: DEMO_PERIOD.start, dateTo: DEMO_PERIOD.end }),
          getRevenueMetrics({
            propertyId,
            period: 'day',
            dateFrom: DEMO_PERIOD.start,
            dateTo: DEMO_DATE,
          }),
          getInspections({ propertyId, dateFrom: DEMO_DATE }),
          getInventory({ propertyId }),
        ])

      if (requestId !== latestRequest) return
      rooms.value = nextRooms
      bookings.value = nextBookings
      revenueMetrics.value = nextRevenue
      inspections.value = nextInspections
      inventory.value = nextInventory
      status.value = 'success'
    } catch (reason: unknown) {
      if (requestId !== latestRequest) return
      error.value = reason instanceof Error ? reason.message : 'Unable to load overview data'
      status.value = 'failure'
    }
  }

  async function retry(): Promise<void> {
    if (propertyStore.selectedPropertyId) await load(propertyStore.selectedPropertyId)
  }

  watch(
    () => propertyStore.selectedPropertyId,
    (propertyId) => {
      if (propertyId) void load(propertyId)
    },
    { immediate: true },
  )

  return {
    status,
    error,
    kpis,
    dailyOperations,
    upcomingBookings,
    revenueTrend,
    unavailableRooms,
    inventoryIssues,
    upcomingInspections,
    hasData,
    retry,
  }
})
