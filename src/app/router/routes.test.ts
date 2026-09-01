import { describe, expect, it } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'

import { routes } from '@/app/router/routes'

describe('application routes', () => {
  it('matches an unknown address to the Not Found route', async () => {
    const router = createRouter({ history: createMemoryHistory(), routes })
    await router.push('/missing/section')
    expect(router.currentRoute.value.name).toBe('not-found')
    expect(router.currentRoute.value.meta.title).toBe('Page not found')
  })
})
