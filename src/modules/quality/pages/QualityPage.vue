<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed } from 'vue'

import { usePropertyStore } from '@/app/stores/propertyStore'
import InspectionDetailModal from '@/modules/quality/components/InspectionDetailModal.vue'
import InspectionList from '@/modules/quality/components/InspectionList.vue'
import QualityCategoryTable from '@/modules/quality/components/QualityCategoryTable.vue'
import QualityKpiCard from '@/modules/quality/components/QualityKpiCard.vue'
import QualityScoreTrendChart from '@/modules/quality/components/QualityScoreTrendChart.vue'
import { useQualityStore } from '@/modules/quality/stores/qualityStore'
import type { InspectionCategory, InspectionStatus } from '@/modules/quality/types/inspection'
import { formatQualityLabel } from '@/modules/quality/utils/qualityLabels'
import type { InspectionAttention } from '@/modules/quality/utils/qualityMetrics'
import BaseButton from '@/shared/ui/BaseButton.vue'
import BaseCard from '@/shared/ui/BaseCard.vue'
import BaseSelect, { type SelectOption, type SelectValue } from '@/shared/ui/BaseSelect.vue'
import EmptyState from '@/shared/ui/EmptyState.vue'
import PageHeader from '@/shared/ui/PageHeader.vue'

const propertyStore = usePropertyStore()
const qualityStore = useQualityStore()
const {
  status,
  error,
  inspections,
  statusFilter,
  attentionFilter,
  categoryFilter,
  summary,
  trend,
  categoryBreakdown,
  filteredInspections,
  categories,
  hasActiveFilters,
  selectedInspectionId,
  selectedInspection,
  detailStatus,
  detailError,
} = storeToRefs(qualityStore)

const statusOptions: readonly SelectOption[] = [
  { label: 'All statuses', value: 'all' },
  { label: 'Scheduled', value: 'scheduled' },
  { label: 'In progress', value: 'in-progress' },
  { label: 'Completed', value: 'completed' },
]
const attentionOptions: readonly SelectOption[] = [
  { label: 'All attention levels', value: 'all' },
  { label: 'Normal', value: 'normal' },
  { label: 'Needs attention', value: 'warning' },
  { label: 'Critical', value: 'critical' },
]
const categoryOptions = computed<readonly SelectOption[]>(() => [
  { label: 'All categories', value: 'all' },
  ...categories.value.map((category) => ({ label: formatQualityLabel(category), value: category })),
])
const statusModel = computed<SelectValue | null>({
  get: () => statusFilter.value ?? 'all',
  set: (value) => {
    statusFilter.value = value === 'all' ? null : (value as InspectionStatus)
  },
})
const attentionModel = computed<SelectValue | null>({
  get: () => attentionFilter.value ?? 'all',
  set: (value) => {
    attentionFilter.value = value === 'all' ? null : (value as InspectionAttention)
  },
})
const categoryModel = computed<SelectValue | null>({
  get: () => categoryFilter.value ?? 'all',
  set: (value) => {
    categoryFilter.value = value === 'all' ? null : (value as InspectionCategory)
  },
})
const pageDescription = computed(
  () =>
    `${propertyStore.selectedProperty?.name ?? 'Selected property'} · Inspection performance and open quality findings`,
)
const averageScore = computed(() =>
  summary.value.averageScore === null ? '—' : `${Math.round(summary.value.averageScore)}%`,
)
</script>

