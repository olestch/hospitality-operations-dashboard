import {
  DATA_DENSITIES,
  DEFAULT_WORKSPACE_PREFERENCES,
  MOTION_PREFERENCES,
  type WorkspacePreferences,
} from '@/shared/types/preferences'

export const PREFERENCES_STORAGE_KEY = 'hospitality-operations.preferences.v1'

export interface PreferenceStorage {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

function isWorkspacePreferences(value: unknown): value is WorkspacePreferences {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Record<string, unknown>
  const preferredPropertyId = candidate.preferredPropertyId

  return (
    (preferredPropertyId === null || typeof preferredPropertyId === 'string') &&
    DATA_DENSITIES.some((density) => density === candidate.density) &&
    MOTION_PREFERENCES.some((motion) => motion === candidate.motion)
  )
}

export function loadPreferences(storage: PreferenceStorage | null): WorkspacePreferences {
  if (!storage) return { ...DEFAULT_WORKSPACE_PREFERENCES }

  try {
    const rawPreferences = storage.getItem(PREFERENCES_STORAGE_KEY)
    if (!rawPreferences) return { ...DEFAULT_WORKSPACE_PREFERENCES }
    const parsedPreferences: unknown = JSON.parse(rawPreferences)
    return isWorkspacePreferences(parsedPreferences)
      ? { ...parsedPreferences }
      : { ...DEFAULT_WORKSPACE_PREFERENCES }
  } catch {
    return { ...DEFAULT_WORKSPACE_PREFERENCES }
  }
}

export function savePreferences(
  storage: PreferenceStorage | null,
  preferences: WorkspacePreferences,
): void {
  if (!storage) return
  try {
    storage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(preferences))
  } catch {
    // Storage can be unavailable in private browsing or restricted environments.
  }
}

export function getBrowserPreferenceStorage(): PreferenceStorage | null {
  if (typeof window === 'undefined') return null
  try {
    return window.localStorage
  } catch {
    return null
  }
}
