<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

import { usePropertyStore } from '@/app/stores/propertyStore'
import DashboardKpiCard from '@/modules/dashboard/components/DashboardKpiCard.vue'
import { useDashboardStore } from '@/modules/dashboard/stores/dashboardStore'
import { deriveStockStatus } from '@/modules/inventory/utils/stockLevels'
import { DEMO_DATE } from '@/mocks/demoPeriod'
import RevenueTrendChart from '@/shared/charts/RevenueTrendChart.vue'
import BaseBadge from '@/shared/ui/BaseBadge.vue'
import BaseButton from '@/shared/ui/BaseButton.vue'
import BaseCard from '@/shared/ui/BaseCard.vue'
import EmptyState from '@/shared/ui/EmptyState.vue'
import PageHeader from '@/shared/ui/PageHeader.vue'

const propertyStore = usePropertyStore()
const dashboardStore = useDashboardStore()
const {
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
} = storeToRefs(dashboardStore)

const dateFormatter = new Intl.DateTimeFormat('en', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
})
const shortDateFormatter = new Intl.DateTimeFormat('en', {
  month: 'short',
  day: 'numeric',
  timeZone: 'UTC',
})
const pageDescription = computed(() => {
  const propertyName = propertyStore.selectedProperty?.name ?? 'Selected property'
  return `${propertyName} · Fixed operational view for ${formatDate(DEMO_DATE)}`
})
const inventoryIssueSummary = computed(() => ({
  reorder: inventoryIssues.value.filter((item) => {
    const status = deriveStockStatus(item)
    return status === 'reorder' || status === 'out-of-stock'
  }).length,
  belowPar: inventoryIssues.value.filter((item) => deriveStockStatus(item) === 'below-par').length,
}))

function formatDate(date: string): string {
  return dateFormatter.format(new Date(`${date}T00:00:00Z`))
}

function formatShortDate(date: string): string {
  return shortDateFormatter.format(new Date(`${date}T00:00:00Z`))
}

function bookingBadge(status: string): 'neutral' | 'success' | 'warning' | 'danger' {
  if (status === 'checked-in') return 'success'
  if (status === 'confirmed') return 'neutral'
  if (status === 'cancelled') return 'danger'
  return 'neutral'
}
</script>

