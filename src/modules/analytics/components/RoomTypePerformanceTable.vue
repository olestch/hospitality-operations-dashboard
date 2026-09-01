<script setup lang="ts">
import type { RoomTypePerformance } from '@/modules/analytics/utils/hospitalityMetrics'
import { DEMO_CURRENCY } from '@/mocks/demoPeriod'

defineProps<{ rows: readonly RoomTypePerformance[] }>()
const currencyFormatter = new Intl.NumberFormat('en', {
  style: 'currency',
  currency: DEMO_CURRENCY,
  maximumFractionDigits: 0,
})
const percentageFormatter = new Intl.NumberFormat('en', {
  style: 'percent',
  maximumFractionDigits: 1,
})
</script>

<template>
  <div class="room-type-table">
    <table>
      <thead>
        <tr>
          <th scope="col">Room type</th>
          <th scope="col">Rooms</th>
          <th scope="col">Occupied nights</th>
          <th scope="col">Sellable nights</th>
          <th scope="col">Occupancy</th>
          <th scope="col">Revenue</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" :key="row.roomType">
          <th scope="row">{{ row.roomType }}</th>
          <td>{{ row.roomCount }}</td>
          <td>{{ row.occupiedRoomNights }}</td>
          <td>{{ row.sellableRoomNights }}</td>
          <td>
            <div class="occupancy-cell">
              <span>{{ percentageFormatter.format(row.occupancy) }}</span>
              <span class="occupancy-track" aria-hidden="true"
                ><span :style="{ width: `${Math.min(row.occupancy * 100, 100)}%` }"
              /></span>
            </div>
          </td>
          <td>{{ currencyFormatter.format(row.revenue) }}</td>
        </tr>
      </tbody>
    </table>

    <div class="room-type-cards">
      <article v-for="row in rows" :key="row.roomType">
        <div>
          <h3>{{ row.roomType }}</h3>
          <strong>{{ percentageFormatter.format(row.occupancy) }}</strong>
        </div>
        <dl>
          <div>
            <dt>Rooms</dt>
            <dd>{{ row.roomCount }}</dd>
          </div>
          <div>
            <dt>Occupied / sellable nights</dt>
            <dd>{{ row.occupiedRoomNights }} / {{ row.sellableRoomNights }}</dd>
          </div>
          <div>
            <dt>Revenue</dt>
            <dd>{{ currencyFormatter.format(row.revenue) }}</dd>
          </div>
        </dl>
      </article>
    </div>
  </div>
</template>

<style scoped lang="scss">
table {
  width: 100%;
  border-collapse: collapse;
}
th,
td {
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--color-border);
  color: var(--color-text);
  font-size: var(--font-size-sm);
  text-align: right;
}
thead th {
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
}
th:first-child {
  text-align: left;
}
tbody th {
  color: var(--color-text-strong);
}
tbody tr:last-child th,
tbody tr:last-child td {
  border-bottom: 0;
}
.occupancy-cell {
  display: grid;
  min-width: 8rem;
  gap: var(--space-2);
}
.occupancy-track {
  height: 0.35rem;
  overflow: hidden;
  border-radius: var(--radius-full);
  background: var(--color-primary-soft);
}
.occupancy-track span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: var(--color-primary);
}
.room-type-cards {
  display: none;
}
@media (max-width: 48rem) {
  table {
    display: none;
  }
  .room-type-cards {
    display: grid;
  }
  .room-type-cards article {
    padding: var(--space-4);
    border-bottom: 1px solid var(--color-border);
  }
  .room-type-cards article:last-child {
    border-bottom: 0;
  }
  .room-type-cards article > div,
  .room-type-cards dl div {
    display: flex;
    justify-content: space-between;
    gap: var(--space-3);
  }
  .room-type-cards h3,
  .room-type-cards dl,
  .room-type-cards dt,
  .room-type-cards dd {
    margin: 0;
  }
  .room-type-cards h3,
  .room-type-cards strong {
    color: var(--color-text-strong);
    font-size: var(--font-size-sm);
  }
  .room-type-cards dl {
    display: grid;
    gap: var(--space-2);
    margin-top: var(--space-3);
  }
  .room-type-cards dt,
  .room-type-cards dd {
    color: var(--color-text-muted);
    font-size: var(--font-size-xs);
  }
}
</style>
