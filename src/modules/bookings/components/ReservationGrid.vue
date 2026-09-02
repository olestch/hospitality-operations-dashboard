<script setup lang="ts">
import type { Booking } from '@/modules/bookings/types/booking'
import type {
  BookingSpan,
  ReservationGridRow,
  TimelineDay,
  TimelineMonthGroup,
} from '@/modules/bookings/utils/reservationTimeline'
import { formatLocalTime } from '@/modules/bookings/utils/bookingTime'
import BaseBadge from '@/shared/ui/BaseBadge.vue'
import type { RoomStatus } from '@/shared/types/property'

defineProps<{
  days: readonly TimelineDay[]
  months: readonly TimelineMonthGroup[]
  rows: readonly ReservationGridRow[]
}>()
const emit = defineEmits<{ select: [booking: Booking] }>()

function roomBadge(status: RoomStatus): 'neutral' | 'success' | 'warning' | 'danger' {
  if (status === 'available') return 'success'
  if (status === 'maintenance') return 'warning'
  if (status === 'out-of-service') return 'danger'
  return 'neutral'
}

function roomStatusLabel(status: RoomStatus): string {
  return status.replace(/-/g, ' ')
}

function bookingStyle(span: BookingSpan): Record<string, string> {
  return {
    '--booking-start': String(span.startOffset),
    '--booking-width': String(span.width),
  }
}

function bookingLabel(span: BookingSpan, roomNumber: string): string {
  const { booking } = span
  return `${booking.guestName}, room ${roomNumber}, ${booking.status}, ${booking.source}, ${booking.checkIn} at ${formatLocalTime(booking.checkInTime)} to ${booking.checkOut} at ${formatLocalTime(booking.checkOutTime)}`
}
</script>

<template>
  <div class="reservation-scroll" role="region" aria-label="Reservation timeline" tabindex="0">
    <div class="reservation-grid" :style="{ '--day-count': days.length }">
      <div class="timeline-line timeline-months">
        <div class="room-column room-column--header">Rooms</div>
        <div class="timeline-track timeline-track--months">
          <div
            v-for="month in months"
            :key="month.key"
            class="month-group"
            :style="{ gridColumn: `${month.startColumn} / span ${month.span}` }"
          >
            {{ month.label }}
          </div>
        </div>
      </div>

      <div class="timeline-line timeline-header">
        <div class="room-column room-column--subheader">Room / unit</div>
        <div class="timeline-track timeline-track--days">
          <time
            v-for="day in days"
            :key="day.date"
            class="day-header"
            :class="{ 'is-demo-date': day.isDemoDate }"
            :datetime="day.date"
          >
            <span>{{ day.weekday }}</span
            ><strong>{{ day.dayNumber }}</strong>
          </time>
        </div>
      </div>

      <section
        v-for="row in rows"
        :key="row.room.id"
        class="timeline-line timeline-room"
        :aria-labelledby="`reservation-room-${row.room.id}`"
      >
        <div class="room-column room-cell">
          <div class="room-cell__identity">
            <h2 :id="`reservation-room-${row.room.id}`">{{ row.room.number }}</h2>
            <span>{{ row.room.name }}</span>
          </div>
          <div class="room-cell__meta">
            <small>{{ row.room.type }} · {{ row.room.capacity }} guests</small>
            <BaseBadge :variant="roomBadge(row.room.status)">{{
              roomStatusLabel(row.room.status)
            }}</BaseBadge>
          </div>
        </div>
        <div class="timeline-track timeline-track--room">
          <span
            v-for="day in days"
            :key="`${row.room.id}:${day.date}`"
            class="day-cell"
            :class="{
              'is-demo-date': day.isDemoDate,
              'is-unavailable':
                row.room.status === 'maintenance' || row.room.status === 'out-of-service',
            }"
            aria-hidden="true"
          />
          <button
            v-for="span in row.bookings"
            :key="span.booking.id"
            class="booking-bar"
            :class="[
              `booking-bar--${span.booking.status}`,
              { 'is-clipped-start': span.clippedAtStart, 'is-clipped-end': span.clippedAtEnd },
            ]"
            type="button"
            :style="bookingStyle(span)"
            :aria-label="bookingLabel(span, row.room.number)"
            @click="emit('select', span.booking)"
          >
            <strong v-if="span.width >= 1.9">{{ span.booking.guestName }}</strong>
            <span v-if="span.width >= 3.6">{{ span.booking.status }}</span>
          </button>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped lang="scss">
