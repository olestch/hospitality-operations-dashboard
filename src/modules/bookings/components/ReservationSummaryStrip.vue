<script setup lang="ts">
import type { ReservationSummary } from '@/modules/bookings/utils/reservationTimeline'
import BaseCard from '@/shared/ui/BaseCard.vue'

defineProps<{ summary: ReservationSummary }>()
const percentageFormatter = new Intl.NumberFormat('en', {
  style: 'percent',
  maximumFractionDigits: 1,
})
</script>

<template>
  <section class="summary-strip" aria-label="Visible reservation range summary">
    <BaseCard
      ><span>Active bookings</span><strong>{{ summary.activeBookings }}</strong></BaseCard
    >
    <BaseCard
      ><span>Sellable occupancy</span
      ><strong>{{ percentageFormatter.format(summary.occupancyRate) }}</strong></BaseCard
    >
    <BaseCard
      ><span>Arrivals</span><strong>{{ summary.arrivals }}</strong></BaseCard
    >
    <BaseCard
      ><span>Departures</span><strong>{{ summary.departures }}</strong></BaseCard
    >
  </section>
</template>

<style scoped lang="scss">
.summary-strip {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--space-3);
}
.summary-strip :deep(.card__content) {
  display: grid;
  gap: var(--space-1);
  padding: var(--space-3) var(--space-4);
}
.summary-strip span {
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
}
.summary-strip strong {
  color: var(--color-text-strong);
  font-size: var(--font-size-lg);
}
@media (max-width: 48rem) {
  .summary-strip {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
