import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Order } from '../types/customer.ts'
import type { CustomerProfile } from '../types/customer.ts'
import type { DeliveryRoute, RouteStop, DriverLocation } from '../types/delivery.ts'
import { useOrderStore } from './order-store.ts'
import { useDeliveryStore } from './delivery-store.ts'
import { useDeliveryEventStore } from './delivery-event-store.ts'
import { useAuthStore } from './auth-store.ts'

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
  routeId?: string
  routeName?: string
  stopId?: string
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
  currentLocation: DriverLocation | null

  startTrip: (tripId: string) => void
  completeDelivery: () => void
  recordScan: (taskId: string, code: string) => boolean
  setTasks: (tasks: DriverTask[]) => void
  updateTaskStatus: (taskId: string, status: DriverTask['status']) => void
  syncReadyOrders: (orders: Order[], customers: CustomerProfile[]) => void
  updateLocation: (driverId: string, driverName: string, lat: number, lng: number) => void

  syncFromDeliveryStore: (
    driverId: string,
    routes: DeliveryRoute[],
    stops: RouteStop[],
    orders: Order[],
  ) => void
}

export const useDriverStore = create<DriverState>()(
  persist(
    (set, get) => ({
      currentTrip: null,
      tripStatus: 'idle',
      tasks: [],
      scanHistory: [],
      currentLocation: null,

      startTrip: (tripId) =>
        set({ currentTrip: tripId, tripStatus: 'in_transit' }),

      completeDelivery: () =>
        set({ tripStatus: 'delivered', currentTrip: null }),

      updateLocation: (driverId, driverName, lat, lng) =>
        set({
          currentLocation: {
            driverId,
            driverName,
            lat,
            lng,
            updatedAt: new Date().toISOString(),
            status: get().tripStatus,
          },
        }),

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
          if (task.stopId) {
            const { transitionStopStatus, stops } = useDeliveryStore.getState()
            transitionStopStatus(task.stopId, 'completed')
            const stop = stops.find((s) => s.id === task.stopId)
            if (stop) {
              useDeliveryEventStore.getState().addEvent({
                stopId: task.stopId,
                routeId: stop.routeId,
                eventType: 'scan',
                description: `Scanned ${code} for ${task.clientName}`,
                scannedCode: code,
                userId: useAuthStore.getState().user?.id ?? 'driver',
                userName: task.clientName,
              })
            }
          }
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

      syncFromDeliveryStore: (driverId, routes, stops, orders) => {
        const driverRoutes = routes.filter(
          (r) => r.driverId === driverId && r.status === 'active',
        )
        const routeStops = driverRoutes.flatMap((r) =>
          stops
            .filter((s) => s.routeId === r.id)
            .map((s) => ({ stop: s, route: r })),
        )

        set((state) => {
          const existingOrderIds = new Set(state.tasks.map((t) => t.orderId))
          const newTasks: DriverTask[] = []

          for (const { stop, route } of routeStops) {
            if (existingOrderIds.has(stop.orderId)) continue
            const order = orders.find((o) => o.id === stop.orderId)
            const lotDescription = order
              ? order.items.map((i) => `${i.quantity} ${i.category}`).join(', ')
              : stop.lotNumber

            newTasks.push({
              id: crypto.randomUUID(),
              orderId: stop.orderId,
              clientName: stop.customerName,
              lotDescription,
              scheduledTime: `${route.scheduledDate ?? ''} ${stop.timeWindowStart}-${stop.timeWindowEnd}`,
              type: 'delivery',
              status: stop.status === 'completed' ? 'completed' : 'pending',
              scannedItems: [],
              routeId: route.id,
              routeName: route.name,
              stopId: stop.id,
            })
          }

          const keptTasks = state.tasks.filter((t) => {
            if (t.status === 'completed' || t.status === 'delivered') return true
            return routeStops.some((rs) => rs.stop.orderId === t.orderId)
          })

          return { tasks: [...keptTasks, ...newTasks] }
        })
      },
    }),
    { name: 'laundry-driver-store' },
  ),
)
