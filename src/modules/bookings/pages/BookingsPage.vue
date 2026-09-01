<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed, ref, watch } from 'vue'

import { usePropertyStore } from '@/app/stores/propertyStore'
import BookingDetailModal from '@/modules/bookings/components/BookingDetailModal.vue'
import MobileBookingList from '@/modules/bookings/components/MobileBookingList.vue'
import ReservationGrid from '@/modules/bookings/components/ReservationGrid.vue'
import ReservationSummaryStrip from '@/modules/bookings/components/ReservationSummaryStrip.vue'
import { useBookingsStore } from '@/modules/bookings/stores/bookingsStore'
import type { Booking, BookingSource, BookingStatus } from '@/modules/bookings/types/booking'
import type { SelectOption, SelectValue } from '@/shared/ui/BaseSelect.vue'
import BaseButton from '@/shared/ui/BaseButton.vue'
import BaseCard from '@/shared/ui/BaseCard.vue'
import BaseSelect from '@/shared/ui/BaseSelect.vue'
import EmptyState from '@/shared/ui/EmptyState.vue'
import PageHeader from '@/shared/ui/PageHeader.vue'

const propertyStore = usePropertyStore()
const bookingsStore = useBookingsStore()
const {
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
} = storeToRefs(bookingsStore)
const selectedBooking = ref<Booking | null>(null)

const bookingStatuses = [
  'confirmed',
  'checked-in',
  'checked-out',
] as const satisfies readonly BookingStatus[]
const bookingSources = [
  'Direct',
  'Booking.com',
  'Expedia',
  'Corporate',
] as const satisfies readonly BookingSource[]
const statusLabels: Record<(typeof bookingStatuses)[number], string> = {
  confirmed: 'Confirmed',
  'checked-in': 'Checked in',
  'checked-out': 'Checked out',
}
const statusOptions: readonly SelectOption[] = bookingStatuses.map((status) => ({
  label: statusLabels[status],
  value: status,
}))
const sourceOptions: readonly SelectOption[] = bookingSources.map((source) => ({
  label: source,
  value: source,
}))
const roomTypeOptions = computed<readonly SelectOption[]>(() =>
  roomTypes.value.map((type) => ({ label: type, value: type })),
)
const statusModel = computed<SelectValue | null>({
  get: () => statusFilter.value,
  set: (value) => {
    statusFilter.value = bookingStatuses.find((status) => status === value) ?? null
  },
})
const sourceModel = computed<SelectValue | null>({
  get: () => sourceFilter.value,
  set: (value) => {
    sourceFilter.value = bookingSources.find((source) => source === value) ?? null
  },
})
const roomTypeModel = computed<SelectValue | null>({
  get: () => roomTypeFilter.value,
  set: (value) => {
    roomTypeFilter.value = typeof value === 'string' ? value : null
  },
})
const rangeFormatter = new Intl.DateTimeFormat('en', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
})
const pageDescription = computed(
  () =>
    `${propertyStore.selectedProperty?.name ?? 'Selected property'} · Read-only reservation timeline`,
)
const rangeLabel = computed(
  () => `${formatDate(visibleRange.value.start)} – ${formatDate(visibleRange.value.end)}`,
)
const selectedRoomName = computed(
  () =>
    gridRows.value.find((row) => row.room.id === selectedBooking.value?.roomId)?.room.name ??
    'Unknown room',
)

watch(() => propertyStore.selectedPropertyId, closeBooking)

function formatDate(value: string): string {
  return rangeFormatter.format(new Date(`${value}T00:00:00Z`))
}
function selectBooking(booking: Booking): void {
  selectedBooking.value = booking
}
function closeBooking(): void {
  selectedBooking.value = null
}
</script>

