import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'

import { usePropertyStore } from '@/app/stores/propertyStore'
import { getBookings } from '@/modules/bookings/api/bookingsRepository'
import type { Booking, BookingSource, BookingStatus } from '@/modules/bookings/types/booking'
import {
  addDays,
  bookingOverlapsRange,
  calculateReservationSummary,
  createReservationGrid,
  filterReservationData,
  generateVisibleDays,
  groupDaysByMonth,
  type DateRange,
} from '@/modules/bookings/utils/reservationTimeline'
import { DEMO_DATE, DEMO_PERIOD } from '@/mocks/demoPeriod'
import { getRooms } from '@/shared/api/propertiesRepository'
import type { Room } from '@/shared/types/property'
import type { RequestStatus } from '@/shared/types/request'

const VISIBLE_DAY_COUNT = 28
const INITIAL_RANGE_START = addDays(DEMO_DATE, -13)
const LATEST_RANGE_START = addDays(DEMO_PERIOD.end, -(VISIBLE_DAY_COUNT - 1))

function createRange(start: string): DateRange {
  return { start, end: addDays(start, VISIBLE_DAY_COUNT - 1) }
}

function clampRangeStart(start: string): string {
  if (start < DEMO_PERIOD.start) return DEMO_PERIOD.start
  if (start > LATEST_RANGE_START) return LATEST_RANGE_START
  return start
}

export const useBookingsStore = defineStore('bookings', () => {
  const propertyStore = usePropertyStore()
  const status = ref<RequestStatus>('idle')
  const error = ref<string | null>(null)
  const rooms = ref<Room[]>([])
  const bookings = ref<Booking[]>([])
  const rangeStart = ref(INITIAL_RANGE_START)
  const statusFilter = ref<BookingStatus | null>(null)
  const sourceFilter = ref<BookingSource | null>(null)
  const roomTypeFilter = ref<string | null>(null)
  let latestRequest = 0

  const visibleRange = computed(() => createRange(rangeStart.value))
  const visibleDays = computed(() => generateVisibleDays(visibleRange.value, DEMO_DATE))
  const monthGroups = computed(() => groupDaysByMonth(visibleDays.value))
  const filteredData = computed(() =>
    filterReservationData(rooms.value, bookings.value, {
      status: statusFilter.value,
      source: sourceFilter.value,
      roomType: roomTypeFilter.value,
    }),
  )
  const gridRows = computed(() =>
    createReservationGrid(
      filteredData.value.rooms,
      filteredData.value.bookings,
      visibleRange.value,
    ),
  )
  const visibleBookings = computed(() =>
    filteredData.value.bookings
      .filter((booking) => bookingOverlapsRange(booking, visibleRange.value))
      .sort((first, second) => first.checkIn.localeCompare(second.checkIn)),
  )
  const summary = computed(() =>
    calculateReservationSummary(
      filteredData.value.rooms,
      filteredData.value.bookings,
      visibleRange.value,
    ),
  )
  const roomTypes = computed(() => [...new Set(rooms.value.map((room) => room.type))].sort())
  const hasActiveFilters = computed(
    () =>
      statusFilter.value !== null || sourceFilter.value !== null || roomTypeFilter.value !== null,
  )
  const hasRooms = computed(() => rooms.value.length > 0)
  const canMoveBackward = computed(() => rangeStart.value > DEMO_PERIOD.start)
  const canMoveForward = computed(() => rangeStart.value < LATEST_RANGE_START)

  async function load(propertyId: string): Promise<void> {
    const requestId = ++latestRequest
    status.value = 'loading'
    error.value = null

    try {
      const [nextRooms, nextBookings] = await Promise.all([
        getRooms(propertyId),
        getBookings({ propertyId, dateFrom: DEMO_PERIOD.start, dateTo: DEMO_PERIOD.end }),
      ])
      if (requestId !== latestRequest) return
      rooms.value = nextRooms
      bookings.value = nextBookings
      status.value = 'success'
    } catch (reason: unknown) {
      if (requestId !== latestRequest) return
      error.value = reason instanceof Error ? reason.message : 'Unable to load reservations'
      status.value = 'failure'
    }
  }

  function shiftRange(direction: -1 | 1): void {
    rangeStart.value = clampRangeStart(addDays(rangeStart.value, direction * VISIBLE_DAY_COUNT))
  }

  function jumpToDemoDate(): void {
    rangeStart.value = INITIAL_RANGE_START
  }

  function resetFilters(): void {
    statusFilter.value = null
    sourceFilter.value = null
    roomTypeFilter.value = null
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
    visibleRange,
    visibleDays,
    monthGroups,
    gridRows,
    visibleBookings,
    summary,
    roomTypes,
    statusFilter,
    sourceFilter,
    roomTypeFilter,
    hasActiveFilters,
    hasRooms,
    canMoveBackward,
    canMoveForward,
    shiftRange,
    jumpToDemoDate,
    resetFilters,
    retry,
  }
})
