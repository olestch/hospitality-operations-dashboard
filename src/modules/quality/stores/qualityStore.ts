import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'

import { usePropertyStore } from '@/app/stores/propertyStore'
import { getInspection, getInspections } from '@/modules/quality/api/inspectionsRepository'
import type {
  Inspection,
  InspectionCategory,
  InspectionDetail,
  InspectionStatus,
} from '@/modules/quality/types/inspection'
import {
  calculateCategoryBreakdown,
  calculateQualitySummary,
  createQualityTrend,
  filterInspections,
  type AttentionFilter,
} from '@/modules/quality/utils/qualityMetrics'
import type { RequestStatus } from '@/shared/types/request'

export const useQualityStore = defineStore('quality', () => {
  const propertyStore = usePropertyStore()
  const status = ref<RequestStatus>('idle')
  const error = ref<string | null>(null)
  const inspections = ref<Inspection[]>([])
  const statusFilter = ref<InspectionStatus | null>(null)
  const attentionFilter = ref<AttentionFilter>(null)
  const categoryFilter = ref<InspectionCategory | null>(null)

  const selectedInspectionId = ref<string | null>(null)
  const selectedInspection = ref<InspectionDetail | null>(null)
  const detailStatus = ref<RequestStatus>('idle')
  const detailError = ref<string | null>(null)
  let latestListRequest = 0
  let latestDetailRequest = 0

  const summary = computed(() => calculateQualitySummary(inspections.value))
  const trend = computed(() => createQualityTrend(inspections.value))
  const categoryBreakdown = computed(() => calculateCategoryBreakdown(inspections.value))
  const filteredInspections = computed(() =>
    filterInspections(inspections.value, {
      status: statusFilter.value,
      attention: attentionFilter.value,
      category: categoryFilter.value,
    }),
  )
  const categories = computed(() =>
    [
      ...new Set(
        inspections.value.flatMap((inspection) => [
          inspection.category,
          ...inspection.categorySummaries.map((item) => item.category),
        ]),
      ),
    ].sort(),
  )
  const hasActiveFilters = computed(
    () =>
      statusFilter.value !== null ||
      attentionFilter.value !== null ||
      categoryFilter.value !== null,
  )

  async function load(propertyId: string): Promise<void> {
    const requestId = ++latestListRequest
    status.value = 'loading'
    error.value = null
    try {
      const nextInspections = await getInspections({ propertyId })
      if (requestId !== latestListRequest) return
      inspections.value = nextInspections
      status.value = 'success'
    } catch (reason: unknown) {
      if (requestId !== latestListRequest) return
      error.value = reason instanceof Error ? reason.message : 'Unable to load inspections'
      status.value = 'failure'
    }
  }

  async function openInspection(inspectionId: string): Promise<void> {
    const requestId = ++latestDetailRequest
    selectedInspectionId.value = inspectionId
    selectedInspection.value = null
    detailStatus.value = 'loading'
    detailError.value = null
    try {
      const detail = await getInspection(inspectionId)
      if (requestId !== latestDetailRequest || selectedInspectionId.value !== inspectionId) return
      selectedInspection.value = detail
      detailStatus.value = 'success'
    } catch (reason: unknown) {
      if (requestId !== latestDetailRequest || selectedInspectionId.value !== inspectionId) return
      detailError.value = reason instanceof Error ? reason.message : 'Unable to load inspection'
      detailStatus.value = 'failure'
    }
  }

  function closeInspection(): void {
    latestDetailRequest += 1
    selectedInspectionId.value = null
    selectedInspection.value = null
    detailStatus.value = 'idle'
    detailError.value = null
  }

  function resetFilters(): void {
    statusFilter.value = null
    attentionFilter.value = null
    categoryFilter.value = null
  }

  async function retry(): Promise<void> {
    if (propertyStore.selectedPropertyId) await load(propertyStore.selectedPropertyId)
  }

  async function retryDetail(): Promise<void> {
    if (selectedInspectionId.value) await openInspection(selectedInspectionId.value)
  }

  watch(
    () => propertyStore.selectedPropertyId,
    (propertyId) => {
      closeInspection()
      if (propertyId) void load(propertyId)
    },
    { immediate: true },
  )

  return {
    status,
    error,
    inspections,
    statusFilter,
    attentionFilter,
    categoryFilter,
    selectedInspectionId,
    selectedInspection,
    detailStatus,
    detailError,
    summary,
    trend,
    categoryBreakdown,
    filteredInspections,
    categories,
    hasActiveFilters,
    openInspection,
    closeInspection,
    resetFilters,
    retry,
    retryDetail,
  }
})
