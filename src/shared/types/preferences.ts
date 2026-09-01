export const DATA_DENSITIES = ['comfortable', 'compact'] as const
export type DataDensity = (typeof DATA_DENSITIES)[number]

export const MOTION_PREFERENCES = ['system', 'reduced'] as const
export type MotionPreference = (typeof MOTION_PREFERENCES)[number]

export interface WorkspacePreferences {
  preferredPropertyId: string | null
  density: DataDensity
  motion: MotionPreference
}

export const DEFAULT_WORKSPACE_PREFERENCES: WorkspacePreferences = {
  preferredPropertyId: null,
  density: 'comfortable',
  motion: 'system',
}