<template>
  <section class="overview-page">
    <PageHeader eyebrow="Workspace" title="Operational overview" :description="pageDescription" />

    <div
      v-if="status === 'idle' || status === 'loading'"
      class="dashboard-loading"
      role="status"
      aria-live="polite"
    >
      <span class="sr-only">Loading overview data</span>
      <div class="dashboard-loading__kpis">
        <span v-for="index in 4" :key="index" class="dashboard-skeleton dashboard-skeleton--kpi" />
      </div>
      <span class="dashboard-skeleton dashboard-skeleton--chart" />
    </div>

    <BaseCard v-else-if="status === 'failure'" class="dashboard-message" role="alert">
      <EmptyState title="Overview could not be loaded" :description="error ?? 'Please try again.'">
        <template #action
          ><BaseButton @click="dashboardStore.retry">Try again</BaseButton></template
        >
      </EmptyState>
    </BaseCard>

    <BaseCard v-else-if="!hasData" class="dashboard-message">
      <EmptyState
        title="No overview data"
        description="There is no operational data for this property and demo date."
      />
    </BaseCard>

    <template v-else>
      <section aria-labelledby="performance-heading">
        <h2 id="performance-heading" class="sr-only">Property performance</h2>
        <div class="kpi-grid">
          <DashboardKpiCard v-for="kpi in kpis" :key="kpi.key" :kpi="kpi" />
        </div>
      </section>

      <BaseCard class="revenue-panel">
        <template #header>
          <div class="section-heading">
            <div>
              <h2>Revenue trend</h2>
              <p>Daily room revenue through {{ formatDate(DEMO_DATE) }}</p>
            </div>
            <BaseBadge variant="neutral">30 days</BaseBadge>
          </div>
        </template>
        <RevenueTrendChart :metrics="revenueTrend" />
      </BaseCard>

      <div class="overview-grid">
        <BaseCard class="operations-card">
          <template #header>
            <div class="section-heading">
              <div>
                <h2>Today's operations</h2>
                <p>{{ formatDate(DEMO_DATE) }}</p>
              </div>
            </div>
          </template>
          <dl class="operations-list">
            <div>
              <dt>Occupied rooms</dt>
              <dd>{{ dailyOperations.occupiedRooms }}</dd>
            </div>
            <div>
              <dt>Available rooms</dt>
              <dd>{{ dailyOperations.availableRooms }}</dd>
            </div>
            <div>
              <dt>Maintenance / out of service</dt>
              <dd>{{ dailyOperations.unavailableRooms }}</dd>
            </div>
            <div>
              <dt>Arrivals today</dt>
              <dd>{{ dailyOperations.arrivals }}</dd>
            </div>
            <div>
              <dt>Departures today</dt>
              <dd>{{ dailyOperations.departures }}</dd>
            </div>
          </dl>
        </BaseCard>

        <BaseCard class="activity-card">
          <template #header>
            <div class="section-heading">
              <div>
                <h2>Upcoming activity</h2>
                <p>Next confirmed stays after the demo date</p>
              </div>
              <RouterLink class="text-link" to="/bookings">View bookings</RouterLink>
            </div>
          </template>
          <ul v-if="upcomingBookings.length" class="activity-list">
            <li v-for="item in upcomingBookings" :key="item.booking.id">
              <div class="activity-list__guest">
                <strong>{{ item.booking.guestName }}</strong
                ><span>{{ item.roomName }} · {{ item.booking.source }}</span>
              </div>
              <div class="activity-list__dates">
                <span
                  >{{ formatShortDate(item.booking.checkIn) }} –
                  {{ formatShortDate(item.booking.checkOut) }}</span
                ><BaseBadge :variant="bookingBadge(item.booking.status)">{{
                  item.booking.status
                }}</BaseBadge>
              </div>
            </li>
          </ul>
          <EmptyState
            v-else
            title="No upcoming stays"
            description="No future bookings are scheduled in the demo period."
          />
        </BaseCard>
      </div>

      <BaseCard class="attention-card">
        <template #header>
          <div class="section-heading">
            <div>
              <h2>Operational attention</h2>
              <p>Current exceptions derived from rooms, inventory, and quality schedules</p>
            </div>
          </div>
        </template>
        <div class="attention-grid">
          <article>
            <BaseBadge :variant="unavailableRooms.length ? 'warning' : 'success'"
              >{{ unavailableRooms.length }} rooms</BaseBadge
            >
            <h3>Room availability</h3>
            <p>
              {{
                unavailableRooms.length
                  ? `${unavailableRooms.length} room(s) require operational follow-up.`
                  : 'No rooms are blocked from service.'
              }}
            </p>
          </article>
          <article>
            <BaseBadge :variant="inventoryIssues.length ? 'danger' : 'success'"
              >{{ inventoryIssues.length }} issues</BaseBadge
            >
            <h3>Inventory exceptions</h3>
            <p>
              {{ inventoryIssueSummary.reorder }} reorder ·
              {{ inventoryIssueSummary.belowPar }} below par
            </p>
            <RouterLink class="text-link" to="/inventory">Review inventory</RouterLink>
          </article>
          <article>
            <BaseBadge :variant="upcomingInspections.length ? 'warning' : 'success'"
              >{{ upcomingInspections.length }} upcoming</BaseBadge
            >
            <h3>Quality schedule</h3>
            <p v-if="upcomingInspections[0]">
              Next: {{ upcomingInspections[0].title }} on
              {{ formatShortDate(upcomingInspections[0].scheduledDate) }}
            </p>
            <p v-else>No inspections are scheduled.</p>
            <RouterLink class="text-link" to="/quality">Review quality</RouterLink>
          </article>
        </div>
      </BaseCard>
    </template>
  </section>
