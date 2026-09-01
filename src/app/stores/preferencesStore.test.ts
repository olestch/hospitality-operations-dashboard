import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'

import { usePreferencesStore } from '@/app/stores/preferencesStore'

describe('workspace preferences store', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('starts with deterministic defaults and updates density', () => {
    const store = usePreferencesStore()
    expect(store.preferences.density).toBe('comfortable')
    store.setDensity('compact')
    expect(store.preferences.density).toBe('compact')
  })

  it('does not replace an existing preferred property during initialization', () => {
    const store = usePreferencesStore()
    store.setPreferredProperty('property-a')
    store.initializePreferredProperty('property-b')
    expect(store.preferences.preferredPropertyId).toBe('property-a')
  })
})
