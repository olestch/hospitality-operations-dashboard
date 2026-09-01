import { defineStore } from 'pinia'
import { reactive } from 'vue'

import type {
  DataDensity,
  MotionPreference,
  WorkspacePreferences,
} from '@/shared/types/preferences'
import {
  getBrowserPreferenceStorage,
  loadPreferences,
  savePreferences,
} from '@/shared/utils/preferencesPersistence'

export const usePreferencesStore = defineStore('preferences', () => {
  const storage = getBrowserPreferenceStorage()
  const preferences = reactive<WorkspacePreferences>(loadPreferences(storage))

  function persist(): void {
    savePreferences(storage, preferences)
  }

  function setPreferredProperty(propertyId: string | null): void {
    preferences.preferredPropertyId = propertyId
    persist()
  }

  function initializePreferredProperty(propertyId: string | null): void {
    if (preferences.preferredPropertyId === null && propertyId !== null) {
      setPreferredProperty(propertyId)
    }
  }

  function setDensity(density: DataDensity): void {
    preferences.density = density
    persist()
  }

  function setMotion(motion: MotionPreference): void {
    preferences.motion = motion
    persist()
  }

  return {
    preferences,
    setPreferredProperty,
    initializePreferredProperty,
    setDensity,
    setMotion,
  }
})
