import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  RoleLevel,
  StoredUser,
  ResourceModule,
  AccessLevel,
  Scope,
  UserRole,
} from '../types/auth.ts'

function makeId(): string {
  return crypto.randomUUID()
}

function now(): string {
  return new Date().toISOString()
}

const ALL_MODULES: ResourceModule[] = [
  'customer_profile',
  'contract_sla',
  'pricing',
  'order_management',
  'linen_tracking',
  'workflow_sop',
  'warehouse',
  'asset_management',
  'purchasing',
  'dispatch_delivery',
  'ai_analytics',
  'notification',
  'billing_cashflow',
  'access_control',
  'reports',
]

function fullPermissions(level: AccessLevel): Record<ResourceModule, AccessLevel> {
  return Object.fromEntries(ALL_MODULES.map((m) => [m, level])) as Record<ResourceModule, AccessLevel>
}

interface RoleState {
  roleLevels: RoleLevel[]
  users: StoredUser[]

  createRoleLevel: (data: {
    name: string
    description: string
    scope: Scope
    permissions: Record<ResourceModule, AccessLevel>
  }) => void
  updateRoleLevel: (
    id: string,
    data: {
      name: string
      description: string
      permissions: Record<ResourceModule, AccessLevel>
    },
  ) => void
  deleteRoleLevel: (id: string) => void

  createUser: (data: {
    email: string
    password: string
    name: string
    role: UserRole
    roleLevelId: string
  }) => void
  updateUser: (
    id: string,
    data: {
      email: string
      name: string
      role: UserRole
      roleLevelId: string
    },
  ) => void
  softDeleteUser: (id: string) => void
}

const HOTEL_SUPER_ADMIN_ROLE_ID = 'default-hotel-super-admin'
const FACTORY_SUPER_ADMIN_ROLE_ID = 'default-factory-super-admin'
const DRIVER_ROLE_ID = 'default-driver'
const DISPATCHER_ROLE_ID = 'default-dispatcher'

const DEFAULT_ROLE_LEVELS: RoleLevel[] = [
  {
    id: HOTEL_SUPER_ADMIN_ROLE_ID,
    name: 'Hotel Super Admin',
    description: 'Full access to all hotel modules',
    scope: 'hotel',
    permissions: fullPermissions('admin'),
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: FACTORY_SUPER_ADMIN_ROLE_ID,
    name: 'Factory Super Admin',
    description: 'Full access to all factory modules',
    scope: 'factory',
    permissions: fullPermissions('admin'),
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: DRIVER_ROLE_ID,
    name: 'Driver',
    description: 'Limited access for delivery drivers',
    scope: 'driver',
    permissions: {
      ...fullPermissions('none'),
      dispatch_delivery: 'edit',
      linen_tracking: 'view',
      notification: 'view',
      order_management: 'view',
      customer_profile: 'view',
    },
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: DISPATCHER_ROLE_ID,
    name: 'Dispatcher',
    description: 'Manages dispatch, delivery routes, and notifications',
    scope: 'factory',
    permissions: {
      ...fullPermissions('none'),
      dispatch_delivery: 'admin',
      notification: 'edit',
      order_management: 'edit',
      linen_tracking: 'view',
      customer_profile: 'view',
      billing_cashflow: 'view',
    },
    createdAt: now(),
    updatedAt: now(),
  },
]

const DEFAULT_USERS: StoredUser[] = [
  {
    id: 'default-hotel-admin-user',
    email: 'hotel@admin.com',
    password: 'admin123',
    name: 'Hotel Super Admin',
    role: 'hotel_super_admin',
    roleLevelId: HOTEL_SUPER_ADMIN_ROLE_ID,
    isDeleted: false,
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: 'default-factory-admin-user',
    email: 'factory@admin.com',
    password: 'admin123',
    name: 'Factory Super Admin',
    role: 'factory_super_admin',
    roleLevelId: FACTORY_SUPER_ADMIN_ROLE_ID,
    isDeleted: false,
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: 'default-driver-user',
    email: 'driver@laundry.com',
    password: 'driver123',
    name: 'Driver User',
    role: 'driver',
    roleLevelId: DRIVER_ROLE_ID,
    isDeleted: false,
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: 'default-dispatcher-user',
    email: 'dispatcher@laundry.com',
    password: 'dispatcher123',
    name: 'Dispatcher',
    role: 'dispatcher',
    roleLevelId: DISPATCHER_ROLE_ID,
    isDeleted: false,
    createdAt: now(),
    updatedAt: now(),
  },
]

function ensureDefaults(state: RoleState): RoleState {
  const existingRoleIds = new Set(state.roleLevels.map((r) => r.id))
  for (const rl of DEFAULT_ROLE_LEVELS) {
    if (!existingRoleIds.has(rl.id)) {
      state.roleLevels.push(rl)
    }
  }
  const existingUserIds = new Set(state.users.map((u) => u.id))
  for (const u of DEFAULT_USERS) {
    if (!existingUserIds.has(u.id)) {
      state.users.push(u)
    }
  }
  return state
}

export const useRoleStore = create<RoleState>()(
  persist(
    (set) => ({
      roleLevels: [],
      users: [],

      createRoleLevel: (data) =>
        set((state) => {
          const rl: RoleLevel = {
            id: makeId(),
            name: data.name,
            description: data.description,
            scope: data.scope,
            permissions: data.permissions,
            createdAt: now(),
            updatedAt: now(),
          }
          return { roleLevels: [...state.roleLevels, rl] }
        }),

      updateRoleLevel: (id, data) =>
        set((state) => ({
          roleLevels: state.roleLevels.map((r) =>
            r.id === id
              ? { ...r, name: data.name, description: data.description, permissions: data.permissions, updatedAt: now() }
              : r,
          ),
        })),

      deleteRoleLevel: (id) =>
        set((state) => ({
          roleLevels: state.roleLevels.filter((r) => r.id !== id),
        })),

      createUser: (data) =>
        set((state) => {
          const user: StoredUser = {
            id: makeId(),
            email: data.email,
            password: data.password,
            name: data.name,
            role: data.role,
            roleLevelId: data.roleLevelId,
            isDeleted: false,
            createdAt: now(),
            updatedAt: now(),
          }
          return { users: [...state.users, user] }
        }),

      updateUser: (id, data) =>
        set((state) => ({
          users: state.users.map((u) =>
            u.id === id
              ? { ...u, email: data.email, name: data.name, role: data.role, roleLevelId: data.roleLevelId, updatedAt: now() }
              : u,
          ),
        })),

      softDeleteUser: (id) =>
        set((state) => ({
          users: state.users.map((u) =>
            u.id === id ? { ...u, isDeleted: true, updatedAt: now() } : u,
          ),
        })),
    }),
    {
      name: 'laundry-role-store',
      merge: (persisted, current) => ensureDefaults({ ...current, ...(persisted as Partial<RoleState>) }),
    },
  ),
)
