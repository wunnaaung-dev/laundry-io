import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  DeliveryRoute,
  RouteStop,
  RouteStatus,
  ScheduleType,
  StopStatus,
} from '../types/delivery.ts'
import { useOrderStore } from './order-store.ts'
import { useDriverManagementStore } from './driver-management-store.ts'
import { useDeliveryEventStore } from './delivery-event-store.ts'
import { useNotificationStore } from './notification-store.ts'
import { useAuthStore } from './auth-store.ts'

function makeId(): string {
  return crypto.randomUUID()
}

function now(): string {
  return new Date().toISOString()
}

interface DeliveryState {
  routes: DeliveryRoute[]
  stops: RouteStop[]

  createRoute: (data: {
    name: string
    description: string
    driverId: string
    driverName: string
    vehicleInfo: string
    scheduledDate: string
    scheduleType: ScheduleType
    recurringDays: number[]
  }) => string

  updateRoute: (id: string, data: Partial<DeliveryRoute>) => void

  deleteRoute: (id: string) => void

  transitionRouteStatus: (id: string, to: RouteStatus) => boolean

  addStop: (data: {
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
    notes: string
  }) => boolean

  updateStop: (stopId: string, data: Partial<RouteStop>) => void

  removeStop: (stopId: string) => void

  reorderStops: (routeId: string, stopIds: string[]) => void

  transitionStopStatus: (stopId: string, to: StopStatus) => boolean

  missStop: (stopId: string) => string | null

  addRushStop: (data: {
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
    notes: string
  }) => boolean

  optimizeRoute: (routeId: string) => void

  getStopsByRoute: (routeId: string) => RouteStop[]

  getRoutesByDriver: (driverId: string) => DeliveryRoute[]
}

