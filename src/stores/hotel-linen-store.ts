import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  ParLevel,
  LinenItem,
  LinenItemStatus,
  LinenCondition,
  StandingOrderRule,
  RejectRecord,
} from '../types/hotel-linen.ts'
import type { LinenCategory } from '../types/customer.ts'

function makeId(): string {
  return crypto.randomUUID()
}

function now(): string {
  return new Date().toISOString()
}

let rfidCounter = 0

function nextRfid(): string {
  rfidCounter++
  return `RFID-${String(rfidCounter).padStart(6, '0')}`
}

interface HotelLinenState {
  parLevels: ParLevel[]
  linenItems: LinenItem[]
  standingOrderRules: StandingOrderRule[]
  rejects: RejectRecord[]
  initialized: boolean

  setParLevel: (
    customerId: string,
    category: LinenCategory,
    parQuantity: number,
    roomCount: number,
  ) => void

  addLinenItem: (data: {
    category: LinenCategory
    customerId: string
    orderId: string
    lotNumber: string
  }) => void

  generateLinenItemsFromDelivery: (
    customerId: string,
    orderId: string,
    items: { category: LinenCategory; quantity: number; lotNumber: string }[],
  ) => void

  scanLinenItem: (
    rfidCode: string,
    updates: { condition?: LinenCondition; status?: LinenItemStatus },
  ) => LinenItem | null

  findLinenByRfid: (rfidCode: string) => LinenItem | undefined

  getStockByCategory: (
    customerId: string,
  ) => Record<LinenCategory, { inStock: number; inLaundry: number; parLevel: number }>

  toggleStandingOrderRule: (
    customerId: string,
    category: LinenCategory,
    enabled: boolean,
  ) => void

  addReject: (data: {
    linenItemId: string
    rfidCode: string
    category: LinenCategory
    orderId: string
    customerId: string
    reason: string
    condition: string
    replacementOrderId: string
  }) => void
}

