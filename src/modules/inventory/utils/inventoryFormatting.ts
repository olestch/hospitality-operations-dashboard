import type { InventoryItem } from '@/modules/inventory/types/inventory'
import { formatInventoryLabel } from '@/modules/inventory/utils/inventoryLabels'
import { DEMO_CURRENCY } from '@/mocks/demoPeriod'
import { calculateShortage, deriveStockStatus } from '@/modules/inventory/utils/stockLevels'

const currencyFormatter = new Intl.NumberFormat('en', {
  style: 'currency',
  currency: DEMO_CURRENCY,
  maximumFractionDigits: 2,
})
const quantityFormatter = new Intl.NumberFormat('en', { maximumFractionDigits: 2 })
const dateFormatter = new Intl.DateTimeFormat('en', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
})

export function formatInventoryCurrency(value: number): string {
  return currencyFormatter.format(value)
}

export function formatInventoryQuantity(
  item: InventoryItem,
  quantity = item.quantityOnHand,
): string {
  const pluralUnits = {
    each: 'each',
    box: 'boxes',
    case: 'cases',
    bottle: 'bottles',
    kilogram: 'kg',
    liter: 'liters',
    roll: 'rolls',
    pack: 'packs',
  } as const
  const unit = quantity === 1 ? formatInventoryLabel(item.unit) : pluralUnits[item.unit]
  return `${quantityFormatter.format(quantity)} ${unit}`
}

export function formatDaysOfStock(value: number | null): string {
  return value === null ? 'Unavailable' : `~${quantityFormatter.format(value)} days`
}

export function formatInventoryDate(value: string): string {
  return dateFormatter.format(new Date(`${value}T00:00:00Z`))
}

export function formatStockPosition(item: InventoryItem): string {
  const status = deriveStockStatus(item)
  const shortage = formatInventoryQuantity(item, calculateShortage(item))
  if (status === 'out-of-stock') return 'Out of stock; replenishment is required.'
  if (status === 'reorder') return `At or below reorder level; ${shortage} below par.`
  if (status === 'below-par') return `${shortage} below par.`
  return 'At or above the target par level.'
}
