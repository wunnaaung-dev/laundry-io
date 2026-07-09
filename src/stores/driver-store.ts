import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Order } from '../types/customer.ts'
import type { CustomerProfile } from '../types/customer.ts'
import { useOrderStore } from './order-store.ts'

export type TripStatus = 'idle' | 'in_transit' | 'arrived' | 'delivered'

export interface DriverTask {
  id: string
  orderId: string
  clientName: string
  lotDescription: string
  scheduledTime: string
  type: 'pickup' | 'delivery'
  status: 'pending' | 'in_progress' | 'completed' | 'mismatch' | 'delivered'
  scannedItems: string[]
}

export interface ScanRecord {
  id: string
  taskId: string
  code: string
  success: boolean
  timestamp: string
}

interface DriverState {
  currentTrip: string | null
  tripStatus: TripStatus
  tasks: DriverTask[]
  scanHistory: ScanRecord[]

  startTrip: (tripId: string) => void
  completeDelivery: () => void
  recordScan: (taskId: string, code: string) => boolean
  setTasks: (tasks: DriverTask[]) => void
  updateTaskStatus: (taskId: string, status: DriverTask['status']) => void
  syncReadyOrders: (orders: Order[], customers: CustomerProfile[]) => void
}

export const useDriverStore = create<DriverState>()(
  persist(
    (set, get) => ({
      currentTrip: null,
      tripStatus: 'idle',
      tasks: [],
      scanHistory: [],

      startTrip: (tripId) =>
        set({ currentTrip: tripId, tripStatus: 'in_transit' }),

      completeDelivery: () =>
        set({ tripStatus: 'delivered', currentTrip: null }),

      recordScan: (taskId, code) => {
        const task = get().tasks.find((t) => t.id === taskId)
        if (!task) return false

        const success = code.length >= 4
        const record: ScanRecord = {
          id: crypto.randomUUID(),
          taskId,
          code,
          success,
          timestamp: new Date().toISOString(),
        }

        set((state) => ({
          scanHistory: [...state.scanHistory, record],
          tasks: state.tasks.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  scannedItems: success
                    ? [...t.scannedItems, code]
                    : t.scannedItems,
                  status: success ? 'completed' : 'mismatch',
                }
              : t,
          ),
        }))

        if (success) {
          const { transitionOrder } = useOrderStore.getState()
          transitionOrder(task.orderId, 'in_transit')
        }

        return success
      },

      setTasks: (tasks) => set({ tasks }),

      updateTaskStatus: (taskId, status) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId ? { ...t, status } : t,
          ),
        })),

      syncReadyOrders: (orders, customers) => {
        const customerMap = new Map(customers.map((c) => [c.id, c.companyName]))
        const readyOrderIds = new Set(
          orders
            .filter((o) => o.status === 'ready_to_deliver')
            .map((o) => o.id),
        )

        set((state) => {
          const existingOrderIds = new Set(state.tasks.map((t) => t.orderId))
          const newTasks: DriverTask[] = []

          for (const order of orders) {
            if (order.status !== 'ready_to_deliver') continue
            if (existingOrderIds.has(order.id)) continue

            const clientName =
              customerMap.get(order.customerId) ?? 'Unknown'
            const lotDescription = order.items
              .map((i) => `${i.quantity} ${i.category}`)
              .join(', ')

            newTasks.push({
              id: crypto.randomUUID(),
              orderId: order.id,
              clientName,
              lotDescription,
              scheduledTime:
                order.pickupDate ?? new Date().toLocaleDateString(),
              type: 'delivery',
              status: 'pending',
              scannedItems: [],
            })
          }

          const keptTasks = state.tasks.filter((t) => {
            if (t.status === 'completed' || t.status === 'delivered') return true
            return readyOrderIds.has(t.orderId)
          })

          return { tasks: [...keptTasks, ...newTasks] }
        })
      },
    }),
    { name: 'laundry-driver-store' },
  ),
)
