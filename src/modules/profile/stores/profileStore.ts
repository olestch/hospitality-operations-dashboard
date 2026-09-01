import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import { getCurrentUser } from '@/modules/profile/api/profileRepository'
import type { RequestStatus } from '@/shared/types/request'
import type { UserProfile } from '@/shared/types/user'

export function getUserInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

export const useProfileStore = defineStore('profile', () => {
  const profile = ref<UserProfile | null>(null)
  const status = ref<RequestStatus>('idle')
  const error = ref<string | null>(null)
  let requestId = 0

  const initials = computed(() => getUserInitials(profile.value?.name ?? 'User'))

  async function loadProfile(force = false): Promise<void> {
    if (!force && (status.value === 'loading' || status.value === 'success')) return
    const activeRequestId = ++requestId
    status.value = 'loading'
    error.value = null
    try {
      const loadedProfile = await getCurrentUser()
      if (activeRequestId !== requestId) return
      profile.value = loadedProfile
      status.value = 'success'
    } catch (reason: unknown) {
      if (activeRequestId !== requestId) return
      error.value = reason instanceof Error ? reason.message : 'Unable to load profile'
      status.value = 'failure'
    }
  }

  return { profile, status, error, initials, loadProfile }
})
