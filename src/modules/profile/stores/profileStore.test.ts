import { describe, expect, it } from 'vitest'

import { getUserInitials } from '@/modules/profile/stores/profileStore'

describe('profile display helpers', () => {
  it('creates up to two initials and handles surrounding whitespace', () => {
    expect(getUserInitials('  Operations User  ')).toBe('OU')
    expect(getUserInitials('Administrator')).toBe('A')
  })
})
