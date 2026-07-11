import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useInvoiceStore } from './invoice-store.ts'
import { useCustomerStore } from './customer-store.ts'
import { useNotificationStore } from './notification-store.ts'
import type {
  Order,
  OrderItem,
  OrderStatus,
  StatusHistoryEntry,
  Lot,
  LotStatus,
  LotStatusHistoryEntry,
  LinenCategory,
  Contract,
} from '../types/customer.ts'

function makeId(): string {
  return crypto.randomUUID()
}

function now(): string {
  return new Date().toISOString()
}

const ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  draft: ['scheduled', 'cancelled'],
  scheduled: ['ready_to_deliver', 'cancelled'],
  ready_to_deliver: ['in_transit', 'delivered', 'cancelled'],
  in_transit: ['delivered', 'cancelled'],
  delivered: ['received_at_factory', 'return_delivered', 'cancelled'],
  return_delivered: ['cancelled'],
  received_at_factory: ['in_transit', 'cancelled'],
  cancelled: [],
}

const LOT_TRANSITIONS: Record<LotStatus, LotStatus[]> = {
  tagging: ['sorting', 'cancelled'],
  sorting: ['washing', 'cancelled'],
  washing: ['drying', 'cancelled'],
  drying: ['ironing', 'cancelled'],
  ironing: ['folding', 'cancelled'],
  folding: ['qc', 'cancelled'],
  qc: ['dispatch'],
  dispatch: [],
  cancelled: [],
}

let lotCounter = 0

function nextLotNumber(): string {
  lotCounter++
  return `LOT-${String(lotCounter).padStart(2, '0')}`
}

export function getDeliveryMismatchSeverity(
  expectedQty: number,
  actualQty: number,
): 'none' | 'minor' | 'major' {
  if (expectedQty <= 0) return 'none'
  const variance = Math.abs(expectedQty - actualQty) / expectedQty
  if (variance < 0.05) return 'none'
  if (variance < 0.15) return 'minor'
  return 'major'
}

export function computeOrderTAT(
  order: Order,
  contract?: Contract,
): { elapsedHours: number; targetHours: number; status: 'on_track' | 'at_risk' | 'breached' } {
  const targetHours = contract?.sla.tatHours ?? 24
  const receivedEntry = order.statusHistory.find(
    (h) => h.to === 'received_at_factory',
  )
  const startTime = receivedEntry
    ? new Date(receivedEntry.timestamp).getTime()
    : new Date(order.createdAt).getTime()

  const deliveredEntry = order.statusHistory.find(
    (h) => h.to === 'return_delivered',
  )
  const endTime = deliveredEntry
    ? new Date(deliveredEntry.timestamp).getTime()
    : Date.now()

  const elapsedHours = (endTime - startTime) / (1000 * 60 * 60)
  const ratio = elapsedHours / targetHours

  let status: 'on_track' | 'at_risk' | 'breached'
  if (ratio >= 1) status = 'breached'
  else if (ratio >= 0.8) status = 'at_risk'
  else status = 'on_track'

  return { elapsedHours, targetHours, status }
}

export function autoGenerateLots(items: OrderItem[]): Lot[] {
  const seen = new Set<LinenCategory>()
  const lots: Lot[] = []
  for (const item of items) {
    if (!seen.has(item.category)) {
      seen.add(item.category)
      const totalQty = items
        .filter((i) => i.category === item.category)
        .reduce((s, i) => s + i.quantity, 0)
      const totalWeight = items
        .filter((i) => i.category === item.category)
        .reduce((s, i) => s + (i.weightKg ?? 0), 0)
      lots.push({
        id: makeId(),
        lotNumber: nextLotNumber(),
        category: item.category,
        quantity: totalQty,
        estimatedWeightKg: totalWeight,
        route: '',
        status: 'tagging',
        qcCheckPassed: false,
        statusHistory: [
          { from: 'tagging', to: 'tagging', timestamp: now() },
        ],
        createdAt: now(),
        updatedAt: now(),
      })
    }
  }
  return lots
}

interface OrderState {
  orders: Order[]

  createOrder: (data: {
    customerId: string
    contractId: string
    items: OrderItem[]
    expectedCost: number
    pickupDate?: string
    notes?: string
  }) => void

  updateOrder: (
    id: string,
    data: {
      items: OrderItem[]
      expectedCost: number
      pickupDate?: string
      notes?: string
    },
  ) => void

  deleteOrder: (id: string) => void

  transitionOrder: (id: string, to: OrderStatus) => boolean

  checkInOrder: (id: string) => void

  createLot: (
    orderId: string,
    data: {
      category: LinenCategory
      quantity: number
      estimatedWeightKg: number
      route: string
    },
  ) => void

