import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ChangeRequest } from '../types/delivery.ts'

function makeId(): string {
  return crypto.randomUUID()
}

function now(): string {
  return new Date().toISOString()
}

interface ChangeRequestState {
  requests: ChangeRequest[]

  createRequest: (data: {
    orderId: string
    customerId: string
    customerName: string
    type: ChangeRequest['type']
    requestedChanges: string
    reason: string
  }) => string

  resolveRequest: (
    id: string,
    status: 'approved' | 'rejected',
    resolvedBy: string,
    notes?: string,
  ) => void

  getRequestsByOrder: (orderId: string) => ChangeRequest[]
  getPendingRequests: () => ChangeRequest[]
}

export const useChangeRequestStore = create<ChangeRequestState>()(
  persist(
    (set, get) => ({
      requests: [],

      createRequest: (data) => {
        const id = makeId()
        set((state) => ({
          requests: [
            ...state.requests,
            {
              id,
              orderId: data.orderId,
              customerId: data.customerId,
              customerName: data.customerName,
              type: data.type,
              requestedChanges: data.requestedChanges,
              reason: data.reason,
              status: 'pending',
              createdAt: now(),
              updatedAt: now(),
            },
          ],
        }))
        return id
      },

      resolveRequest: (id, status, resolvedBy, notes) =>
        set((state) => ({
          requests: state.requests.map((r) =>
            r.id === id
              ? {
                  ...r,
                  status,
                  resolvedBy,
                  resolvedAt: now(),
                  notes: notes ?? r.notes,
                  updatedAt: now(),
                }
              : r,
          ),
        })),

      getRequestsByOrder: (orderId) =>
        get()
          .requests.filter((r) => r.orderId === orderId)
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          ),

      getPendingRequests: () =>
        get()
          .requests.filter((r) => r.status === 'pending')
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          ),
    }),
    {
      name: 'laundry-change-request-store',
      version: 1,
      migrate: (persisted: unknown) => {
        const data = persisted as Partial<ChangeRequestState>
        return { requests: data.requests ?? [] }
      },
      merge: (persisted, current) => ({
        ...current,
        ...(persisted as Partial<ChangeRequestState>),
      }),
    },
  ),
)