</template>

<style scoped lang="scss">
.overview-page {
  display: grid;
  gap: var(--space-6);
}
.overview-page :deep(.page-header) {
  margin-bottom: 0;
}
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}
.kpi-grid,
.dashboard-loading__kpis {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--space-4);
}
.section-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
}
.section-heading h2 {
  margin: 0;
  color: var(--color-text-strong);
  font-size: var(--font-size-md);
}
.section-heading p {
  margin: var(--space-1) 0 0;
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
}
.revenue-panel :deep(.card__content) {
  padding: var(--space-3) var(--space-4) var(--space-2);
}
.overview-grid {
  display: grid;
  grid-template-columns: minmax(17rem, 0.75fr) minmax(0, 1.5fr);
  gap: var(--space-6);
}
.operations-card :deep(.card__content),
.activity-card :deep(.card__content),
.attention-card :deep(.card__content) {
  padding: 0;
}
.operations-list {
  margin: 0;
}
.operations-list div {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  padding: var(--space-3) var(--space-5);
  border-bottom: 1px solid var(--color-border);
}
.operations-list div:last-child {
  border-bottom: 0;
}
.operations-list dt {
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}
.operations-list dd {
  margin: 0;
  color: var(--color-text-strong);
  font-weight: var(--font-weight-bold);
}
.activity-list {
  margin: 0;
  padding: 0;
  list-style: none;
}
.activity-list li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  padding: var(--space-3) var(--space-5);
  border-bottom: 1px solid var(--color-border);
}
.activity-list li:last-child {
  border-bottom: 0;
}
.activity-list__guest,
.activity-list__dates {
  display: grid;
  gap: var(--space-1);
}
.activity-list__guest strong {
  color: var(--color-text-strong);
  font-size: var(--font-size-sm);
}
.activity-list__guest span,
.activity-list__dates > span {
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
}
.activity-list__dates {
  justify-items: end;
}
.text-link {
  color: var(--color-primary);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  text-decoration: none;
}
.text-link:hover {
  text-decoration: underline;
}
.attention-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}
.attention-grid article {
  padding: var(--space-5);
  border-right: 1px solid var(--color-border);
}
.attention-grid article:last-child {
  border-right: 0;
}
.attention-grid h3 {
  margin: var(--space-3) 0 var(--space-1);
  color: var(--color-text-strong);
  font-size: var(--font-size-sm);
}
.attention-grid p {
  min-height: 2.5rem;
  margin: 0 0 var(--space-3);
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
}
.dashboard-loading {
  display: grid;
  gap: var(--space-6);
}
.dashboard-skeleton {
  display: block;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-surface-subtle);
  animation: pulse 1.2s ease-in-out infinite alternate;
}
.dashboard-skeleton--kpi {
  min-height: 9rem;
}
.dashboard-skeleton--chart {
  min-height: 24rem;
}
.dashboard-message {
  min-height: 22rem;
}
@keyframes pulse {
  to {
    opacity: 0.55;
  }
}

@media (max-width: 72rem) {
  .kpi-grid,
  .dashboard-loading__kpis {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .overview-grid {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 48rem) {
  .kpi-grid,
  .dashboard-loading__kpis,
  .attention-grid {
    grid-template-columns: 1fr;
  }
  .activity-list li {
    align-items: flex-start;
  }
  .activity-list__dates {
    flex: 0 0 auto;
  }
  .attention-grid article {
    border-right: 0;
    border-bottom: 1px solid var(--color-border);
  }
  .attention-grid article:last-child {
    border-bottom: 0;
  }
}
@media (prefers-reduced-motion: reduce) {
  .dashboard-skeleton {
    animation: none;
  }
}
</style>
