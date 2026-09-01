import type { UserProfile } from '@/shared/types/user'

export const mockCurrentUser: UserProfile = {
  id: 'user-demo-001',
  name: 'Operations User',
  email: 'operations.user@example.test',
  role: 'Portfolio Manager',
  avatar: null,
  preferredPropertyId: 'prop-north-quay',
}
