import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  Warehouse,
  WarehouseItem,
  WarehouseItemCategory,
  WarehouseZone,
  WarehouseZoneType,
  StockTransaction,
  ReturnRecord,
  ReceivingRecord,
  EquipmentRecord,
  StockTransactionType,
  ReturnAction,
  ReturnStatus,
  WarehouseFunction,
  WarehouseZoneCategory,
  WarehouseStatus,
} from '../types/warehouse.ts'

function makeId(): string {
  return crypto.randomUUID()
}

function now(): string {
  return new Date().toISOString()
}

interface WarehouseState {
  warehouses: Warehouse[]
  items: WarehouseItem[]
  warehouseZones: WarehouseZone[]
  transactions: StockTransaction[]
  returns: ReturnRecord[]
  receivingRecords: ReceivingRecord[]
  equipment: EquipmentRecord[]
  initialized: boolean

  addItem: (data: {
    name: string
    sku: string
    category: WarehouseItemCategory
    currentStock: number
    unit: string
    minStockLevel: number
    location: string
    zoneId?: string
    capacityUnits: number
    supplierInfo: string
    sdsUrl: string
    expiryDate: string
    notes: string
  }) => void

  updateItem: (
    id: string,
    data: Partial<{
      name: string
      sku: string
      category: WarehouseItemCategory
      currentStock: number
      unit: string
      minStockLevel: number
      location: string
      zoneId: string
      capacityUnits: number
      supplierInfo: string
      sdsUrl: string
      expiryDate: string
      notes: string
    }>,
  ) => void

  deleteItem: (id: string) => void

  addZone: (data: {
    name: string
    capacityUnits: number
    type: WarehouseZoneType
  }) => string

  updateZone: (id: string, data: Partial<WarehouseZone>) => void

  deleteZone: (id: string) => void

  recordTransaction: (data: {
    itemId: string
    type: StockTransactionType
    quantity: number
    reference: string
    notes: string
    userId: string
  }) => void

  getLowStockItems: () => WarehouseItem[]

  addReturn: (data: {
    orderId: string
    customerId: string
    customerName: string
    itemDescription: string
    reason: string
    condition: string
    action: ReturnAction
  }) => void

  updateReturnStatus: (id: string, status: ReturnStatus) => void

  addReceivingRecord: (data: {
    supplier: string
    poReference: string
    items: { itemId: string; itemName: string; quantity: number }[]
    receivedBy: string
    notes: string
  }) => void

  completeReceiving: (id: string) => void

  addEquipment: (data: {
    name: string
    category: WarehouseItemCategory
    location: string
    condition: 'new' | 'good' | 'fair' | 'poor'
    notes: string
  }) => void

  updateEquipment: (
    id: string,
    data: Partial<{
      name: string
      category: WarehouseItemCategory
      location: string
      condition: 'new' | 'good' | 'fair' | 'poor'
      lastMaintenanceDate: string
      notes: string
    }>,
  ) => void

  deleteEquipment: (id: string) => void

  addWarehouse: (data: {
    warehouseCode: string
    name: string
    siteId?: string
    status?: WarehouseStatus
    address?: { label: string; address: string }
    enabledFunctions?: WarehouseFunction[]
    enabledZones?: WarehouseZoneCategory[]
    notes?: string
  }) => void

  updateWarehouse: (id: string, data: Partial<Warehouse>) => void

  deleteWarehouse: (id: string) => void
}

function migrateLocationsToZones(
  items: WarehouseItem[],
  existingZones: WarehouseZone[],
): { zones: WarehouseZone[]; updatedItems: WarehouseItem[] } {
  const zones = [...existingZones]
  const zoneMap = new Map(zones.map((z) => [z.name, z]))
  const updatedItems = items.map((item) => {
    if (item.zoneId) return item
    const location = item.location || 'Unassigned'
    let zone = zoneMap.get(location)
    if (!zone) {
      zone = {
        id: makeId(),
        name: location,
        capacityUnits: 100,
        type: 'shelf',
      }
      zones.push(zone)
      zoneMap.set(location, zone)
    }
    return { ...item, zoneId: zone.id, capacityUnits: item.capacityUnits ?? 1 }
  })
  return { zones, updatedItems }
}

