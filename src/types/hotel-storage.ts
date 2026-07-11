import type { LinenCategory } from './customer.ts'

export type HotelZoneType = 'shelf' | 'rack' | 'bin' | 'floor' | 'room'

export type LinenMovementDirection = 'incoming' | 'outgoing'

export type LinenMovementReason =
  | 'delivery'
  | 'pickup'
  | 'purchase'
  | 'return'
  | 'reject'
  | 'transfer'
  | 'decommission'
  | 'adjustment'

export interface HotelZone {
  id: string
  name: string
  capacityUnits: number
  type: HotelZoneType
}

export interface HotelStoredItem {
  id: string
  zoneId: string
  category: LinenCategory
  quantity: number
}

export type DeliveryStatus = 'pending' | 'confirmed' | 'rejected'

export interface LinenMovement {
  id: string
  zoneId: string
  category: LinenCategory
  direction: LinenMovementDirection
  quantity: number
  reason: LinenMovementReason
  reference: string
  notes: string
  userId: string
  timestamp: string
  deliveryStatus?: DeliveryStatus
}
