import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { DriverProfile, VehicleType } from '../types/delivery.ts'
import { useRoleStore } from './role-store.ts'

function makeId(): string {
  return crypto.randomUUID()
}

function now(): string {
  return new Date().toISOString()
}

interface DriverManagementState {
  driverProfiles: DriverProfile[]
  initialized: boolean

  createDriver: (data: {
    name: string
    email: string
    phone: string
    licenseNumber: string
    vehicleType: VehicleType
    vehiclePlate: string
    maxCapacityKg: number
    workStartTime: string
    workEndTime: string
    breakStart: string
    breakEnd: string
  }) => void

  updateDriver: (
    id: string,
    data: Partial<{
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
    }>,
  ) => void

  deleteDriver: (id: string) => void

  getActiveDrivers: () => DriverProfile[]
}

const WORK_DEFAULTS = {
  workStartTime: '08:00',
  workEndTime: '17:00',
  breakStart: '12:00',
  breakEnd: '13:00',
}

const SEED_DRIVERS: DriverProfile[] = [
  {
    id: 'driver-seed-1',
    userId: 'default-driver-user',
    name: 'Driver User',
    email: 'driver@laundry.com',
    phone: '081-234-5678',
    licenseNumber: 'LIC-2024-001',
    vehicleType: 'van',
    vehiclePlate: 'กข 1234',
    maxCapacityKg: 1500,
    isActive: true,
    ...WORK_DEFAULTS,
    createdAt: '2026-06-01T00:00:00.000Z',
    updatedAt: '2026-06-01T00:00:00.000Z',
  },
  {
    id: 'driver-seed-2',
    userId: 'driver-seed-u2',
    name: 'Somsak Rakdee',
    email: 'somsak@laundry.com',
    phone: '081-987-6543',
    licenseNumber: 'LIC-2024-002',
    vehicleType: 'truck',
    vehiclePlate: 'คด 5678',
    maxCapacityKg: 3000,
    isActive: true,
    ...WORK_DEFAULTS,
    createdAt: '2026-06-01T00:00:00.000Z',
    updatedAt: '2026-06-01T00:00:00.000Z',
  },
  {
    id: 'driver-seed-3',
    userId: 'driver-seed-u3',
    name: 'Anchalee Meesuk',
    email: 'anchalee@laundry.com',
    phone: '082-456-7890',
    licenseNumber: 'LIC-2025-003',
    vehicleType: 'motorcycle',
    vehiclePlate: 'งจ 9012',
    maxCapacityKg: 200,
    isActive: true,
    ...WORK_DEFAULTS,
    createdAt: '2026-06-15T00:00:00.000Z',
    updatedAt: '2026-06-15T00:00:00.000Z',
  },
]

export const useDriverManagementStore = create<DriverManagementState>()(
  persist(
    (set, get) => ({
      driverProfiles: [],
      initialized: false,

      createDriver: (data) => {
        const roleState = useRoleStore.getState()
        roleState.createUser({
          email: data.email,
          password: 'driver123',
          name: data.name,
          role: 'driver',
          roleLevelId: 'default-driver',
        })
        const updatedUsers = useRoleStore.getState().users
        const createdUser = updatedUsers.find((u) => u.email === data.email && !u.isDeleted)
        if (!createdUser) return
        const driverId = makeId()
        set((state) => ({
          driverProfiles: [
            ...state.driverProfiles,
            {
              id: driverId,
              userId: createdUser.id,
              name: data.name,
              email: data.email,
              phone: data.phone,
              licenseNumber: data.licenseNumber,
              vehicleType: data.vehicleType,
              vehiclePlate: data.vehiclePlate,
              maxCapacityKg: data.maxCapacityKg,
              isActive: true,
              workStartTime: data.workStartTime,
              workEndTime: data.workEndTime,
              breakStart: data.breakStart,
              breakEnd: data.breakEnd,
              createdAt: now(),
              updatedAt: now(),
            },
          ],
        }))
      },

      updateDriver: (id, data) => {
        const profile = get().driverProfiles.find((d) => d.id === id)
        if (profile) {
          const { updateUser } = useRoleStore.getState()
          updateUser(profile.userId, {
            email: data.email ?? profile.email,
            name: data.name ?? profile.name,
            role: 'driver',
            roleLevelId: 'default-driver',
          })
        }
        set((state) => ({
          driverProfiles: state.driverProfiles.map((d) =>
            d.id === id
              ? {
                  ...d,
                  ...data,
                  updatedAt: now(),
                }
              : d,
          ),
        }))
      },

      deleteDriver: (id) => {
        const profile = get().driverProfiles.find((d) => d.id === id)
        if (profile) {
          const { softDeleteUser } = useRoleStore.getState()
          softDeleteUser(profile.userId)
        }
        set((state) => ({
          driverProfiles: state.driverProfiles.filter((d) => d.id !== id),
        }))
      },

      getActiveDrivers: () => {
        return get().driverProfiles.filter((d) => d.isActive)
      },
    }),
    {
      name: 'laundry-driver-management-store',
      version: 1,
      migrate: (persisted: unknown) => {
        const data = persisted as Partial<DriverManagementState>
        return {
          driverProfiles: data.driverProfiles ?? [],
          initialized: data.initialized ?? false,
        }
      },
      merge: (persisted, current) => ({
        ...current,
        ...(persisted as Partial<DriverManagementState>),
      }),
      onRehydrateStorage: () => (state) => {
        if (state && !state.initialized) {
          const existingIds = new Set(state.driverProfiles.map((d) => d.id))
          const missing = SEED_DRIVERS.filter((sd) => !existingIds.has(sd.id))
          if (missing.length > 0) {
            state.driverProfiles = [...state.driverProfiles, ...missing]
          }
          state.initialized = true
        }
      },
    },
  ),
)
