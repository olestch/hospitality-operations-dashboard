import type { HousekeepingStatus, Room } from '@/shared/types/property'

export interface HousekeepingReadinessSummary {
  counts: Record<HousekeepingStatus, number>
  totalRooms: number
}

export function calculateHousekeepingReadiness(
  rooms: readonly Room[],
): HousekeepingReadinessSummary {
  const counts: Record<HousekeepingStatus, number> = {
    dirty: 0,
    cleaned: 0,
    inspected: 0,
  }
  let totalRooms = 0

  for (const room of rooms) {
    if (room.status === 'maintenance' || room.status === 'out-of-service') continue
    counts[room.housekeepingStatus] += 1
    totalRooms += 1
  }

  return { counts, totalRooms }
}

export function getHousekeepingPercentage(count: number, totalRooms: number): number {
  return totalRooms > 0 ? count / totalRooms : 0
}
