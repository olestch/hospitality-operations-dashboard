import { describe, expect, it, vi } from 'vitest'

import { DEFAULT_WORKSPACE_PREFERENCES } from '@/shared/types/preferences'
import {
  loadPreferences,
  PREFERENCES_STORAGE_KEY,
  savePreferences,
  type PreferenceStorage,
} from '@/shared/utils/preferencesPersistence'

function storageWith(value: string | null): PreferenceStorage {
  return { getItem: vi.fn(() => value), setItem: vi.fn() }
}

describe('preferences persistence', () => {
  it('returns deterministic defaults when no saved value exists', () => {
    expect(loadPreferences(storageWith(null))).toEqual(DEFAULT_WORKSPACE_PREFERENCES)
  })

  it('loads a complete valid preference value', () => {
    const preferences = {
      preferredPropertyId: 'prop-harbour-view',
      density: 'compact' as const,
      motion: 'reduced' as const,
    }
    expect(loadPreferences(storageWith(JSON.stringify(preferences)))).toEqual(preferences)
  })

  it('falls back for malformed or incomplete values', () => {
    expect(loadPreferences(storageWith('{bad json'))).toEqual(DEFAULT_WORKSPACE_PREFERENCES)
    expect(loadPreferences(storageWith(JSON.stringify({ density: 'compact' })))).toEqual(
      DEFAULT_WORKSPACE_PREFERENCES,
    )
  })

  it('does not fail when storage rejects a write', () => {
    const storage: PreferenceStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(() => {
        throw new Error('Storage disabled')
      }),
    }
    expect(() => savePreferences(storage, DEFAULT_WORKSPACE_PREFERENCES)).not.toThrow()
    expect(storage.setItem).toHaveBeenCalledWith(
      PREFERENCES_STORAGE_KEY,
      JSON.stringify(DEFAULT_WORKSPACE_PREFERENCES),
    )
  })
})