<template>
  <section class="quality-page">
    <PageHeader eyebrow="Standards" title="Quality" :description="pageDescription" />

    <div
      v-if="status === 'idle' || status === 'loading'"
      class="quality-loading"
      role="status"
      aria-live="polite"
    >
      <span class="sr-only">Loading quality inspections</span
      ><span v-for="index in 4" :key="index" />
    </div>
    <BaseCard v-else-if="status === 'failure'" class="quality-message" role="alert">
      <EmptyState
        title="Inspections could not be loaded"
        :description="error ?? 'Please try again.'"
        ><template #action
          ><BaseButton @click="qualityStore.retry">Try again</BaseButton></template
        ></EmptyState
      >
    </BaseCard>
    <BaseCard v-else-if="!inspections.length" class="quality-message">
      <EmptyState
        title="No inspections"
        description="No inspection records are available for this property."
      />
    </BaseCard>
    <template v-else>
      <section class="quality-kpis" aria-label="Quality summary">
        <QualityKpiCard
          label="Average completed score"
          :value="averageScore"
          :description="
            summary.averageScore === null
              ? 'No completed inspections'
              : 'Across completed inspections'
          "
        />
        <QualityKpiCard
          label="Completed inspections"
          :value="String(summary.completedCount)"
          description="Included in score trend"
        />
        <QualityKpiCard
          label="Open findings"
          :value="String(summary.openFindingCount)"
          description="Open or in progress"
        />
        <QualityKpiCard
          label="High / critical open"
          :value="String(summary.severeOpenFindingCount)"
          description="Priority operational follow-up"
          :tone="summary.severeOpenFindingCount ? 'warning' : 'neutral'"
        />
      </section>

      <div class="quality-analysis">
        <BaseCard class="trend-panel"
          ><template #header
            ><div class="section-heading">
              <h2>Inspection score trend</h2>
              <p>Completed inspections in chronological order</p>
            </div></template
          ><QualityScoreTrendChart :points="trend"
        /></BaseCard>
        <BaseCard class="category-panel"
          ><template #header
            ><div class="section-heading">
              <h2>Category breakdown</h2>
              <p>Scores and finding pressure by standard</p>
            </div></template
          ><QualityCategoryTable :rows="categoryBreakdown"
        /></BaseCard>
      </div>

      <BaseCard class="inspection-panel">
        <template #header
          ><div class="inspection-heading">
            <div class="section-heading">
              <h2>Inspection history</h2>
              <p>{{ filteredInspections.length }} of {{ inspections.length }} inspections</p>
            </div>
            <BaseButton
              v-if="hasActiveFilters"
              variant="ghost"
              size="small"
              @click="qualityStore.resetFilters"
              >Reset filters</BaseButton
            >
          </div></template
        >
        <div class="quality-filters" aria-label="Inspection filters">
          <BaseSelect v-model="statusModel" label="Status" :options="statusOptions" />
          <BaseSelect v-model="attentionModel" label="Attention" :options="attentionOptions" />
          <BaseSelect v-model="categoryModel" label="Category" :options="categoryOptions" />
        </div>
        <InspectionList
          v-if="filteredInspections.length"
          :inspections="filteredInspections"
          @select="qualityStore.openInspection"
        />
        <EmptyState
          v-else
          title="No matching inspections"
          description="Adjust or reset the filters to see inspection records."
          ><template #action
            ><BaseButton variant="secondary" @click="qualityStore.resetFilters"
              >Reset filters</BaseButton
            ></template
          ></EmptyState
        >
      </BaseCard>
    </template>

    <InspectionDetailModal
      :open="selectedInspectionId !== null"
      :inspection="selectedInspection"
      :status="detailStatus"
      :error="detailError"
      @close="qualityStore.closeInspection"
      @retry="qualityStore.retryDetail"
    />
  </section>
</template>

<style scoped lang="scss">
.quality-page {
  display: grid;
  min-width: 0;
  gap: var(--space-6);
}
.quality-page :deep(.page-header) {
  margin-bottom: 0;
}
.quality-kpis,
.quality-loading {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--space-4);
}
.quality-loading span:not(.sr-only) {
  min-height: 8rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-surface-subtle);
}
.quality-analysis {
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(24rem, 0.95fr);
  gap: var(--space-6);
}
.trend-panel,
.category-panel,
.inspection-panel {
  min-width: 0;
}
.trend-panel :deep(.card__content) {
  min-width: 0;
  padding: var(--space-2) var(--space-4) var(--space-3);
}
.category-panel :deep(.card__content),
.inspection-panel :deep(.card__content) {
  padding: 0;
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
.inspection-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
}
.quality-filters {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 13rem));
  gap: var(--space-4);
  padding: var(--space-4);
  border-bottom: 1px solid var(--color-border);
}
.quality-message {
  min-height: 22rem;
}
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}
@media (max-width: 72rem) {
  .quality-kpis,
  .quality-loading {
    grid-template-columns: repeat(2, 1fr);
  }
  .quality-analysis {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 48rem) {
  .quality-kpis,
  .quality-loading,
  .quality-filters {
    grid-template-columns: 1fr;
  }
  .quality-filters {
    gap: var(--space-3);
  }
}
</style>
