import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { DeliveryEvent, DeliveryEventType } from '../types/delivery.ts'
import { useNotificationStore } from './notification-store.ts'

function makeId(): string {
  return crypto.randomUUID()
}

function now(): string {
  return new Date().toISOString()
}

interface DeliveryEventState {
  events: DeliveryEvent[]

  addEvent: (data: {
    stopId: string
    routeId: string
    eventType: DeliveryEventType
    description: string
    cartCount?: number
    weightKg?: number
    photoUrl?: string
    scannedCode?: string
    userId: string
    userName: string
  }) => string

  getEventsByStop: (stopId: string) => DeliveryEvent[]
  getEventsByRoute: (routeId: string) => DeliveryEvent[]
  clearEventsForStop: (stopId: string) => void
}

export const useDeliveryEventStore = create<DeliveryEventState>()(
  persist(
    (set, get) => ({
      events: [],

      addEvent: (data) => {
        const id = makeId()
        set((state) => ({
          events: [
            ...state.events,
            {
              id,
              stopId: data.stopId,
              routeId: data.routeId,
              eventType: data.eventType,
              timestamp: now(),
              description: data.description,
              cartCount: data.cartCount,
              weightKg: data.weightKg,
              photoUrl: data.photoUrl,
              scannedCode: data.scannedCode,
              userId: data.userId,
              userName: data.userName,
            },
          ],
        }))
        if (data.eventType === 'arrival') {
          useNotificationStore.getState().addNotification({
            recipientIds: ['default-hotel-admin-user'],
            type: 'driver_arrived',
            title: 'Driver Arrived',
            body: data.description,
            link: `/hotel/orders`,
          })
        }
        return id
      },

      getEventsByStop: (stopId) =>
        get()
          .events.filter((e) => e.stopId === stopId)
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),

      getEventsByRoute: (routeId) =>
        get()
          .events.filter((e) => e.routeId === routeId)
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),

      clearEventsForStop: (stopId) =>
        set((state) => ({
          events: state.events.filter((e) => e.stopId !== stopId),
        })),
    }),
    {
      name: 'laundry-delivery-event-store',
      version: 1,
      migrate: (persisted: unknown) => {
        const data = persisted as Partial<DeliveryEventState>
        return { events: data.events ?? [] }
      },
      merge: (persisted, current) => ({
        ...current,
        ...(persisted as Partial<DeliveryEventState>),
      }),
    },
  ),
)
