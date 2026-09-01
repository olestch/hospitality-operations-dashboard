import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { usePropertyStore } from '@/app/stores/propertyStore'
import { getProperties } from '@/shared/api/propertiesRepository'
import type { Property } from '@/shared/types/property'

vi.mock('@/shared/api/propertiesRepository', () => ({ getProperties: vi.fn() }))
const mockedGetProperties = vi.mocked(getProperties)
const properties: Property[] = [
  {
    id: 'property-a',
    name: 'Property A',
    city: 'Alder',
    country: 'Norland',
    timezone: 'Europe/Lisbon',
    roomCount: 10,
  },
  {
    id: 'property-b',
    name: 'Property B',
    city: 'Birch',
    country: 'Norland',
    timezone: 'Europe/Paris',
    roomCount: 12,
  },
]

describe('property workspace preference', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    mockedGetProperties.mockResolvedValue(properties)
  })

  it('uses a valid preferred property on initial load', async () => {
    const store = usePropertyStore()
    await store.loadProperties('property-b')
    expect(store.selectedPropertyId).toBe('property-b')
  })

  it('falls back to the first property for an unknown preference', async () => {
    const store = usePropertyStore()
    await store.loadProperties('missing-property')
    expect(store.selectedPropertyId).toBe('property-a')
  })
})
