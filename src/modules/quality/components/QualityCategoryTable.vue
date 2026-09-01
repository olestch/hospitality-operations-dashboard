<script setup lang="ts">
import type { CategoryBreakdown } from '@/modules/quality/utils/qualityMetrics'
import { formatQualityLabel } from '@/modules/quality/utils/qualityLabels'

defineProps<{ rows: readonly CategoryBreakdown[] }>()
</script>

<template>
  <div class="category-table-wrap">
    <table class="category-table">
      <caption class="sr-only">
        Finding and score breakdown by quality category
      </caption>
      <thead>
        <tr>
          <th>Category</th>
          <th>Findings</th>
          <th>Open</th>
          <th>High / critical</th>
          <th>Avg. score</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" :key="row.category">
          <th scope="row">{{ formatQualityLabel(row.category) }}</th>
          <td>{{ row.findingCount }}</td>
          <td>{{ row.openFindingCount }}</td>
          <td>{{ row.severeOpenFindingCount }}</td>
          <td>{{ row.averageScore === null ? '—' : `${Math.round(row.averageScore)}%` }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped lang="scss">
.category-table-wrap {
  overflow-x: auto;
}
.category-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  font-size: var(--font-size-sm);
}
th,
td {
  padding: var(--space-3) var(--space-2);
  border-bottom: 1px solid var(--color-border);
  text-align: right;
}
th:first-child,
td:first-child {
  width: 30%;
  padding-left: var(--space-4);
}
th:first-child,
td:first-child {
  text-align: left;
}
thead th {
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
}
tbody th {
  color: var(--color-text-strong);
  font-weight: var(--font-weight-medium);
}
tbody tr:last-child > * {
  border-bottom: 0;
}
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}
</style>
