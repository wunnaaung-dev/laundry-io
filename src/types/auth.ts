export type UserRole = 'hotel_super_admin' | 'factory_super_admin' | 'driver' | 'dispatcher'

export type ResourceModule =
  | 'customer_profile'
  | 'contract_sla'
  | 'pricing'
  | 'order_management'
  | 'linen_tracking'
  | 'workflow_sop'
  | 'warehouse'
  | 'asset_management'
  | 'purchasing'
  | 'dispatch_delivery'
  | 'ai_analytics'
  | 'notification'
  | 'billing_cashflow'
  | 'access_control'
  | 'reports'

export type AccessLevel = 'none' | 'view' | 'edit' | 'admin'

export type Scope = 'hotel' | 'factory' | 'driver'

export interface RoleLevel {
  id: string
  name: string
  description: string
  scope: Scope
  permissions: Record<ResourceModule, AccessLevel>
  createdAt: string
  updatedAt: string
}

export interface StoredUser {
  id: string
  email: string
  password: string
  name: string
  role: UserRole
  roleLevelId: string
  isDeleted: boolean
  createdAt: string
  updatedAt: string
}

export interface AuthUser {
  id: string
  email: string
  name: string
  role: UserRole
  roleLevelId: string | null
}
