export type WarehouseItemCategory =
  | 'chemical'
  | 'detergent'
  | 'softener'
  | 'bleach'
  | 'solvent'
  | 'packaging'
  | 'spare_part'
  | 'cleaning_tool'
  | 'maintenance_equipment'
  | 'other'

export type StockTransactionType = 'in' | 'out' | 'adjustment'

export type ReturnAction = 're_wash' | 'discard' | 'charge'

export type ReturnStatus = 'pending' | 'resolved'

export type ReceivingStatus = 'pending' | 'completed'

export interface WarehouseItem {
  id: string
  name: string
  sku: string
  category: WarehouseItemCategory
  currentStock: number
  unit: string
  minStockLevel: number
  location: string
  supplierInfo: string
  sdsUrl: string
  expiryDate: string
  notes: string
  createdAt: string
  updatedAt: string
}

export interface StockTransaction {
  id: string
  itemId: string
  type: StockTransactionType
  quantity: number
  reference: string
  notes: string
  userId: string
  timestamp: string
}

export interface ReturnRecord {
  id: string
  orderId: string
  customerId: string
  customerName: string
  itemDescription: string
  reason: string
  condition: string
  action: ReturnAction
  status: ReturnStatus
  createdAt: string
  updatedAt: string
}

export interface ReceivingRecord {
  id: string
  supplier: string
  poReference: string
  items: { itemId: string; itemName: string; quantity: number }[]
  receivedBy: string
  status: ReceivingStatus
  notes: string
  createdAt: string
  updatedAt: string
}

export interface EquipmentRecord {
  id: string
  name: string
  category: WarehouseItemCategory
  location: string
  condition: 'new' | 'good' | 'fair' | 'poor'
  lastMaintenanceDate: string
  notes: string
  createdAt: string
  updatedAt: string
}
