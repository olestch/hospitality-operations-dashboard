import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'

import { usePropertyStore } from '@/app/stores/propertyStore'
import { getInspection, getInspections } from '@/modules/quality/api/inspectionsRepository'
import { useQualityStore } from '@/modules/quality/stores/qualityStore'
import type { InspectionDetail } from '@/modules/quality/types/inspection'

vi.mock('@/modules/quality/api/inspectionsRepository', () => ({
  getInspections: vi.fn(),
  getInspection: vi.fn(),
}))

const mockedGetInspections = vi.mocked(getInspections)
const mockedGetInspection = vi.mocked(getInspection)

function detail(id: string): InspectionDetail {
  return {
    id,
    propertyId: 'property-a',
    title: id,
    category: 'safety',
    area: 'Lobby',
    inspector: 'Inspector',
    scheduledDate: '2025-03-01',
    completedDate: '2025-03-01',
    status: 'completed',
    score: 90,
    categorySummaries: [
      {
        category: 'safety',
        score: 90,
        findingCount: 0,
        openFindingCount: 0,
        severeOpenFindingCount: 0,
        highestOpenSeverity: null,
      },
    ],
    categoryScores: [{ category: 'safety', score: 90 }],
    findings: [],
  }
}

describe('quality store detail loading', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    mockedGetInspections.mockReset().mockResolvedValue([])
    mockedGetInspection.mockReset()
  })

  it('ignores a slower detail response after another inspection is selected', async () => {
    let resolveFirst!: (value: InspectionDetail) => void
    let resolveSecond!: (value: InspectionDetail) => void
    mockedGetInspection
      .mockReturnValueOnce(
        new Promise((resolve) => {
          resolveFirst = resolve
        }),
      )
      .mockReturnValueOnce(
        new Promise((resolve) => {
          resolveSecond = resolve
        }),
      )
    const store = useQualityStore()

    const firstRequest = store.openInspection('first')
    const secondRequest = store.openInspection('second')
    resolveSecond(detail('second'))
    await secondRequest
    resolveFirst(detail('first'))
    await firstRequest

    expect(store.selectedInspectionId).toBe('second')
    expect(store.selectedInspection?.id).toBe('second')
  })

  it('invalidates an open detail request when the property changes', async () => {
    let resolveDetail!: (value: InspectionDetail) => void
    mockedGetInspection.mockReturnValue(
      new Promise((resolve) => {
        resolveDetail = resolve
      }),
    )
    const propertyStore = usePropertyStore()
    const store = useQualityStore()
    const request = store.openInspection('first')

    propertyStore.selectedPropertyId = 'property-b'
    await nextTick()
    resolveDetail(detail('first'))
    await request

    expect(store.selectedInspectionId).toBeNull()
    expect(store.selectedInspection).toBeNull()
  })
})