<template>
  <section class="bookings-page">
    <PageHeader eyebrow="Operations" title="Reservations" :description="pageDescription" />

    <BaseCard class="booking-controls">
      <div class="range-toolbar">
        <div class="range-toolbar__navigation">
          <BaseButton
            variant="secondary"
            size="small"
            :disabled="!canMoveBackward"
            aria-label="Previous date range"
            @click="bookingsStore.shiftRange(-1)"
            >←</BaseButton
          >
          <div>
            <strong>{{ rangeLabel }}</strong
            ><span>28-day visible range</span>
          </div>
          <BaseButton
            variant="secondary"
            size="small"
            :disabled="!canMoveForward"
            aria-label="Next date range"
            @click="bookingsStore.shiftRange(1)"
            >→</BaseButton
          >
        </div>
        <BaseButton variant="ghost" size="small" @click="bookingsStore.jumpToDemoDate"
          >Jump to demo date</BaseButton
        >
      </div>

      <div class="filter-row" aria-label="Reservation filters">
        <BaseSelect
          v-model="statusModel"
          label="Status"
          :options="statusOptions"
          placeholder="All active statuses"
        />
        <BaseSelect
          v-model="sourceModel"
          label="Source"
          :options="sourceOptions"
          placeholder="All sources"
        />
        <BaseSelect
          v-model="roomTypeModel"
          label="Room type"
          :options="roomTypeOptions"
          placeholder="All room types"
        />
        <BaseButton
          variant="ghost"
          size="small"
          :disabled="!hasActiveFilters"
          @click="bookingsStore.resetFilters"
          >Clear filters</BaseButton
        >
      </div>
    </BaseCard>

    <div
      v-if="status === 'idle' || status === 'loading'"
      class="booking-loading"
      role="status"
      aria-live="polite"
    >
      <span class="sr-only">Loading reservation grid</span>
      <span v-for="index in 4" :key="index" />
    </div>

    <BaseCard v-else-if="status === 'failure'" role="alert">
      <EmptyState
        title="Reservations could not be loaded"
        :description="error ?? 'Please try again.'"
      >
        <template #action><BaseButton @click="bookingsStore.retry">Try again</BaseButton></template>
      </EmptyState>
    </BaseCard>

    <BaseCard v-else-if="!hasRooms">
      <EmptyState
        title="No rooms available"
        description="This property does not have any rooms configured."
      />
    </BaseCard>

    <template v-else>
      <ReservationSummaryStrip :summary="summary" />

      <p v-if="visibleBookings.length === 0 && hasActiveFilters" class="filter-empty" role="status">
        No bookings match the current filters. The room timeline remains available for context.
      </p>

      <div class="reservation-desktop">
        <ReservationGrid
          :days="visibleDays"
          :months="monthGroups"
          :rows="gridRows"
          @select="selectBooking"
        />
      </div>
      <BaseCard class="reservation-mobile">
        <MobileBookingList
          :bookings="visibleBookings"
          :rows="gridRows"
          :range-start="visibleRange.start"
          @select="selectBooking"
        />
      </BaseCard>
    </template>

    <BookingDetailModal
      :open="selectedBooking !== null"
      :booking="selectedBooking"
      :room-name="selectedRoomName"
      @close="closeBooking"
    />
  </section>
</template>

<style scoped lang="scss">
.bookings-page {
  display: grid;
  gap: var(--space-6);
  min-width: 0;
}
.bookings-page :deep(.page-header) {
  margin-bottom: 0;
}
.booking-controls :deep(.card__content) {
  display: grid;
  gap: var(--space-5);
}
.range-toolbar,
.range-toolbar__navigation,
.filter-row {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}
.range-toolbar {
  justify-content: space-between;
}
.range-toolbar__navigation > div {
  display: grid;
  min-width: 15rem;
  gap: var(--space-1);
  text-align: center;
}
.range-toolbar__navigation strong {
  color: var(--color-text-strong);
  font-size: var(--font-size-sm);
}
.range-toolbar__navigation span {
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
}
.filter-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(9rem, 1fr)) auto;
  align-items: end;
  padding-top: var(--space-4);
  border-top: 1px solid var(--color-border);
}
.filter-empty {
  margin: calc(var(--space-3) * -1) 0;
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface-subtle);
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
}
.booking-loading {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--space-3);
}
.booking-loading span:not(.sr-only) {
  min-height: 5rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-surface-subtle);
  animation: pulse 1.2s ease-in-out infinite alternate;
}
.reservation-mobile {
  display: none;
}
.reservation-desktop {
  min-width: 0;
}
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}
@keyframes pulse {
  to {
    opacity: 0.55;
  }
}
@media (max-width: 64rem) {
  .filter-row {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
  .filter-row :deep(.button) {
    grid-column: 1 / -1;
    width: max-content;
  }
}
@media (max-width: 48rem) {
  .range-toolbar {
    align-items: stretch;
    flex-direction: column;
  }
  .range-toolbar__navigation {
    justify-content: space-between;
  }
  .range-toolbar__navigation > div {
    min-width: 0;
  }
  .filter-row {
    grid-template-columns: 1fr;
  }
  .filter-row :deep(.button) {
    grid-column: auto;
  }
  .booking-loading {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .reservation-desktop {
    display: none;
  }
  .reservation-mobile {
    display: block;
  }
  .reservation-mobile :deep(.card__content) {
    padding: var(--space-4);
  }
}
@media (prefers-reduced-motion: reduce) {
  .booking-loading span {
    animation: none;
  }
}
</style>
