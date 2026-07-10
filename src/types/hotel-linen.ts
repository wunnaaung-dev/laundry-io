import type { LinenCategory } from './customer.ts'

export type LinenItemStatus = 'in_stock' | 'in_laundry' | 'rejected' | 'decommissioned'

export type LinenCondition = 'new' | 'good' | 'fair' | 'poor'

export interface ParLevel {
  id: string
  customerId: string
  category: LinenCategory
  parQuantity: number
  roomCount: number
  createdAt: string
  updatedAt: string
}

export interface LinenItem {
  id: string
  rfidCode: string
  category: LinenCategory
  washCount: number
  condition: LinenCondition
  status: LinenItemStatus
  customerId: string
  orderId: string
  lotNumber: string
  purchaseDate: string
  lastScanDate: string
  createdAt: string
  updatedAt: string
}

export interface StandingOrderRule {
  id: string
  customerId: string
  category: LinenCategory
  enabled: boolean
  triggerThreshold: number
  createdAt: string
  updatedAt: string
}

export interface RejectRecord {
  id: string
  linenItemId: string
  rfidCode: string
  category: LinenCategory
  orderId: string
  customerId: string
  reason: string
  condition: string
  replacementOrderId: string
  createdAt: string
  updatedAt: string
}
