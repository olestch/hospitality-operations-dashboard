<script setup lang="ts">
import { computed } from 'vue'

import type { Booking } from '@/modules/bookings/types/booking'
import { formatLocalTime } from '@/modules/bookings/utils/bookingTime'
import { daysBetween } from '@/modules/bookings/utils/reservationTimeline'
import { DEMO_CURRENCY } from '@/mocks/demoPeriod'
import BaseBadge from '@/shared/ui/BaseBadge.vue'
import BaseButton from '@/shared/ui/BaseButton.vue'
import BaseModal from '@/shared/ui/BaseModal.vue'

const props = defineProps<{ open: boolean; booking: Booking | null; roomName: string }>()
const emit = defineEmits<{ close: [] }>()
const money = new Intl.NumberFormat('en', { style: 'currency', currency: DEMO_CURRENCY })
const date = new Intl.DateTimeFormat('en', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
})
const nights = computed(() =>
  props.booking ? daysBetween(props.booking.checkIn, props.booking.checkOut) : 0,
)
const outstanding = computed(() =>
  props.booking ? Math.max(props.booking.totalAmount - props.booking.paidAmount, 0) : 0,
)
const badgeVariant = computed<'neutral' | 'success' | 'warning' | 'danger'>(() => {
  if (props.booking?.status === 'checked-in') return 'success'
  if (props.booking?.status === 'cancelled') return 'danger'
  if (props.booking?.status === 'confirmed') return 'warning'
  return 'neutral'
})
function formatDate(value: string): string {
  return date.format(new Date(`${value}T00:00:00Z`))
}
</script>

<template>
  <BaseModal :open :title="booking?.guestName ?? 'Booking details'" @close="emit('close')">
    <div v-if="booking" class="booking-detail">
      <div class="booking-detail__status">
        <BaseBadge :variant="badgeVariant">{{ booking.status }}</BaseBadge
        ><span>{{ booking.source }}</span>
      </div>
      <dl>
        <div>
          <dt>Room</dt>
          <dd>{{ roomName }}</dd>
        </div>
        <div>
          <dt>Check-in</dt>
          <dd>{{ formatDate(booking.checkIn) }} · {{ formatLocalTime(booking.checkInTime) }}</dd>
        </div>
        <div>
          <dt>Check-out</dt>
          <dd>{{ formatDate(booking.checkOut) }} · {{ formatLocalTime(booking.checkOutTime) }}</dd>
        </div>
        <div>
          <dt>Nights</dt>
          <dd>{{ nights }}</dd>
        </div>
        <div>
          <dt>Guests</dt>
          <dd>{{ booking.guestCount }}</dd>
        </div>
        <div>
          <dt>Total amount</dt>
          <dd>{{ money.format(booking.totalAmount) }}</dd>
        </div>
        <div>
          <dt>Paid amount</dt>
          <dd>{{ money.format(booking.paidAmount) }}</dd>
        </div>
        <div>
          <dt>Outstanding</dt>
          <dd>{{ money.format(outstanding) }}</dd>
        </div>
      </dl>
    </div>
    <template #footer
      ><BaseButton variant="secondary" @click="emit('close')">Close</BaseButton></template
    >
  </BaseModal>
</template>

<style scoped lang="scss">
.booking-detail__status {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  margin-bottom: var(--space-5);
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}
dl {
  margin: 0;
}
dl div {
  display: grid;
  grid-template-columns: minmax(7rem, 0.7fr) 1.3fr;
  gap: var(--space-4);
  padding: var(--space-3) 0;
  border-bottom: 1px solid var(--color-border);
}
dl div:last-child {
  border-bottom: 0;
}
dt {
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}
dd {
  margin: 0;
  color: var(--color-text-strong);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  text-align: right;
}
</style>
