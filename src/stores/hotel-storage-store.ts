import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  HotelZone,
  HotelStoredItem,
  HotelZoneType,
  LinenMovement,
  LinenMovementDirection,
  LinenMovementReason,
} from '../types/hotel-storage.ts'
import type { LinenCategory } from '../types/customer.ts'

function makeId(): string {
  return crypto.randomUUID()
}

function now(): string {
  return new Date().toISOString()
}

interface HotelStorageState {
  hotelZones: HotelZone[]
  storedItems: HotelStoredItem[]
  movements: LinenMovement[]
  initialized: boolean

  addZone: (data: { name: string; capacityUnits: number; type: HotelZoneType }) => string
  updateZone: (id: string, data: Partial<HotelZone>) => void
  deleteZone: (id: string) => void

  assignItem: (data: { zoneId: string; category: LinenCategory; quantity: number }) => void
  removeItem: (id: string) => void
  getItemsByZone: (zoneId: string) => HotelStoredItem[]
  getTotalItemsInZone: (zoneId: string) => number

  recordMovement: (data: {
    zoneId: string
    category: LinenCategory
    direction: LinenMovementDirection
    quantity: number
    reason: LinenMovementReason
    reference: string
    notes: string
    userId: string
  }) => void
  getMovementsByZone: (zoneId: string) => LinenMovement[]
  getMovementsByCategory: (category: LinenCategory) => LinenMovement[]

  reportForDelivery: (movementId: string) => void
  confirmDelivery: (movementId: string) => void
  rejectDelivery: (movementId: string) => void
  getPendingDeliveryMovements: () => LinenMovement[]
}

const SEED_ZONES: HotelZone[] = [
  { id: 'hzone-a1', name: 'Linen Shelf A1', capacityUnits: 200, type: 'shelf' },
  { id: 'hzone-a2', name: 'Linen Shelf A2', capacityUnits: 200, type: 'shelf' },
  { id: 'hzone-b1', name: 'Towel Rack B1', capacityUnits: 150, type: 'rack' },
  { id: 'hzone-b2', name: 'Towel Rack B2', capacityUnits: 150, type: 'rack' },
  { id: 'hzone-c1', name: 'Uniform Bin C1', capacityUnits: 100, type: 'bin' },
  { id: 'hzone-c2', name: 'Uniform Bin C2', capacityUnits: 100, type: 'bin' },
]

const SEED_STORED_ITEMS: HotelStoredItem[] = [
  { id: 'hstore-1', zoneId: 'hzone-a1', category: 'linen', quantity: 45 },
  { id: 'hstore-2', zoneId: 'hzone-a1', category: 'towel', quantity: 12 },
  { id: 'hstore-3', zoneId: 'hzone-a2', category: 'linen', quantity: 60 },
  { id: 'hstore-4', zoneId: 'hzone-b1', category: 'towel', quantity: 80 },
  { id: 'hstore-5', zoneId: 'hzone-b2', category: 'towel', quantity: 55 },
  { id: 'hstore-6', zoneId: 'hzone-c1', category: 'uniform', quantity: 30 },
  { id: 'hstore-7', zoneId: 'hzone-c2', category: 'uniform', quantity: 25 },
]

const SEED_MOVEMENTS: LinenMovement[] = [
  {
    id: 'hmov-seed-1',
    zoneId: 'hzone-a1',
    category: 'linen',
    direction: 'incoming',
    quantity: 45,
    reason: 'delivery',
    reference: 'DEL-2026-001',
    notes: 'Initial stock delivery from factory',
    userId: 'seed',
    timestamp: '2026-06-01T08:00:00.000Z',
  },
  {
    id: 'hmov-seed-2',
    zoneId: 'hzone-a1',
    category: 'towel',
    direction: 'incoming',
    quantity: 12,
    reason: 'delivery',
    reference: 'DEL-2026-001',
    notes: 'Initial stock delivery from factory',
    userId: 'seed',
    timestamp: '2026-06-01T08:05:00.000Z',
  },
  {
    id: 'hmov-seed-3',
    zoneId: 'hzone-a2',
    category: 'linen',
    direction: 'incoming',
    quantity: 60,
    reason: 'delivery',
    reference: 'DEL-2026-002',
    notes: 'Restock delivery',
    userId: 'seed',
    timestamp: '2026-06-01T09:00:00.000Z',
  },
  {
    id: 'hmov-seed-4',
    zoneId: 'hzone-b1',
    category: 'towel',
    direction: 'incoming',
    quantity: 100,
    reason: 'delivery',
    reference: 'DEL-2026-003',
    notes: 'Bulk towel delivery',
    userId: 'seed',
    timestamp: '2026-06-02T10:00:00.000Z',
  },
  {
    id: 'hmov-seed-5',
    zoneId: 'hzone-b1',
    category: 'towel',
    direction: 'outgoing',
    quantity: 20,
    reason: 'pickup',
    reference: 'PU-2026-001',
    notes: 'Soiled towels sent to laundry',
    userId: 'seed',
    timestamp: '2026-06-03T14:00:00.000Z',
  },
  {
    id: 'hmov-seed-6',
    zoneId: 'hzone-c1',
    category: 'uniform',
    direction: 'incoming',
    quantity: 30,
    reason: 'purchase',
    reference: 'PO-2026-001',
    notes: 'New uniform stock',
    userId: 'seed',
    timestamp: '2026-06-04T11:00:00.000Z',
  },
  {
    id: 'hmov-seed-7',
    zoneId: 'hzone-c2',
    category: 'uniform',
    direction: 'incoming',
    quantity: 25,
    reason: 'purchase',
    reference: 'PO-2026-001',
    notes: 'New uniform stock',
    userId: 'seed',
    timestamp: '2026-06-04T11:05:00.000Z',
  },
]

