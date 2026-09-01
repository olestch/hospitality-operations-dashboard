const APPLICATION_TITLE = 'Hospitality Operations'

export function createDocumentTitle(pageTitle: unknown): string {
  const title = typeof pageTitle === 'string' && pageTitle.trim() ? pageTitle : 'Dashboard'
  return `${title} · ${APPLICATION_TITLE}`
}
