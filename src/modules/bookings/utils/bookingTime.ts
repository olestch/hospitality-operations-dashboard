import type { LocalTime } from '@/modules/bookings/types/booking'

const MINUTES_PER_DAY = 1_440
const LOCAL_TIME_PATTERN = /^(?:[01]\d|2[0-3]):[0-5]\d$/

export function isValidLocalTime(value: string): value is LocalTime {
  return LOCAL_TIME_PATTERN.test(value)
}

export function localTimeToMinutes(value: string): number {
  if (!isValidLocalTime(value)) throw new RangeError(`Invalid local time: ${value}`)
  const hours = Number(value.slice(0, 2))
  const minutes = Number(value.slice(3, 5))
  return hours * 60 + minutes
}

export function localTimeToFraction(value: string): number {
  return localTimeToMinutes(value) / MINUTES_PER_DAY
}

export function bookingDateTimeKey(date: string, time: string): string {
  if (!isValidLocalTime(time)) throw new RangeError(`Invalid local time: ${time}`)
  return `${date}T${time}`
}

export function formatLocalTime(value: string): string {
  const totalMinutes = localTimeToMinutes(value)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  const displayHours = hours % 12 || 12
  return `${displayHours}:${String(minutes).padStart(2, '0')} ${hours < 12 ? 'AM' : 'PM'}`
}
