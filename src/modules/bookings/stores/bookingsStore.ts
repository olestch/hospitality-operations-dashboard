import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'

import { usePropertyStore } from '@/app/stores/propertyStore'
import { getBookings } from '@/modules/bookings/api/bookingsRepository'
import type { Booking, BookingSource, BookingStatus } from '@/modules/bookings/types/booking'
import {
  addDays,
  bookingVisuallyOverlapsRange,
  calculateReservationSummary,
  createReservationGrid,
  createReservationViewData,
  generateVisibleDays,
  groupDaysByMonth,
} from '@/modules/bookings/utils/reservationTimeline'
import {
  createRangeStarts,
  createVisibleRange,
  getAdjacentRangeStart,
} from '@/modules/bookings/utils/reservationRange'
import { DEMO_DATE, DEMO_PERIOD } from '@/mocks/demoPeriod'
import { getRooms } from '@/shared/api/propertiesRepository'
import type { Room } from '@/shared/types/property'
import type { RequestStatus } from '@/shared/types/request'

const VISIBLE_DAY_COUNT = 28
const INITIAL_RANGE_START = addDays(DEMO_DATE, -13)
const RANGE_STARTS = createRangeStarts({
  period: DEMO_PERIOD,
  preferredStart: INITIAL_RANGE_START,
  visibleDayCount: VISIBLE_DAY_COUNT,
})

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

  const visibleRange = computed(() => createVisibleRange(rangeStart.value, VISIBLE_DAY_COUNT))
  const visibleDays = computed(() => generateVisibleDays(visibleRange.value, DEMO_DATE))
  const monthGroups = computed(() => groupDaysByMonth(visibleDays.value))
  const reservationView = computed(() =>
    createReservationViewData(rooms.value, bookings.value, {
      status: statusFilter.value,
      source: sourceFilter.value,
      roomType: roomTypeFilter.value,
    }),
  )
  const gridRows = computed(() =>
    createReservationGrid(
      reservationView.value.rooms,
      reservationView.value.renderedBookings,
      visibleRange.value,
    ),
  )
  const visibleBookings = computed(() =>
    reservationView.value.renderedBookings
      .filter((booking) => bookingVisuallyOverlapsRange(booking, visibleRange.value))
      .sort((first, second) => first.checkIn.localeCompare(second.checkIn)),
  )
  const summary = computed(() =>
    calculateReservationSummary(
      reservationView.value.rooms,
      reservationView.value.operationalBookings,
      visibleRange.value,
    ),
  )
  const roomTypes = computed(() => [...new Set(rooms.value.map((room) => room.type))].sort())
  const hasActiveFilters = computed(
    () =>
      statusFilter.value !== null || sourceFilter.value !== null || roomTypeFilter.value !== null,
  )
  const hasRooms = computed(() => rooms.value.length > 0)
  const canMoveBackward = computed(() => RANGE_STARTS.indexOf(rangeStart.value) > 0)
  const canMoveForward = computed(() => {
    const currentIndex = RANGE_STARTS.indexOf(rangeStart.value)
    return currentIndex >= 0 && currentIndex < RANGE_STARTS.length - 1
  })

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
    rangeStart.value = getAdjacentRangeStart(rangeStart.value, direction, RANGE_STARTS)
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
