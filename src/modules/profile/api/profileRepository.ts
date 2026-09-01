import { dataProvider } from '@/data'
import type { UserProfile } from '@/shared/types/user'

export async function getCurrentUser(): Promise<UserProfile> {
  return dataProvider.getCurrentUser()
}
