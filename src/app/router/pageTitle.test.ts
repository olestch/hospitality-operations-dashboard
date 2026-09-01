import { describe, expect, it } from 'vitest'

import { createDocumentTitle } from '@/app/router/pageTitle'

describe('document titles', () => {
  it('combines a route title with the application name', () => {
    expect(createDocumentTitle('Inventory')).toBe('Inventory · Hospitality Operations')
  })

  it('uses the dashboard fallback for absent metadata', () => {
    expect(createDocumentTitle(undefined)).toBe('Dashboard · Hospitality Operations')
    expect(createDocumentTitle('')).toBe('Dashboard · Hospitality Operations')
  })
})