const DEFAULT_WAREHOUSE: Warehouse = {
  id: 'wh-main-factory',
  warehouseCode: 'WH-MAIN-001',
  name: 'Main Factory Warehouse',
  siteId: 'main-factory',
  status: 'active',
  address: { label: 'Main Site', address: '123 Factory Road, Industrial Zone' },
  enabledFunctions: ['receiving', 'storage', 'inventoryManagement', 'production', 'dispatch'],
  enabledZones: ['consumable-chemical', 'facilities-utilities', 'linen-processing', 'packaging-shipping'],
  notes: 'Primary warehouse for all factory operations.',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

const SEED_ZONES: WarehouseZone[] = [
  { id: 'zone-a1', name: 'Aisle A - Shelf 1', capacityUnits: 100, type: 'shelf' },
  { id: 'zone-a2', name: 'Aisle A - Shelf 2', capacityUnits: 100, type: 'shelf' },
  { id: 'zone-a3', name: 'Aisle A - Shelf 3', capacityUnits: 100, type: 'shelf' },
  { id: 'zone-a4', name: 'Aisle A - Shelf 4', capacityUnits: 100, type: 'shelf' },
  { id: 'zone-b1', name: 'Aisle B - Shelf 1', capacityUnits: 100, type: 'shelf' },
  { id: 'zone-b2', name: 'Aisle B - Shelf 2', capacityUnits: 100, type: 'shelf' },
  { id: 'zone-b3', name: 'Aisle B - Shelf 3', capacityUnits: 100, type: 'shelf' },
  { id: 'zone-b4', name: 'Aisle B - Shelf 4', capacityUnits: 100, type: 'shelf' },
  { id: 'zone-c1', name: 'Aisle C - Shelf 1', capacityUnits: 100, type: 'shelf' },
  { id: 'zone-c2', name: 'Aisle C - Shelf 2', capacityUnits: 100, type: 'shelf' },
  { id: 'zone-c3', name: 'Aisle C - Shelf 3', capacityUnits: 100, type: 'shelf' },
  { id: 'zone-c4', name: 'Aisle C - Shelf 4', capacityUnits: 100, type: 'shelf' },
]

const SEED_ITEMS: WarehouseItem[] = [
  {
    id: 'wh-seed-1',
    name: 'Industrial Liquid Detergent',
    sku: 'CHM-DET-001',
    category: 'detergent',
    currentStock: 45,
    unit: 'L',
    minStockLevel: 20,
    location: 'Aisle A - Shelf 1',
    zoneId: 'zone-a1',
    capacityUnits: 1,
    supplierInfo: 'ChemCo Ltd.',
    sdsUrl: '',
    expiryDate: '2027-06-01',
    notes: 'Concentrated, use 50ml per 10kg load',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'wh-seed-2',
    name: 'Chlorine Bleach',
    sku: 'CHM-BLC-001',
    category: 'bleach',
    currentStock: 12,
    unit: 'L',
    minStockLevel: 15,
    location: 'Aisle A - Shelf 2',
    zoneId: 'zone-a2',
    capacityUnits: 1,
    supplierInfo: 'ChemCo Ltd.',
    sdsUrl: '',
    expiryDate: '2026-12-01',
    notes: 'Store in cool dry place away from acids',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'wh-seed-3',
    name: 'Fabric Softener Concentrate',
    sku: 'CHM-SFT-001',
    category: 'softener',
    currentStock: 30,
    unit: 'L',
    minStockLevel: 10,
    location: 'Aisle A - Shelf 3',
    zoneId: 'zone-a3',
    capacityUnits: 1,
    supplierInfo: 'SoftChem Inc.',
    sdsUrl: '',
    expiryDate: '2027-03-01',
    notes: '',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'wh-seed-4',
    name: 'Oxygen-Based Stain Remover',
    sku: 'CHM-STN-001',
    category: 'chemical',
    currentStock: 8,
    unit: 'kg',
    minStockLevel: 10,
    location: 'Aisle A - Shelf 4',
    zoneId: 'zone-a4',
    capacityUnits: 1,
    supplierInfo: 'StainAway Corp.',
    sdsUrl: '',
    expiryDate: '2026-09-15',
    notes: 'Low-temperature activated',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'wh-seed-5',
    name: 'Packaging Poly Bags (Large)',
    sku: 'PKG-BAG-L',
    category: 'packaging',
    currentStock: 500,
    unit: 'pcs',
    minStockLevel: 100,
    location: 'Aisle B - Shelf 1',
    zoneId: 'zone-b1',
    capacityUnits: 1,
    supplierInfo: 'PackPro Supplies',
    sdsUrl: '',
    expiryDate: '',
    notes: '60x80cm, clear',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'wh-seed-6',
    name: 'Packaging Poly Bags (Small)',
    sku: 'PKG-BAG-S',
    category: 'packaging',
    currentStock: 800,
    unit: 'pcs',
    minStockLevel: 200,
    location: 'Aisle B - Shelf 2',
    zoneId: 'zone-b2',
    capacityUnits: 1,
    supplierInfo: 'PackPro Supplies',
    sdsUrl: '',
    expiryDate: '',
    notes: '40x50cm, clear',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'wh-seed-7',
    name: 'Cardboard Shipping Boxes',
    sku: 'PKG-BOX-01',
    category: 'packaging',
    currentStock: 120,
    unit: 'pcs',
    minStockLevel: 50,
    location: 'Aisle B - Shelf 3',
    zoneId: 'zone-b3',
    capacityUnits: 1,
    supplierInfo: 'BoxMakers Inc.',
    sdsUrl: '',
    expiryDate: '',
    notes: '50x40x30cm, double-walled',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'wh-seed-8',
    name: 'Polypropylene Twine Roll',
    sku: 'PKG-TWINE',
    category: 'packaging',
    currentStock: 15,
    unit: 'roll',
    minStockLevel: 5,
    location: 'Aisle B - Shelf 4',
    zoneId: 'zone-b4',
    capacityUnits: 1,
    supplierInfo: 'PackPro Supplies',
    sdsUrl: '',
    expiryDate: '',
    notes: '',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'wh-seed-9',
    name: 'Machine Drive Belt (Model XL-200)',
    sku: 'SP-WSH-001',
    category: 'spare_part',
    currentStock: 4,
    unit: 'pcs',
    minStockLevel: 6,
    location: 'Aisle C - Shelf 1',
    zoneId: 'zone-c1',
    capacityUnits: 1,
    supplierInfo: 'LaundryTech Parts',
    sdsUrl: '',
    expiryDate: '',
    notes: 'Compatible with XL-200 series washers',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'wh-seed-10',
    name: 'Water Inlet Valve',
    sku: 'SP-WSH-002',
    category: 'spare_part',
    currentStock: 3,
    unit: 'pcs',
    minStockLevel: 5,
    location: 'Aisle C - Shelf 2',
    zoneId: 'zone-c2',
    capacityUnits: 1,
    supplierInfo: 'LaundryTech Parts',
    sdsUrl: '',
    expiryDate: '',
    notes: 'Universal 3/4" fitting',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'wh-seed-11',
    name: 'Heavy-Duty Cleaning Brush',
    sku: 'TCL-BRS-001',
    category: 'cleaning_tool',
    currentStock: 20,
    unit: 'pcs',
    minStockLevel: 5,
    location: 'Aisle C - Shelf 3',
    zoneId: 'zone-c3',
    capacityUnits: 1,
    supplierInfo: 'CleanTools Co.',
    sdsUrl: '',
    expiryDate: '',
    notes: 'Nylon bristle, 30cm handle',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'wh-seed-12',
    name: 'Lint Filter Roll (3m)',
    sku: 'TCL-FLT-001',
    category: 'cleaning_tool',
    currentStock: 6,
    unit: 'roll',
    minStockLevel: 3,
    location: 'Aisle C - Shelf 4',
    zoneId: 'zone-c4',
    capacityUnits: 1,
    supplierInfo: 'DryerPro Supplies',
    sdsUrl: '',
    expiryDate: '',
    notes: 'For industrial dryers',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
]

const SEED_EQUIPMENT: EquipmentRecord[] = [
  {
    id: 'eq-seed-1',
    name: 'Forklift (Electric)',
    category: 'maintenance_equipment',
    location: 'Warehouse Bay 1',
    condition: 'good',
    lastMaintenanceDate: '2026-06-01',
    notes: 'Rated 2-ton capacity',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-06-01T00:00:00.000Z',
  },
  {
    id: 'eq-seed-2',
    name: 'Pallet Jack (Manual)',
    category: 'maintenance_equipment',
    location: 'Warehouse Bay 2',
    condition: 'good',
    lastMaintenanceDate: '2026-05-15',
    notes: '',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-05-15T00:00:00.000Z',
  },
  {
    id: 'eq-seed-3',
    name: 'Industrial Shelving Unit A',
    category: 'maintenance_equipment',
    location: 'Aisle A',
    condition: 'good',
    lastMaintenanceDate: '2026-03-01',
    notes: '5-tier, 200kg per shelf',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-03-01T00:00:00.000Z',
  },
]

const SEED_TRANSACTIONS: StockTransaction[] = [
  {
    id: 'tx-seed-1',
    itemId: 'wh-seed-1',
    type: 'in',
    quantity: 50,
    reference: 'PO-2026-001',
    notes: 'Initial stock from ChemCo Ltd.',
    userId: 'seed',
    timestamp: '2026-06-01T08:00:00.000Z',
  },
  {
    id: 'tx-seed-2',
    itemId: 'wh-seed-2',
    type: 'in',
    quantity: 20,
    reference: 'PO-2026-001',
    notes: 'Initial stock from ChemCo Ltd.',
    userId: 'seed',
    timestamp: '2026-06-01T08:05:00.000Z',
  },
  {
    id: 'tx-seed-3',
    itemId: 'wh-seed-1',
    type: 'out',
    quantity: 5,
    reference: 'PROD-2026-001',
    notes: 'Production usage - daily wash cycle',
    userId: 'seed',
    timestamp: '2026-06-02T10:00:00.000Z',
  },
  {
    id: 'tx-seed-4',
    itemId: 'wh-seed-4',
    type: 'adjustment',
    quantity: -2,
    reference: 'ADJ-2026-001',
    notes: 'Inventory adjustment - damaged container spillage',
    userId: 'seed',
    timestamp: '2026-06-03T14:00:00.000Z',
  },
  {
    id: 'tx-seed-5',
    itemId: 'wh-seed-7',
    type: 'in',
    quantity: 100,
    reference: 'PO-2026-002',
    notes: 'Restock from BoxMakers Inc.',
    userId: 'seed',
    timestamp: '2026-06-05T09:00:00.000Z',
  },
  {
    id: 'tx-seed-6',
    itemId: 'wh-seed-9',
    type: 'in',
    quantity: 6,
    reference: 'PO-2026-003',
    notes: 'Backorder fulfillment from LaundryTech Parts',
    userId: 'seed',
    timestamp: '2026-06-07T11:00:00.000Z',
  },
  {
    id: 'tx-seed-7',
    itemId: 'wh-seed-3',
    type: 'out',
    quantity: 3,
    reference: 'PROD-2026-002',
    notes: 'Production usage',
    userId: 'seed',
    timestamp: '2026-06-08T10:30:00.000Z',
  },
]

export const useWarehouseStore = create<WarehouseState>()(
  persist(
    (set, get) => ({
      warehouses: [],
      items: [],
      warehouseZones: [],
      transactions: [],
      returns: [],
      receivingRecords: [],
      equipment: [],
      initialized: false,

      addItem: (data) =>
        set((state) => {
          const zone = data.zoneId
            ? state.warehouseZones.find((z) => z.id === data.zoneId)
            : undefined
          return {
            items: [
              ...state.items,
              {
                id: makeId(),
                name: data.name,
                sku: data.sku,
                category: data.category,
                currentStock: data.currentStock,
                unit: data.unit,
                minStockLevel: data.minStockLevel,
                location: zone ? zone.name : data.location,
                zoneId: data.zoneId,
                capacityUnits: data.capacityUnits,
                supplierInfo: data.supplierInfo,
                sdsUrl: data.sdsUrl,
                expiryDate: data.expiryDate,
                notes: data.notes,
                createdAt: now(),
                updatedAt: now(),
              },
            ],
          }
        }),

      updateItem: (id, data) =>
        set((state) => ({
          items: state.items.map((i) => {
            if (i.id !== id) return i
            const zone = data.zoneId
              ? state.warehouseZones.find((z) => z.id === data.zoneId)
              : undefined
            return {
              ...i,
              ...data,
              location: zone ? zone.name : (data.location ?? i.location),
              updatedAt: now(),
            }
          }),
        })),

      deleteItem: (id) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        })),

      addZone: (data) => {
        const id = makeId()
        set((state) => ({
          warehouseZones: [
            ...state.warehouseZones,
            { id, ...data },
          ],
        }))
        return id
      },

      updateZone: (id, data) =>
        set((state) => ({
          warehouseZones: state.warehouseZones.map((z) =>
            z.id === id ? { ...z, ...data } : z,
          ),
        })),

      deleteZone: (id) =>
        set((state) => ({
          warehouseZones: state.warehouseZones.filter((z) => z.id !== id),
          items: state.items.map((i) =>
            i.zoneId === id ? { ...i, zoneId: undefined } : i,
          ),
        })),

      recordTransaction: (data) => {
        const item = get().items.find((i) => i.id === data.itemId)
        if (!item) return

        let stockChange = 0
        if (data.type === 'in') stockChange = data.quantity
        else if (data.type === 'out') stockChange = -data.quantity
        else if (data.type === 'adjustment') stockChange = data.quantity

        const transaction: StockTransaction = {
          id: makeId(),
          itemId: data.itemId,
          type: data.type,
          quantity: data.quantity,
          reference: data.reference,
          notes: data.notes,
          userId: data.userId,
          timestamp: now(),
        }

        set((state) => ({
          transactions: [...state.transactions, transaction],
          items: state.items.map((i) =>
            i.id === data.itemId
              ? {
                  ...i,
                  currentStock: Math.max(0, i.currentStock + stockChange),
                  updatedAt: now(),
                }
              : i,
          ),
        }))
      },

      getLowStockItems: () => {
        return get().items.filter((i) => i.currentStock <= i.minStockLevel)
      },

      addReturn: (data) =>
        set((state) => ({
          returns: [
            ...state.returns,
            {
              id: makeId(),
              orderId: data.orderId,
              customerId: data.customerId,
              customerName: data.customerName,
              itemDescription: data.itemDescription,
              reason: data.reason,
              condition: data.condition,
              action: data.action,
              status: 'pending',
              createdAt: now(),
              updatedAt: now(),
            },
          ],
        })),

      updateReturnStatus: (id, status) =>
        set((state) => ({
          returns: state.returns.map((r) =>
            r.id === id ? { ...r, status, updatedAt: now() } : r,
          ),
        })),

      addReceivingRecord: (data) =>
        set((state) => ({
          receivingRecords: [
            ...state.receivingRecords,
            {
              id: makeId(),
              supplier: data.supplier,
              poReference: data.poReference,
              items: data.items,
              receivedBy: data.receivedBy,
              status: 'pending',
              notes: data.notes,
              createdAt: now(),
              updatedAt: now(),
            },
          ],
        })),

      completeReceiving: (id) =>
        set((state) => ({
          receivingRecords: state.receivingRecords.map((r) =>
            r.id === id ? { ...r, status: 'completed', updatedAt: now() } : r,
          ),
        })),

      addEquipment: (data) =>
        set((state) => ({
          equipment: [
            ...state.equipment,
            {
              id: makeId(),
              name: data.name,
              category: data.category,
              location: data.location,
              condition: data.condition,
              lastMaintenanceDate: '',
              notes: data.notes,
              createdAt: now(),
              updatedAt: now(),
            },
          ],
        })),

      updateEquipment: (id, data) =>
        set((state) => ({
          equipment: state.equipment.map((e) =>
            e.id === id ? { ...e, ...data, updatedAt: now() } : e,
          ),
        })),

      deleteEquipment: (id) =>
        set((state) => ({
          equipment: state.equipment.filter((e) => e.id !== id),
        })),

      addWarehouse: (data) =>
        set((state) => ({
          warehouses: [
            ...state.warehouses,
            {
              id: makeId(),
              warehouseCode: data.warehouseCode,
              name: data.name,
              siteId: data.siteId ?? 'main-factory',
              status: data.status ?? 'active',
              address: data.address ?? { label: '', address: '' },
              enabledFunctions: data.enabledFunctions ?? ['receiving', 'storage', 'inventoryManagement'],
              enabledZones: data.enabledZones ?? ['consumable-chemical', 'facilities-utilities'],
              notes: data.notes ?? '',
              createdAt: now(),
              updatedAt: now(),
            },
          ],
        })),

      updateWarehouse: (id, data) =>
        set((state) => ({
          warehouses: state.warehouses.map((w) =>
            w.id === id ? { ...w, ...data, updatedAt: now() } : w,
          ),
        })),

      deleteWarehouse: (id) =>
        set((state) => ({
          warehouses: state.warehouses.filter((w) => w.id !== id),
        })),
    }),
    {
      name: 'laundry-warehouse-store',
      version: 3,
      migrate: (persisted: unknown) => {
        const data = persisted as Partial<WarehouseState>
        const items = (data.items ?? []).map((item) => ({
          ...item,
          capacityUnits: item.capacityUnits ?? 1,
        }))
        const { zones, updatedItems } = migrateLocationsToZones(
          items,
          data.warehouseZones ?? [],
        )
        return {
          warehouses: data.warehouses ?? [],
          items: updatedItems,
          warehouseZones: zones,
          transactions: data.transactions ?? [],
          returns: data.returns ?? [],
          receivingRecords: data.receivingRecords ?? [],
          equipment: data.equipment ?? [],
          initialized: data.initialized ?? false,
        }
      },
      merge: (persisted, current) => ({
        ...current,
        ...(persisted as Partial<WarehouseState>),
      }),
      onRehydrateStorage: () => (state) => {
        if (state && !state.initialized) {
          state.warehouses = [DEFAULT_WAREHOUSE]
          state.warehouseZones = SEED_ZONES
          state.items = SEED_ITEMS
          state.equipment = SEED_EQUIPMENT
          state.transactions = SEED_TRANSACTIONS
          state.initialized = true
        }
      },
    },
  ),
)
