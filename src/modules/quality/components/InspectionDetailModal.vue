<script setup lang="ts">
import type { InspectionDetail } from '@/modules/quality/types/inspection'
import { formatQualityLabel } from '@/modules/quality/utils/qualityLabels'
import BaseBadge from '@/shared/ui/BaseBadge.vue'
import BaseButton from '@/shared/ui/BaseButton.vue'
import BaseModal from '@/shared/ui/BaseModal.vue'
import EmptyState from '@/shared/ui/EmptyState.vue'
import type { RequestStatus } from '@/shared/types/request'

defineProps<{
  open: boolean
  inspection: InspectionDetail | null
  status: RequestStatus
  error: string | null
}>()
const emit = defineEmits<{ close: []; retry: [] }>()
const dateFormatter = new Intl.DateTimeFormat('en', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
})
function formatDate(value: string): string {
  return dateFormatter.format(new Date(`${value}T00:00:00Z`))
}
function severityVariant(severity: 'low' | 'medium' | 'high' | 'critical') {
  return severity === 'critical'
    ? 'danger'
    : severity === 'high' || severity === 'medium'
      ? 'warning'
      : 'neutral'
}
function resolutionVariant(resolution: 'open' | 'in-progress' | 'resolved') {
  return resolution === 'resolved' ? 'success' : resolution === 'in-progress' ? 'warning' : 'danger'
}
</script>

<template>
  <BaseModal
    :open
    :title="inspection?.title ?? 'Inspection details'"
    size="large"
    @close="emit('close')"
  >
    <div v-if="status === 'loading'" class="detail-state" role="status" aria-live="polite">
      Loading inspection details…
    </div>
    <EmptyState
      v-else-if="status === 'failure'"
      title="Details could not be loaded"
      :description="error ?? 'Please try again.'"
      ><template #action
        ><BaseButton @click="emit('retry')">Try again</BaseButton></template
      ></EmptyState
    >
    <article v-else-if="inspection" class="inspection-detail">
      <dl class="detail-meta">
        <div>
          <dt>Status</dt>
          <dd>{{ formatQualityLabel(inspection.status) }}</dd>
        </div>
        <div>
          <dt>Scheduled</dt>
          <dd>{{ formatDate(inspection.scheduledDate) }}</dd>
        </div>
        <div>
          <dt>Inspector</dt>
          <dd>{{ inspection.inspector }}</dd>
        </div>
        <div>
          <dt>Area</dt>
          <dd>{{ inspection.area }}</dd>
        </div>
        <div>
          <dt>Overall score</dt>
          <dd>{{ inspection.score === null ? 'Not available' : `${inspection.score}%` }}</dd>
        </div>
      </dl>

      <section
        v-if="inspection.categoryScores.length"
        class="detail-section"
        aria-labelledby="category-scores-title"
      >
        <h3 id="category-scores-title">Category scores</h3>
        <ul class="score-list">
          <li v-for="item in inspection.categoryScores" :key="item.category">
            <span>{{ formatQualityLabel(item.category) }}</span
            ><strong>{{ item.score }}%</strong>
          </li>
        </ul>
      </section>

      <section class="detail-section" aria-labelledby="findings-title">
        <h3 id="findings-title">Findings</h3>
        <ul v-if="inspection.findings.length" class="finding-list">
          <li v-for="finding in inspection.findings" :key="finding.id">
            <div>
              <strong>{{ finding.title }}</strong
              ><span
                ><BaseBadge :variant="severityVariant(finding.severity)">{{
                  formatQualityLabel(finding.severity)
                }}</BaseBadge
                ><BaseBadge :variant="resolutionVariant(finding.resolution)">{{
                  formatQualityLabel(finding.resolution)
                }}</BaseBadge></span
              >
            </div>
            <p>{{ finding.description }}</p>
            <small
              >{{ formatQualityLabel(finding.category)
              }}<template v-if="finding.location"> · {{ finding.location }}</template></small
            >
          </li>
        </ul>
        <p v-else class="no-findings">No findings recorded for this inspection.</p>
      </section>
      <section v-if="inspection.notes" class="detail-section">
        <h3>Notes</h3>
        <p>{{ inspection.notes }}</p>
      </section>
    </article>
  </BaseModal>
</template>

<style scoped lang="scss">
.detail-state {
  min-height: 14rem;
  display: grid;
  place-items: center;
  color: var(--color-text-muted);
}
.inspection-detail {
  display: grid;
  gap: var(--space-6);
}
.detail-meta {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-4);
  margin: 0;
}
.detail-meta div {
  display: grid;
  gap: var(--space-1);
}
dt {
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
}
dd {
  margin: 0;
  color: var(--color-text-strong);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}
.detail-section {
  display: grid;
  gap: var(--space-3);
}
.detail-section h3 {
  margin: 0;
  color: var(--color-text-strong);
  font-size: var(--font-size-md);
}
.detail-section > p {
  margin: 0;
  color: var(--color-text);
  font-size: var(--font-size-sm);
}
.score-list,
.finding-list {
  margin: 0;
  padding: 0;
  list-style: none;
}
.score-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-2);
}
.score-list li {
  display: flex;
  justify-content: space-between;
  gap: var(--space-3);
  padding: var(--space-3);
  border-radius: var(--radius-md);
  background: var(--color-surface-subtle);
  font-size: var(--font-size-sm);
}
.finding-list {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}
.finding-list li {
  display: grid;
  gap: var(--space-2);
  padding: var(--space-4);
  border-bottom: 1px solid var(--color-border);
}
.finding-list li:last-child {
  border-bottom: 0;
}
.finding-list div {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: var(--space-3);
}
.finding-list div span {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}
.finding-list p {
  margin: 0;
  color: var(--color-text);
  font-size: var(--font-size-sm);
}
.finding-list small,
.no-findings {
  color: var(--color-text-muted);
}
@media (max-width: 48rem) {
  .detail-meta {
    grid-template-columns: repeat(2, 1fr);
  }
  .score-list {
    grid-template-columns: 1fr;
  }
  .finding-list div {
    flex-direction: column;
  }
}
</style>
