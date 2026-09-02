export const ALL_BOOKING_FILTERS = 'all' as const

export function toBookingFilterModel(value: string | null): string {
  return value ?? ALL_BOOKING_FILTERS
}

export function fromBookingFilterModel<T extends string>(
  value: unknown,
  allowedValues: readonly T[],
): T | null {
  if (value === ALL_BOOKING_FILTERS) return null
  return allowedValues.find((allowedValue) => allowedValue === value) ?? null
}
