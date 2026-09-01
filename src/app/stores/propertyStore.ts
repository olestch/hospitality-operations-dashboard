import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import { getProperties } from '@/shared/api/propertiesRepository'
import type { Property } from '@/shared/types/property'
import type { RequestStatus } from '@/shared/types/request'

export const usePropertyStore = defineStore('property', () => {
  const properties = ref<Property[]>([])
  const selectedPropertyId = ref<string | null>(null)
  const status = ref<RequestStatus>('idle')
  const error = ref<string | null>(null)

  const selectedProperty = computed(
    () => properties.value.find((property) => property.id === selectedPropertyId.value) ?? null,
  )

  async function loadProperties(): Promise<void> {
    if (status.value === 'loading' || status.value === 'success') return

    status.value = 'loading'
    error.value = null

    try {
      properties.value = await getProperties()
      selectedPropertyId.value = properties.value[0]?.id ?? null
      status.value = 'success'
    } catch (reason: unknown) {
      error.value = reason instanceof Error ? reason.message : 'Unable to load properties'
      status.value = 'failure'
    }
  }

  function selectProperty(propertyId: string): void {
    if (properties.value.some((property) => property.id === propertyId)) {
      selectedPropertyId.value = propertyId
    }
  }

  return {
    properties,
    selectedPropertyId,
    selectedProperty,
    status,
    error,
    loadProperties,
    selectProperty,
  }
})