export const useDeliveryStore = create<DeliveryState>()(
  persist(
    (set, get) => ({
      routes: [],
      stops: [],

      createRoute: (data) => {
        const id = makeId()
        set((state) => ({
          routes: [
            ...state.routes,
            {
              id,
              name: data.name,
              description: data.description,
              driverId: data.driverId,
              driverName: data.driverName,
              vehicleInfo: data.vehicleInfo,
              scheduledDate: data.scheduledDate,
              scheduleType: data.scheduleType,
              recurringDays: data.recurringDays,
              status: 'draft',
              createdAt: now(),
              updatedAt: now(),
            },
          ],
        }))
        return id
      },

      updateRoute: (id, data) =>
        set((state) => ({
          routes: state.routes.map((r) =>
            r.id === id ? { ...r, ...data, updatedAt: now() } : r,
          ),
        })),

      deleteRoute: (id) =>
        set((state) => ({
          routes: state.routes.filter((r) => r.id !== id),
          stops: state.stops.filter((s) => s.routeId !== id),
        })),

      transitionRouteStatus: (id, to) => {
        const route = get().routes.find((r) => r.id === id)
        if (!route) return false
        set((state) => ({
          routes: state.routes.map((r) =>
            r.id === id ? { ...r, status: to, updatedAt: now() } : r,
          ),
        }))
        if (to === 'active') {
          const { transitionOrder } = useOrderStore.getState()
          const routeStops = get().stops.filter((s) => s.routeId === id)
          for (const stop of routeStops) {
            transitionOrder(stop.orderId, 'in_transit')
            useDeliveryEventStore.getState().addEvent({
              stopId: stop.id,
              routeId: id,
              eventType: 'arrival',
              description: `Route "${route.name}" activated — stop en route`,
              userId: useAuthStore.getState().user?.id ?? 'system',
              userName: 'System',
            })
          }
          useNotificationStore.getState().addNotification({
            userId: route.driverId,
            type: 'route_activated',
            title: 'Route Activated',
            body: `Route "${route.name}" has been published. ${routeStops.length} stop(s) assigned.`,
            link: `/driver/tasks`,
          })
        }
        return true
      },

      addStop: (data) => {
        const route = get().routes.find((r) => r.id === data.routeId)
        if (!route) return false

        const driver = useDriverManagementStore.getState().driverProfiles.find(
          (d) => d.id === route.driverId,
        )
        if (driver) {
          const order = useOrderStore.getState().orders.find(
            (o) => o.id === data.orderId,
          )
          const newLotWeight = order?.lots.find((l) => l.id === data.lotId)?.estimatedWeightKg ?? 0
          const currentWeight = get()
            .stops.filter((s) => s.routeId === data.routeId)
            .reduce((sum, s) => {
              const o = useOrderStore.getState().orders.find((ord) => ord.id === s.orderId)
              const lot = o?.lots.find((l) => l.id === s.lotId)
              return sum + (lot?.estimatedWeightKg ?? 0)
            }, 0)
          if (currentWeight + newLotWeight > driver.maxCapacityKg) return false
        }

        const existing = get().stops.filter((s) => s.routeId === data.routeId)
        const nextSortOrder = existing.length
        set((state) => ({
          stops: [
            ...state.stops,
            {
              id: makeId(),
              routeId: data.routeId,
              orderId: data.orderId,
              lotId: data.lotId,
              lotNumber: data.lotNumber,
              customerId: data.customerId,
              customerName: data.customerName,
              address: data.address,
              timeWindowStart: data.timeWindowStart,
              timeWindowEnd: data.timeWindowEnd,
              priority: data.priority,
              sortOrder: nextSortOrder,
              status: 'pending',
              notes: data.notes,
              createdAt: now(),
              updatedAt: now(),
            },
          ],
        }))
        if (route.status === 'active') {
          const { transitionOrder } = useOrderStore.getState()
          transitionOrder(data.orderId, 'in_transit')
        }
        return true
      },

      updateStop: (stopId, data) =>
        set((state) => ({
          stops: state.stops.map((s) =>
            s.id === stopId ? { ...s, ...data, updatedAt: now() } : s,
          ),
        })),

      removeStop: (stopId) =>
        set((state) => ({
          stops: state.stops.filter((s) => s.id !== stopId),
        })),

      reorderStops: (routeId, stopIds) =>
        set((state) => ({
          stops: state.stops.map((s) => {
            if (s.routeId !== routeId) return s
            const index = stopIds.indexOf(s.id)
            return index !== -1 ? { ...s, sortOrder: index, updatedAt: now() } : s
          }),
        })),

      transitionStopStatus: (stopId, to) => {
        const stop = get().stops.find((s) => s.id === stopId)
        if (!stop) return false
        set((state) => ({
          stops: state.stops.map((s) =>
            s.id === stopId ? { ...s, status: to, updatedAt: now() } : s,
          ),
        }))
        if (to === 'completed') {
          const { transitionOrder } = useOrderStore.getState()
          transitionOrder(stop.orderId, 'delivered')
          useDeliveryEventStore.getState().addEvent({
            stopId,
            routeId: stop.routeId,
            eventType: 'departure',
            description: `Stop completed for ${stop.customerName}`,
            userId: useAuthStore.getState().user?.id ?? 'system',
            userName: 'System',
          })
        }
        return true
      },

      missStop: (stopId) => {
        const stop = get().stops.find((s) => s.id === stopId)
        if (!stop) return null
        set((state) => ({
          stops: state.stops.map((s) =>
            s.id === stopId
              ? { ...s, status: 'missed', updatedAt: now() }
              : s,
          ),
        }))
        useDeliveryEventStore.getState().addEvent({
          stopId,
          routeId: stop.routeId,
          eventType: 'note',
          description: `Missed delivery for ${stop.customerName} — rescheduling needed`,
          userId: useAuthStore.getState().user?.id ?? 'system',
          userName: 'System',
        })
        const route = get().routes.find((r) => r.id === stop.routeId)
        if (route) {
          useNotificationStore.getState().addNotification({
            userId: route.driverId,
            type: 'missed_delivery',
            title: 'Missed Delivery',
            body: `Stop at ${stop.customerName} (${stop.timeWindowStart}-${stop.timeWindowEnd}) was marked missed.`,
            link: `/factory/dispatch/routes/${stop.routeId}`,
          })
        }
        return stop.routeId
      },

      addRushStop: (data) => {
        const route = get().routes.find((r) => r.id === data.routeId)
        if (!route) return false

        const existing = get().stops.filter((s) => s.routeId === data.routeId)
        const nextSortOrder = existing.length
        set((state) => ({
          stops: [
            ...state.stops,
            {
              id: makeId(),
              routeId: data.routeId,
              orderId: data.orderId,
              lotId: data.lotId,
              lotNumber: data.lotNumber,
              customerId: data.customerId,
              customerName: data.customerName,
              address: data.address,
              timeWindowStart: data.timeWindowStart,
              timeWindowEnd: data.timeWindowEnd,
              priority: 1,
              sortOrder: nextSortOrder,
              status: 'pending',
              notes: `RUSH: ${data.notes}`,
              createdAt: now(),
              updatedAt: now(),
            },
          ],
        }))
        if (route.status === 'active') {
          const { transitionOrder } = useOrderStore.getState()
          transitionOrder(data.orderId, 'in_transit')
        }
        useNotificationStore.getState().addNotification({
          userId: route.driverId,
          type: 'rush_order',
          title: 'Rush Order Added',
          body: `Rush stop for ${data.customerName} added to route "${route.name}".`,
          link: `/driver/tasks`,
        })
        return true
      },

      optimizeRoute: (routeId) =>
        set((state) => ({
          stops: state.stops
            .filter((s) => s.routeId !== routeId)
            .concat(
              state.stops
                .filter((s) => s.routeId === routeId)
                .sort((a, b) => {
                  if (a.priority !== b.priority) return a.priority - b.priority
                  return a.customerName.localeCompare(b.customerName)
                })
                .map((s, i) => ({ ...s, sortOrder: i, updatedAt: now() })),
            ),
        })),

      getStopsByRoute: (routeId) =>
        get()
          .stops.filter((s) => s.routeId === routeId)
          .sort((a, b) => a.sortOrder - b.sortOrder),

      getRoutesByDriver: (driverId) =>
        get().routes.filter((r) => r.driverId === driverId),
    }),
    {
      name: 'laundry-delivery-store',
      version: 1,
      migrate: (persisted: unknown) => {
        const data = persisted as Partial<DeliveryState>
        return {
          routes: data.routes ?? [],
          stops: data.stops ?? [],
        }
      },
      merge: (persisted, current) => ({
        ...current,
        ...(persisted as Partial<DeliveryState>),
      }),
    },
  ),
)
