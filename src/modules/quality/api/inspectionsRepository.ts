import { dataProvider } from '@/data'
import type {
  Inspection,
  InspectionDetail,
  InspectionFilters,
} from '@/modules/quality/types/inspection'
import { DataNotFoundError } from '@/shared/api/errors'

export async function getInspections(filters: InspectionFilters = {}): Promise<Inspection[]> {
  return dataProvider.getInspections(filters)
}

export async function getInspection(id: string): Promise<InspectionDetail> {
  const inspection = await dataProvider.getInspection(id)
  if (!inspection) throw new DataNotFoundError('Inspection', id)
  return inspection
}
