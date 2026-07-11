export type VehicleType = 'truck' | 'van' | 'motorcycle'

export interface DriverProfile {
  id: string
  userId: string
  name: string
  email: string
  phone: string
  licenseNumber: string
  vehicleType: VehicleType
  vehiclePlate: string
  maxCapacityKg: number
  isActive: boolean
  workStartTime: string
  workEndTime: string
  breakStart: string
  breakEnd: string
  createdAt: string
  updatedAt: string
}

export type RouteStatus = 'draft' | 'active' | 'completed' | 'cancelled'
export type ScheduleType = 'one_time' | 'recurring_daily' | 'recurring_weekly' | 'recurring_monthly'
export type StopStatus = 'pending' | 'in_transit' | 'completed' | 'missed'

export interface DriverLocation {
  driverId: string
  driverName: string
  lat: number
  lng: number
  updatedAt: string
  status: TripStatus
}

export type TripStatus = 'idle' | 'in_transit' | 'arrived' | 'delivered'

export type DeliveryEventType =
  | 'scan'
  | 'load_validation'
  | 'arrival'
  | 'departure'
  | 'signature'
  | 'photo'
  | 'note'

export interface DeliveryEvent {
  id: string
  stopId: string
  routeId: string
  eventType: DeliveryEventType
  timestamp: string
  description: string
  cartCount?: number
  weightKg?: number
  photoUrl?: string
  scannedCode?: string
  userId: string
  userName: string
}

export type ChangeRequestStatus = 'pending' | 'approved' | 'rejected'

export interface ChangeRequest {
  id: string
  orderId: string
  customerId: string
  customerName: string
  type: 'quantity' | 'schedule' | 'address' | 'other'
  requestedChanges: string
  reason: string
  status: ChangeRequestStatus
  createdAt: string
  updatedAt: string
  resolvedBy?: string
  resolvedAt?: string
  notes?: string
}

export interface DeliveryRoute {
  id: string
  name: string
  description: string
  driverId: string
  driverName: string
  vehicleInfo: string
  scheduledDate: string
  scheduleType: ScheduleType
  recurringDays: number[]
  status: RouteStatus
  createdAt: string
  updatedAt: string
}

export interface RouteStop {
  id: string
  routeId: string
  orderId: string
  lotId: string
  lotNumber: string
  customerId: string
  customerName: string
  address: string
  timeWindowStart: string
  timeWindowEnd: string
  priority: number
  sortOrder: number
  status: StopStatus
  stopType: 'delivery' | 'pickup'
  pairedStopId?: string
  notes: string
  createdAt: string
  updatedAt: string
}
