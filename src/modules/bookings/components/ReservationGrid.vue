<script setup lang="ts">
import type { Booking } from '@/modules/bookings/types/booking'
import type {
  ReservationGridRow,
  TimelineDay,
  TimelineMonthGroup,
} from '@/modules/bookings/utils/reservationTimeline'
import BaseBadge from '@/shared/ui/BaseBadge.vue'

defineProps<{
  days: readonly TimelineDay[]
  months: readonly TimelineMonthGroup[]
  rows: readonly ReservationGridRow[]
}>()
const emit = defineEmits<{ select: [booking: Booking] }>()

function roomBadge(status: string): 'neutral' | 'success' | 'warning' | 'danger' {
  if (status === 'available') return 'success'
  if (status === 'maintenance') return 'warning'
  if (status === 'out-of-service') return 'danger'
  return 'neutral'
}
</script>

<template>
  <div class="reservation-scroll" role="region" aria-label="Reservation timeline" tabindex="0">
    <div
      class="reservation-grid"
      role="grid"
      :aria-colcount="days.length + 1"
      :aria-rowcount="rows.length + 2"
      :style="{ '--day-count': days.length }"
    >
      <div class="timeline-line timeline-months" role="row">
        <div class="room-column room-column--header" role="columnheader">Rooms</div>
        <div class="timeline-track timeline-track--months">
          <div
            v-for="month in months"
            :key="month.key"
            class="month-group"
            role="columnheader"
            :style="{ gridColumn: `${month.startColumn} / span ${month.span}` }"
          >
            {{ month.label }}
          </div>
        </div>
      </div>

      <div class="timeline-line timeline-header" role="row">
        <div class="room-column room-column--subheader" role="columnheader">Room / unit</div>
        <div class="timeline-track timeline-track--days">
          <div
            v-for="day in days"
            :key="day.date"
            class="day-header"
            :class="{ 'is-demo-date': day.isDemoDate }"
            role="columnheader"
            :aria-label="day.date"
          >
            <span>{{ day.weekday }}</span
            ><strong>{{ day.dayNumber }}</strong>
          </div>
        </div>
      </div>

      <div v-for="row in rows" :key="row.room.id" class="timeline-line timeline-room" role="row">
        <div class="room-column room-cell" role="rowheader">
          <div>
            <strong>{{ row.room.number }}</strong
            ><span>{{ row.room.name }}</span>
          </div>
          <small>{{ row.room.type }} · {{ row.room.capacity }} guests</small>
          <BaseBadge :variant="roomBadge(row.room.status)">{{ row.room.status }}</BaseBadge>
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
            role="gridcell"
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
            :style="{ gridColumn: `${span.startColumn} / span ${span.span}` }"
            :aria-label="`${span.booking.guestName}, ${span.booking.status}, ${span.booking.checkIn} to ${span.booking.checkOut}`"
            @click="emit('select', span.booking)"
          >
            <strong>{{ span.booking.guestName }}</strong
            ><span>{{ span.booking.status }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.reservation-scroll {
  width: 100%;
  overflow-x: auto;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  box-shadow: var(--shadow-sm);
}
.reservation-grid {
  --day-width: 3.25rem;
  --room-width: 14.5rem;
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
}
.room-column--subheader {
  display: flex;
  align-items: center;
  padding: var(--space-2) var(--space-4);
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
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
  min-height: 3.25rem;
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
  min-height: 4.75rem;
  border-bottom: 1px solid var(--color-border);
}
.timeline-room:last-child {
  border-bottom: 0;
}
.room-cell {
  display: grid;
  align-content: center;
  gap: var(--space-1);
  padding: var(--space-2) var(--space-3);
}
.room-cell > div {
  display: flex;
  align-items: baseline;
  gap: var(--space-2);
  min-width: 0;
}
.room-cell strong {
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
  color: var(--color-text-muted);
  font-size: 0.6875rem;
}
.room-cell :deep(.badge) {
  width: max-content;
  min-height: 1.25rem;
  font-size: 0.625rem;
}
.timeline-track--room {
  position: relative;
  grid-template-rows: 4.75rem;
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
  z-index: 2;
  align-self: center;
  min-width: 0;
  min-height: 2.75rem;
  margin: 0 0.2rem;
  overflow: hidden;
  padding: var(--space-1) var(--space-2);
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  text-align: left;
  cursor: pointer;
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
  margin-top: 2px;
  font-size: 0.625rem;
}
.booking-bar--confirmed {
  border-color: #9fc9bd;
  background: var(--color-primary-soft);
  color: var(--color-primary-hover);
}
.booking-bar--checked-in {
  border-color: #9ac9b0;
  background: var(--color-success-soft);
  color: var(--color-success);
}
.booking-bar--checked-out {
  border-color: var(--color-border-strong);
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
    --room-width: 12rem;
  }
}
</style>
