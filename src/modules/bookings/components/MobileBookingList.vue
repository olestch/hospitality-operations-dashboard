<script setup lang="ts">
import { computed } from 'vue'

import type { Booking, BookingStatus } from '@/modules/bookings/types/booking'
import { formatLocalTime } from '@/modules/bookings/utils/bookingTime'
import type { ReservationGridRow } from '@/modules/bookings/utils/reservationTimeline'
import BaseBadge from '@/shared/ui/BaseBadge.vue'
import EmptyState from '@/shared/ui/EmptyState.vue'

const props = defineProps<{
  bookings: readonly Booking[]
  rows: readonly ReservationGridRow[]
  rangeStart: string
}>()
const emit = defineEmits<{ select: [booking: Booking] }>()
const dateFormatter = new Intl.DateTimeFormat('en', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
})

const roomNames = computed(
  () => new Map(props.rows.map((row) => [row.room.id, `${row.room.number} · ${row.room.name}`])),
)
const groups = computed(() => {
  const result = new Map<string, Booking[]>()
  for (const booking of props.bookings) {
    const groupKey = booking.checkIn < props.rangeStart ? props.rangeStart : booking.checkIn
    const items = result.get(groupKey) ?? []
    items.push(booking)
    result.set(groupKey, items)
  }
  return [...result.entries()].map(([date, bookings]) => ({
    date,
    bookings,
    includesClippedBooking: bookings.some((booking) => booking.checkIn < props.rangeStart),
  }))
})

function formatDate(value: string): string {
  return dateFormatter.format(new Date(`${value}T00:00:00Z`))
}
function badge(status: BookingStatus): 'neutral' | 'success' | 'warning' | 'danger' {
  if (status === 'checked-in') return 'success'
  if (status === 'confirmed') return 'warning'
  if (status === 'cancelled') return 'danger'
  return 'neutral'
}
</script>

<template>
  <div v-if="groups.length" class="mobile-bookings">
    <section v-for="group in groups" :key="group.date">
      <h2>
        {{ group.includesClippedBooking ? 'In house at range start' : formatDate(group.date) }}
      </h2>
      <button
        v-for="booking in group.bookings"
        :key="booking.id"
        type="button"
        @click="emit('select', booking)"
      >
        <span class="mobile-bookings__main"
          ><strong>{{ booking.guestName }}</strong
          ><small>{{ roomNames.get(booking.roomId) ?? 'Unknown room' }}</small
          ><small>Arrival · {{ formatLocalTime(booking.checkInTime) }}</small></span
        >
        <span class="mobile-bookings__meta"
          ><BaseBadge :variant="badge(booking.status)">{{ booking.status }}</BaseBadge
          ><small
            >to {{ formatDate(booking.checkOut) }} ·
            {{ formatLocalTime(booking.checkOutTime) }}</small
          ></span
        >
      </button>
    </section>
  </div>
  <EmptyState
    v-else
    title="No bookings in this range"
    description="Try another period or clear the current filters."
  />
</template>

<style scoped lang="scss">
.mobile-bookings {
  display: grid;
  gap: var(--space-5);
}
.mobile-bookings h2 {
  margin: 0 0 var(--space-2);
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
  letter-spacing: 0.05em;
  text-transform: uppercase;
}
.mobile-bookings button {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  padding: var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  text-align: left;
  cursor: pointer;
}
.mobile-bookings button + button {
  margin-top: var(--space-2);
}
.mobile-bookings button:hover {
  border-color: var(--color-border-strong);
  background: var(--color-surface-subtle);
}
.mobile-bookings__main,
.mobile-bookings__meta {
  display: grid;
  gap: var(--space-1);
}
.mobile-bookings__main {
  min-width: 0;
}
.mobile-bookings__main strong {
  overflow: hidden;
  color: var(--color-text-strong);
  font-size: var(--font-size-sm);
  text-overflow: ellipsis;
  white-space: nowrap;
}
.mobile-bookings small {
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
}
.mobile-bookings__meta {
  flex: 0 0 auto;
  justify-items: end;
  text-align: right;
}
</style>