  updateLot: (
    orderId: string,
    lotId: string,
    data: {
      quantity?: number
      estimatedWeightKg?: number
      route?: string
    },
  ) => void

  transitionLot: (orderId: string, lotId: string, to: LotStatus) => boolean

  setLotQcResult: (orderId: string, lotId: string, passed: boolean) => void

  getOrdersByCustomer: (customerId: string) => Order[]
  getOrdersByContract: (contractId: string) => Order[]

  confirmDelivery: (id: string, actualLots?: Array<{ lotId: string; scannedQty: number }>) => void

  checkForTatBreach: () => void
}

export const useOrderStore = create<OrderState>()(
  persist(
    (set, get) => ({
      orders: [],

      createOrder: (data) =>
        set((state) => {
          const order: Order = {
            id: makeId(),
            customerId: data.customerId,
            contractId: data.contractId,
            items: data.items,
            lots: [],
            status: 'draft',
            statusHistory: [
              { from: 'draft', to: 'draft', timestamp: now() },
            ],
            expectedCost: data.expectedCost,
            pickupDate: data.pickupDate,
            notes: data.notes,
            billingHold: false,
            createdAt: now(),
            updatedAt: now(),
          }
          return { orders: [...state.orders, order] }
        }),

      updateOrder: (id, data) =>
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === id && o.status === 'draft'
              ? {
                  ...o,
                  items: data.items,
                  expectedCost: data.expectedCost,
                  pickupDate: data.pickupDate,
                  notes: data.notes,
                  updatedAt: now(),
                }
              : o,
          ),
        })),

      deleteOrder: (id) =>
        set((state) => ({
          orders: state.orders.filter((o) => o.id !== id),
        })),

      transitionOrder: (id, to) => {
        const order = get().orders.find((o) => o.id === id)
        if (!order) return false
        const allowed = ORDER_TRANSITIONS[order.status]
        if (!allowed.includes(to)) return false
        const entry: StatusHistoryEntry = {
          from: order.status,
          to,
          timestamp: now(),
        }
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === id
              ? {
                  ...o,
                  status: to,
                  statusHistory: [...o.statusHistory, entry],
                  updatedAt: now(),
                }
              : o,
          ),
        }))
        return true
      },

      checkInOrder: (id) => {
        const order = get().orders.find((o) => o.id === id)
        if (!order) return
        const allowedStatuses: OrderStatus[] = ['ready_to_deliver', 'delivered']
        if (!allowedStatuses.includes(order.status)) return
        const target: OrderStatus = 'received_at_factory'
        const entry: StatusHistoryEntry = {
          from: order.status,
          to: target,
          timestamp: now(),
        }
        const lots = autoGenerateLots(order.items)
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === id
              ? {
                  ...o,
                  lots,
                  status: target,
                  statusHistory: [...o.statusHistory, entry],
                  updatedAt: now(),
                }
              : o,
          ),
        }))
      },

      createLot: (orderId, data) =>
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  lots: [
                    ...o.lots,
                    {
                      id: makeId(),
                      lotNumber: nextLotNumber(),
                      category: data.category,
                      quantity: data.quantity,
                      estimatedWeightKg: data.estimatedWeightKg,
                      route: data.route,
                      status: 'tagging',
                      qcCheckPassed: false,
                      statusHistory: [
                        { from: 'tagging', to: 'tagging', timestamp: now() },
                      ],
                      createdAt: now(),
                      updatedAt: now(),
                    },
                  ],
                  updatedAt: now(),
                }
              : o,
          ),
        })),

      updateLot: (orderId, lotId, data) =>
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  lots: o.lots.map((l) =>
                    l.id === lotId
                      ? {
                          ...l,
                          ...(data.quantity !== undefined
                            ? { quantity: data.quantity }
                            : {}),
                          ...(data.estimatedWeightKg !== undefined
                            ? { estimatedWeightKg: data.estimatedWeightKg }
                            : {}),
                          ...(data.route !== undefined
                            ? { route: data.route }
                            : {}),
                          updatedAt: now(),
                        }
                      : l,
                  ),
                  updatedAt: now(),
                }
              : o,
          ),
        })),

      transitionLot: (orderId, lotId, to) => {
        const order = get().orders.find((o) => o.id === orderId)
        if (!order) return false
        const lot = order.lots.find((l) => l.id === lotId)
        if (!lot) return false
        const allowed = LOT_TRANSITIONS[lot.status]
        if (!allowed.includes(to)) return false
        if (to === 'dispatch' && !lot.qcCheckPassed) return false
        const entry: LotStatusHistoryEntry = {
          from: lot.status,
          to,
          timestamp: now(),
        }
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  lots: o.lots.map((l) =>
                    l.id === lotId
                      ? {
                          ...l,
                          status: to,
                          statusHistory: [...l.statusHistory, entry],
                          updatedAt: now(),
                        }
                      : l,
                  ),
                  updatedAt: now(),
                }
              : o,
          ),
        }))
        return true
      },

      setLotQcResult: (orderId, lotId, passed) =>
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  lots: o.lots.map((l) =>
                    l.id === lotId
                      ? { ...l, qcCheckPassed: passed, updatedAt: now() }
                      : l,
                  ),
                  updatedAt: now(),
                }
              : o,
          ),
        })),

      getOrdersByCustomer: (customerId) =>
        get().orders.filter((o) => o.customerId === customerId),

      getOrdersByContract: (contractId) =>
        get().orders.filter((o) => o.contractId === contractId),

      confirmDelivery: (id, actualLots) => {
        const order = get().orders.find((o) => o.id === id)
        if (!order) return
        if (order.status !== 'delivered') return

        let totalExpected = 0
        let totalActual = 0
        for (const item of order.items) {
          totalExpected += item.quantity
          if (actualLots && actualLots.length > 0) {
            for (const actual of actualLots) {
              if (order.lots.find((l) => l.id === actual.lotId && l.category === item.category)) {
                totalActual += actual.scannedQty
              }
            }
          } else {
            totalActual = totalExpected
          }
        }

        const severity = getDeliveryMismatchSeverity(totalExpected, totalActual)
        const entry: StatusHistoryEntry = {
          from: 'delivered',
          to: 'return_delivered',
          timestamp: now(),
        }

        if (severity === 'major') {
          entry.notes = `Major mismatch (${Math.abs(totalExpected - totalActual)} pcs) — billing hold`
          set((state) => ({
            orders: state.orders.map((o) =>
              o.id === id
                ? {
                    ...o,
                    status: 'return_delivered',
                    billingHold: true,
                    billingHoldReason: `Major mismatch (${Math.abs(totalExpected - totalActual)} pcs difference) — manual review required`,
                    statusHistory: [...o.statusHistory, entry],
                    updatedAt: now(),
                  }
                : o,
            ),
          }))
        } else if (severity === 'minor') {
          entry.notes = `Minor mismatch (${Math.abs(totalExpected - totalActual)} pcs) — invoiced at actual qty`
          set((state) => ({
            orders: state.orders.map((o) =>
              o.id === id
                ? {
                    ...o,
                    status: 'return_delivered',
                    statusHistory: [...o.statusHistory, entry],
                    updatedAt: now(),
                  }
                : o,
            ),
          }))
          const { generateInvoice } = useInvoiceStore.getState()
          generateInvoice(id, undefined, totalActual)
        } else {
          set((state) => ({
            orders: state.orders.map((o) =>
              o.id === id
                ? {
                    ...o,
                    status: 'return_delivered',
                    statusHistory: [...o.statusHistory, entry],
                    updatedAt: now(),
                  }
                : o,
            ),
          }))
          const { generateInvoice } = useInvoiceStore.getState()
          generateInvoice(id, undefined, totalActual)
        }

        const tat = computeOrderTAT(order)
        if (tat.status === 'breached') {
          useNotificationStore.getState().addNotification({
            recipientIds: ['default-factory-admin-user'],
            type: 'tat_breach',
            title: 'TAT Breach',
            body: `Order #${id.slice(0, 8)} exceeded TAT of ${tat.targetHours}h (${Math.round(tat.elapsedHours)}h elapsed).`,
            link: `/factory/orders/${id}`,
          })
        }
      },

      checkForTatBreach: () => {
        const { orders } = get()
        const contracts = useCustomerStore.getState().contracts
        for (const order of orders) {
          if (order.status === 'return_delivered' || order.status === 'cancelled') continue
          const contract = contracts.find((c) => c.id === order.contractId)
          const tat = computeOrderTAT(order, contract)
          if (tat.status === 'breached') {
            useNotificationStore.getState().addNotification({
              recipientIds: ['default-factory-admin-user'],
              type: 'tat_breach',
              title: 'TAT Breach',
              body: `Order #${order.id.slice(0, 8)} exceeded TAT of ${tat.targetHours}h (${Math.round(tat.elapsedHours)}h elapsed).`,
              link: `/factory/orders/${order.id}`,
            })
          }
        }
      },
    }),
    {
      name: 'laundry-order-store',
      version: 2,
      migrate: () => ({
        orders: [],
      }),
      merge: (persisted, current) => ({
        ...current,
        ...(persisted as Partial<OrderState>),
      }),
    },
  ),
)
