import type { WarehouseItemCategory } from '@/types/warehouse.ts'

export const CATEGORY_LABELS: Record<WarehouseItemCategory, string> = {
  chemical: 'Chemical',
  detergent: 'Detergent',
  softener: 'Softener',
  bleach: 'Bleach',
  solvent: 'Solvent',
  packaging: 'Packaging',
  spare_part: 'Spare Part',
  cleaning_tool: 'Cleaning Tool',
  maintenance_equipment: 'Maintenance Equipment',
  other: 'Other',
}

export const ZONE_TYPE_LABELS: Record<string, string> = {
  shelf: 'Shelf',
  rack: 'Rack',
  floor: 'Floor',
  bin: 'Bin',
  cold_storage: 'Cold Storage',
  staging: 'Staging',
}

export const HAZARDOUS_CATEGORIES: ReadonlySet<WarehouseItemCategory> = new Set([
  'chemical',
  'bleach',
  'detergent',
  'softener',
])

export const CATEGORY_VARIANTS: Record<WarehouseItemCategory, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  chemical: 'destructive',
  detergent: 'default',
  softener: 'secondary',
  bleach: 'destructive',
  solvent: 'destructive',
  packaging: 'secondary',
  spare_part: 'outline',
  cleaning_tool: 'outline',
  maintenance_equipment: 'secondary',
  other: 'outline',
}

export const CONDITION_LABELS: Record<string, string> = {
  new: 'New',
  good: 'Good',
  fair: 'Fair',
  poor: 'Poor',
}

export const CONDITION_VARIANTS: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  new: 'default',
  good: 'secondary',
  fair: 'outline',
  poor: 'destructive',
}

export const RETURN_ACTION_LABELS: Record<string, string> = {
  re_wash: 'Re-Wash',
  discard: 'Discard',
  charge: 'Charge Customer',
}

export const RETURN_ACTION_VARIANTS: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  re_wash: 'secondary',
  discard: 'destructive',
  charge: 'default',
}

export const RETURN_STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  resolved: 'Resolved',
}

export const RECEIVING_STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  completed: 'Completed',
}

export type ExpiryStatus = 'expired' | 'expiring_soon' | 'valid'

export function getExpiryStatus(date: string): ExpiryStatus {
  if (!date) return 'valid'
  const expiry = new Date(date)
  const today = new Date()
  if (expiry < today) return 'expired'
  const in30Days = new Date()
  in30Days.setDate(in30Days.getDate() + 30)
  if (expiry < in30Days) return 'expiring_soon'
  return 'valid'
}

export const EXPIRY_LABELS: Record<ExpiryStatus, string> = {
  expired: 'Expired',
  expiring_soon: 'Expiring Soon',
  valid: 'Valid',
}

export const EXPIRY_VARIANTS: Record<ExpiryStatus, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  expired: 'destructive',
  expiring_soon: 'outline',
  valid: 'secondary',
}

export const TRANSACTION_LABELS: Record<string, string> = {
  in: 'In',
  out: 'Out',
  adjustment: 'Adjustment',
}

export const TRANSACTION_VARIANTS: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  in: 'default',
  out: 'destructive',
  adjustment: 'outline',
}