.reservation-scroll {
  width: 100%;
  min-width: 0;
  max-width: 100%;
  overflow-x: auto;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  box-shadow: var(--shadow-sm);
}
.reservation-grid {
  --day-width: 2.75rem;
  --room-width: 13.25rem;
  min-width: calc(var(--room-width) + var(--day-count) * var(--day-width));
}
.timeline-line {
  display: grid;
  grid-template-columns: var(--room-width) calc(var(--day-count) * var(--day-width));
}
.timeline-track {
  display: grid;
  grid-template-columns: repeat(var(--day-count), var(--day-width));
  min-width: 0;
}
.room-column {
  position: sticky;
  left: 0;
  z-index: 3;
  border-right: 1px solid var(--color-border-strong);
  background: var(--color-surface);
  box-shadow: var(--shadow-sticky-column);
}
.room-column--header {
  display: flex;
  align-items: center;
  padding: 0 var(--space-4);
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  background: var(--color-surface-subtle);
}
.room-column--subheader {
  display: flex;
  align-items: center;
  padding: var(--space-2) var(--space-4);
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
  background: var(--color-surface-subtle);
}
.timeline-months {
  border-bottom: 1px solid var(--color-border);
}
.timeline-track--months {
  background: var(--color-surface-subtle);
}
.month-group {
  padding: var(--space-2) var(--space-3);
  border-right: 1px solid var(--color-border);
  color: var(--color-text-strong);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
}
.timeline-header {
  border-bottom: 1px solid var(--color-border-strong);
}
.day-header {
  display: grid;
  place-items: center;
  gap: 1px;
  min-height: 2.875rem;
  border-right: 1px solid var(--color-border);
  color: var(--color-text-muted);
  font-size: 0.6875rem;
}
.day-header strong {
  color: var(--color-text-strong);
  font-size: var(--font-size-sm);
}
.day-header.is-demo-date {
  background: var(--color-primary-soft);
}
.timeline-room {
  min-height: 4rem;
  border-bottom: 1px solid var(--color-border);
}
.timeline-room:last-child {
  border-bottom: 0;
}
.room-cell {
  display: grid;
  align-content: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
}
.room-cell__identity,
.room-cell__meta {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  min-width: 0;
}
.room-cell__meta {
  justify-content: space-between;
}
.room-cell h2 {
  margin: 0;
  color: var(--color-text-strong);
  font-size: var(--font-size-sm);
}
.room-cell span {
  overflow: hidden;
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
  text-overflow: ellipsis;
  white-space: nowrap;
}
.room-cell small {
  overflow: hidden;
  color: var(--color-text-muted);
  font-size: 0.6875rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.room-cell :deep(.badge) {
  flex: 0 0 auto;
  width: max-content;
  min-height: 1.25rem;
  padding-inline: var(--space-2);
  font-size: 0.625rem;
  text-transform: capitalize;
}
.timeline-track--room {
  position: relative;
  grid-template-rows: 4rem;
}
.day-cell {
  grid-row: 1;
  border-right: 1px solid var(--color-border);
  background: var(--color-surface);
}
.day-cell.is-demo-date {
  background: var(--color-primary-soft);
}
.day-cell.is-unavailable {
  background: var(--color-surface-subtle);
}
.booking-bar {
  position: absolute;
  top: 50%;
  left: calc(var(--booking-start) * var(--day-width));
  z-index: 2;
  width: calc(var(--booking-width) * var(--day-width));
  min-width: 0.25rem;
  height: 2.5rem;
  overflow: hidden;
  padding: var(--space-1) var(--space-3);
  transform: translateY(-50%);
  border: 1px solid;
  border-radius: var(--radius-full);
  text-align: left;
  cursor: pointer;
  transition:
    border-color 120ms ease,
    filter 120ms ease;
}
.booking-bar strong,
.booking-bar span {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.booking-bar strong {
  font-size: var(--font-size-xs);
}
.booking-bar span {
  font-size: 0.625rem;
  text-transform: capitalize;
}
.booking-bar:hover {
  filter: brightness(0.97);
}
.booking-bar:focus-visible {
  z-index: 4;
}
.booking-bar--confirmed {
  border-color: var(--color-primary-border);
  background: var(--color-primary-soft);
  color: var(--color-primary-hover);
}
.booking-bar--checked-in {
  border-width: 2px;
  border-color: var(--color-success-border);
  background: var(--color-success-soft);
  color: var(--color-success);
}
.booking-bar--checked-out {
  border-color: var(--color-border-strong);
  border-style: dashed;
  background: var(--color-surface-subtle);
  color: var(--color-text);
}
.booking-bar.is-clipped-start {
  border-left-style: dashed;
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}
.booking-bar.is-clipped-end {
  border-right-style: dashed;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}
@media (max-width: 64rem) {
  .reservation-grid {
    --room-width: 11.75rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .booking-bar {
    transition: none;
  }
}
</style>