export const useHotelStorageStore = create<HotelStorageState>()(
  persist(
    (set, get) => ({
      hotelZones: [],
      storedItems: [],
      movements: [],
      initialized: false,

      addZone: (data) => {
        const id = makeId()
        set((state) => ({
          hotelZones: [...state.hotelZones, { id, ...data }],
        }))
        return id
      },

      updateZone: (id, data) =>
        set((state) => ({
          hotelZones: state.hotelZones.map((z) =>
            z.id === id ? { ...z, ...data } : z,
          ),
        })),

      deleteZone: (id) =>
        set((state) => ({
          hotelZones: state.hotelZones.filter((z) => z.id !== id),
          storedItems: state.storedItems.filter((s) => s.zoneId !== id),
          movements: state.movements.filter((m) => m.zoneId !== id),
        })),

      assignItem: (data) => {
        const existing = get().storedItems.find(
          (s) => s.zoneId === data.zoneId && s.category === data.category,
        )
        if (existing) {
          set((state) => ({
            storedItems: state.storedItems.map((s) =>
              s.id === existing.id
                ? { ...s, quantity: Math.max(0, s.quantity + data.quantity) }
                : s,
            ),
          }))
        } else {
          set((state) => ({
            storedItems: [
              ...state.storedItems,
              {
                id: makeId(),
                zoneId: data.zoneId,
                category: data.category,
                quantity: Math.max(0, data.quantity),
              },
            ],
          }))
        }
      },

      removeItem: (id) =>
        set((state) => ({
          storedItems: state.storedItems.filter((s) => s.id !== id),
        })),

      getItemsByZone: (zoneId) =>
        get().storedItems.filter((s) => s.zoneId === zoneId),

      getTotalItemsInZone: (zoneId) =>
        get()
          .storedItems.filter((s) => s.zoneId === zoneId)
          .reduce((sum, s) => sum + s.quantity, 0),

      recordMovement: (data) => {
        const movement: LinenMovement = {
          id: makeId(),
          zoneId: data.zoneId,
          category: data.category,
          direction: data.direction,
          quantity: data.quantity,
          reason: data.reason,
          reference: data.reference,
          notes: data.notes,
          userId: data.userId,
          timestamp: now(),
        }

        set((state) => {
          const quantityChange =
            data.direction === 'incoming' ? data.quantity : -data.quantity

          const existing = state.storedItems.find(
            (s) => s.zoneId === data.zoneId && s.category === data.category,
          )

          let updatedStoredItems: HotelStoredItem[]
          if (existing) {
            updatedStoredItems = state.storedItems.map((s) =>
              s.id === existing.id
                ? { ...s, quantity: Math.max(0, s.quantity + quantityChange) }
                : s,
            )
          } else if (quantityChange > 0) {
            updatedStoredItems = [
              ...state.storedItems,
              {
                id: makeId(),
                zoneId: data.zoneId,
                category: data.category,
                quantity: quantityChange,
              },
            ]
          } else {
            updatedStoredItems = state.storedItems
          }

          return {
            movements: [...state.movements, movement],
            storedItems: updatedStoredItems,
          }
        })
      },

      getMovementsByZone: (zoneId) =>
        get().movements.filter((m) => m.zoneId === zoneId),

      getMovementsByCategory: (category) =>
        get().movements.filter((m) => m.category === category),

      reportForDelivery: (movementId) =>
        set((state) => ({
          movements: state.movements.map((m) =>
            m.id === movementId ? { ...m, deliveryStatus: 'pending' } : m,
          ),
        })),

      confirmDelivery: (movementId) =>
        set((state) => ({
          movements: state.movements.map((m) =>
            m.id === movementId ? { ...m, deliveryStatus: 'confirmed' } : m,
          ),
        })),

      rejectDelivery: (movementId) =>
        set((state) => ({
          movements: state.movements.map((m) =>
            m.id === movementId ? { ...m, deliveryStatus: 'rejected' } : m,
          ),
        })),

      getPendingDeliveryMovements: () =>
        get().movements.filter((m) => m.deliveryStatus === 'pending'),
    }),
    {
      name: 'laundry-hotel-storage-store',
      version: 2,
      migrate: (persisted: unknown) => {
        const data = persisted as Partial<HotelStorageState>
        return {
          hotelZones: data.hotelZones ?? [],
          storedItems: data.storedItems ?? [],
          movements: data.movements ?? [],
          initialized: data.initialized ?? false,
        }
      },
      merge: (persisted, current) => ({
        ...current,
        ...(persisted as Partial<HotelStorageState>),
      }),
      onRehydrateStorage: () => (state) => {
        if (state && !state.initialized) {
          state.hotelZones = SEED_ZONES
          state.storedItems = SEED_STORED_ITEMS
          state.movements = SEED_MOVEMENTS
          state.initialized = true
        }
      },
    },
  ),
)