const SEED_PAR_LEVELS: ParLevel[] = [
  {
    id: 'pl-seed-1',
    customerId: 'sample-hotel-customer',
    category: 'linen',
    parQuantity: 300,
    roomCount: 100,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'pl-seed-2',
    customerId: 'sample-hotel-customer',
    category: 'towel',
    parQuantity: 600,
    roomCount: 100,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'pl-seed-3',
    customerId: 'sample-hotel-customer',
    category: 'uniform',
    parQuantity: 150,
    roomCount: 50,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
]

const SEED_LINEN_ITEMS: LinenItem[] = Array.from({ length: 20 }, (_, i) => ({
  id: `li-seed-${i + 1}`,
  rfidCode: `RFID-${String(i + 1).padStart(6, '0')}`,
  category: (['linen', 'towel', 'uniform'] as LinenCategory[])[i % 3],
  washCount: Math.floor(Math.random() * 20),
  condition: (['new', 'good', 'fair', 'poor'] as LinenCondition[])[
    Math.floor(Math.random() * 4)
  ],
  status: i < 15 ? 'in_stock' : 'in_laundry',
  customerId: 'sample-hotel-customer',
  orderId: 'sample-order',
  lotNumber: `LOT-${String(Math.floor(i / 3) + 1).padStart(2, '0')}`,
  purchaseDate: '2026-01-15',
  lastScanDate: '2026-06-01',
  createdAt: '2026-01-15T00:00:00.000Z',
  updatedAt: '2026-06-01T00:00:00.000Z',
}))

const SEED_RULES: StandingOrderRule[] = [
  {
    id: 'rule-seed-1',
    customerId: 'sample-hotel-customer',
    category: 'linen',
    enabled: true,
    triggerThreshold: 0.8,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'rule-seed-2',
    customerId: 'sample-hotel-customer',
    category: 'towel',
    enabled: true,
    triggerThreshold: 0.8,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'rule-seed-3',
    customerId: 'sample-hotel-customer',
    category: 'uniform',
    enabled: false,
    triggerThreshold: 0.7,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
]

const SEED_REJECTS: RejectRecord[] = [
  {
    id: 'rej-seed-1',
    linenItemId: 'li-seed-18',
    rfidCode: 'RFID-000018',
    category: 'towel',
    orderId: 'sample-order',
    customerId: 'sample-hotel-customer',
    reason: 'Torn fabric on edge',
    condition: '3cm tear on left seam',
    replacementOrderId: '',
    createdAt: '2026-05-20T00:00:00.000Z',
    updatedAt: '2026-05-20T00:00:00.000Z',
  },
  {
    id: 'rej-seed-2',
    linenItemId: 'li-seed-19',
    rfidCode: 'RFID-000019',
    category: 'linen',
    orderId: 'sample-order',
    customerId: 'sample-hotel-customer',
    reason: 'Persistent stain after washing',
    condition: 'Yellow discoloration',
    replacementOrderId: '',
    createdAt: '2026-05-25T00:00:00.000Z',
    updatedAt: '2026-05-25T00:00:00.000Z',
  },
]

export const useHotelLinenStore = create<HotelLinenState>()(
  persist(
    (set, get) => ({
      parLevels: [],
      linenItems: [],
      standingOrderRules: [],
      rejects: [],
      initialized: false,

      setParLevel: (customerId, category, parQuantity, roomCount) =>
        set((state) => {
          const existing = state.parLevels.find(
            (p) => p.customerId === customerId && p.category === category,
          )
          if (existing) {
            return {
              parLevels: state.parLevels.map((p) =>
                p.id === existing.id
                  ? { ...p, parQuantity, roomCount, updatedAt: now() }
                  : p,
              ),
            }
          }
          return {
            parLevels: [
              ...state.parLevels,
              {
                id: makeId(),
                customerId,
                category,
                parQuantity,
                roomCount,
                createdAt: now(),
                updatedAt: now(),
              },
            ],
          }
        }),

      addLinenItem: (data) =>
        set((state) => ({
          linenItems: [
            ...state.linenItems,
            {
              id: makeId(),
              rfidCode: nextRfid(),
              category: data.category,
              washCount: 0,
              condition: 'new',
              status: 'in_stock',
              customerId: data.customerId,
              orderId: data.orderId,
              lotNumber: data.lotNumber,
              purchaseDate: now().slice(0, 10),
              lastScanDate: now().slice(0, 10),
              createdAt: now(),
              updatedAt: now(),
            },
          ],
        })),

      generateLinenItemsFromDelivery: (customerId, orderId, items) =>
        set((state) => {
          const newItems: LinenItem[] = []
          for (const item of items) {
            for (let i = 0; i < item.quantity; i++) {
              newItems.push({
                id: makeId(),
                rfidCode: nextRfid(),
                category: item.category,
                washCount: 0,
                condition: 'new',
                status: 'in_stock',
                customerId,
                orderId,
                lotNumber: item.lotNumber,
                purchaseDate: now().slice(0, 10),
                lastScanDate: now().slice(0, 10),
                createdAt: now(),
                updatedAt: now(),
              })
            }
          }
          return { linenItems: [...state.linenItems, ...newItems] }
        }),

      scanLinenItem: (rfidCode, updates) => {
        const item = get().linenItems.find((i) => i.rfidCode === rfidCode)
        if (!item) return null

        const updated = {
          ...item,
          washCount: updates.condition ? item.washCount + 1 : item.washCount,
          condition: updates.condition ?? item.condition,
          status: updates.status ?? item.status,
          lastScanDate: now().slice(0, 10),
          updatedAt: now(),
        }

        set((state) => ({
          linenItems: state.linenItems.map((i) =>
            i.rfidCode === rfidCode ? updated : i,
          ),
        }))

        return updated
      },

      findLinenByRfid: (rfidCode) => {
        return get().linenItems.find((i) => i.rfidCode === rfidCode)
      },

      getStockByCategory: (customerId) => {
        const items = get().linenItems.filter(
          (i) => i.customerId === customerId,
        )
        const parLevels = get().parLevels.filter(
          (p) => p.customerId === customerId,
        )
        const categories: LinenCategory[] = ['linen', 'towel', 'uniform']
        const result = {} as Record<
          LinenCategory,
          { inStock: number; inLaundry: number; parLevel: number }
        >
        for (const cat of categories) {
          const catItems = items.filter((i) => i.category === cat)
          const par = parLevels.find((p) => p.category === cat)
          result[cat] = {
            inStock: catItems.filter((i) => i.status === 'in_stock').length,
            inLaundry: catItems.filter((i) => i.status === 'in_laundry').length,
            parLevel: par?.parQuantity ?? 0,
          }
        }
        return result
      },

      toggleStandingOrderRule: (customerId, category, enabled) =>
        set((state) => {
          const existing = state.standingOrderRules.find(
            (r) => r.customerId === customerId && r.category === category,
          )
          if (existing) {
            return {
              standingOrderRules: state.standingOrderRules.map((r) =>
                r.id === existing.id ? { ...r, enabled, updatedAt: now() } : r,
              ),
            }
          }
          return {
            standingOrderRules: [
              ...state.standingOrderRules,
              {
                id: makeId(),
                customerId,
                category,
                enabled,
                triggerThreshold: 0.8,
                createdAt: now(),
                updatedAt: now(),
              },
            ],
          }
        }),

      addReject: (data) =>
        set((state) => ({
          rejects: [
            ...state.rejects,
            {
              id: makeId(),
              linenItemId: data.linenItemId,
              rfidCode: data.rfidCode,
              category: data.category,
              orderId: data.orderId,
              customerId: data.customerId,
              reason: data.reason,
              condition: data.condition,
              replacementOrderId: data.replacementOrderId,
              createdAt: now(),
              updatedAt: now(),
            },
          ],
        })),
    }),
    {
      name: 'laundry-hotel-linen-store',
      version: 1,
      migrate: () => ({
        parLevels: [],
        linenItems: [],
        standingOrderRules: [],
        rejects: [],
        initialized: false,
      }),
      merge: (persisted, current) => ({
        ...current,
        ...(persisted as Partial<HotelLinenState>),
      }),
      onRehydrateStorage: () => (state) => {
        if (state && !state.initialized) {
          state.parLevels = SEED_PAR_LEVELS
          state.linenItems = SEED_LINEN_ITEMS
          state.standingOrderRules = SEED_RULES
          state.rejects = SEED_REJECTS
          state.initialized = true
        }
      },
    },
  ),
)
