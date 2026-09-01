<script setup lang="ts">
import type { Inspection } from '@/modules/quality/types/inspection'
import { formatQualityLabel } from '@/modules/quality/utils/qualityLabels'
import { getInspectionAttention } from '@/modules/quality/utils/qualityMetrics'
import BaseBadge from '@/shared/ui/BaseBadge.vue'

defineProps<{ inspections: readonly Inspection[] }>()
const emit = defineEmits<{ select: [inspectionId: string] }>()
const dateFormatter = new Intl.DateTimeFormat('en', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
})
function formatDate(value: string): string {
  return dateFormatter.format(new Date(`${value}T00:00:00Z`))
}
function statusVariant(status: Inspection['status']) {
  return status === 'completed' ? 'success' : status === 'in-progress' ? 'warning' : 'neutral'
}
function attentionVariant(inspection: Inspection) {
  const attention = getInspectionAttention(inspection)
  return attention === 'critical' ? 'danger' : attention === 'warning' ? 'warning' : 'neutral'
}
function openCount(inspection: Inspection): number {
  return inspection.categorySummaries.reduce((sum, item) => sum + item.openFindingCount, 0)
}
</script>

<template>
  <div class="inspection-table-wrap">
    <table class="inspection-table">
      <caption class="sr-only">
        Inspections, newest scheduled date first
      </caption>
      <thead>
        <tr>
          <th>Inspection</th>
          <th>Date</th>
          <th>Status</th>
          <th>Score</th>
          <th>Open findings</th>
          <th>Attention</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="inspection in inspections" :key="inspection.id">
          <th scope="row">
            <button type="button" @click="emit('select', inspection.id)">
              <strong>{{ inspection.title }}</strong
              ><small>{{ inspection.area }} · {{ inspection.inspector }}</small>
            </button>
          </th>
          <td>{{ formatDate(inspection.scheduledDate) }}</td>
          <td>
            <BaseBadge :variant="statusVariant(inspection.status)">{{
              formatQualityLabel(inspection.status)
            }}</BaseBadge>
          </td>
          <td>{{ inspection.score === null ? '—' : `${inspection.score}%` }}</td>
          <td>{{ openCount(inspection) }}</td>
          <td>
            <BaseBadge :variant="attentionVariant(inspection)">{{
              formatQualityLabel(getInspectionAttention(inspection))
            }}</BaseBadge>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  <ul class="inspection-cards">
    <li v-for="inspection in inspections" :key="inspection.id">
      <button type="button" @click="emit('select', inspection.id)">
        <span class="inspection-card__heading"
          ><strong>{{ inspection.title }}</strong
          ><BaseBadge :variant="attentionVariant(inspection)">{{
            formatQualityLabel(getInspectionAttention(inspection))
          }}</BaseBadge></span
        >
        <span>{{ formatDate(inspection.scheduledDate) }} · {{ inspection.area }}</span>
        <span
          >Score {{ inspection.score === null ? '—' : `${inspection.score}%` }} ·
          {{ openCount(inspection) }} open</span
        >
      </button>
    </li>
  </ul>
</template>

<style scoped lang="scss">
.inspection-table-wrap {
  overflow-x: auto;
}
.inspection-table {
  width: 100%;
  min-width: 52rem;
  border-collapse: collapse;
  font-size: var(--font-size-sm);
}
th,
td {
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--color-border);
  text-align: left;
  vertical-align: middle;
}
thead th {
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
}
tbody tr:last-child > * {
  border-bottom: 0;
}
tbody th {
  width: 38%;
}
tbody th button {
  display: grid;
  width: 100%;
  gap: var(--space-1);
  padding: 0;
  border: 0;
  background: none;
  color: inherit;
  text-align: left;
  cursor: pointer;
}
tbody th button:hover strong {
  color: var(--color-primary);
}
tbody small {
  color: var(--color-text-muted);
  font-weight: var(--font-weight-regular);
}
.inspection-cards {
  display: none;
  margin: 0;
  padding: 0;
  list-style: none;
}
.inspection-cards li {
  border-bottom: 1px solid var(--color-border);
}
.inspection-cards li:last-child {
  border-bottom: 0;
}
.inspection-cards button {
  display: grid;
  width: 100%;
  gap: var(--space-2);
  padding: var(--space-4);
  border: 0;
  background: none;
  color: var(--color-text-muted);
  font: inherit;
  font-size: var(--font-size-xs);
  text-align: left;
  cursor: pointer;
}
.inspection-card__heading {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: var(--space-3);
  color: var(--color-text-strong);
  font-size: var(--font-size-sm);
}
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}
@media (max-width: 48rem) {
  .inspection-table-wrap {
    display: none;
  }
  .inspection-cards {
    display: block;
  }
}
</style>
