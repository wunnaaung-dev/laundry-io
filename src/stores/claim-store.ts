import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ClaimRecord, ClaimStatus, ResolutionTeam } from '../types/claims.ts'
import type { Contract } from '../types/customer.ts'

function makeId(): string {
  return crypto.randomUUID()
}

function now(): string {
  return new Date().toISOString()
}

export function isWithinClaimWindow(
  orderCreatedAt: string,
  contract?: Contract,
): boolean {
  const windowHours = contract?.sla.claimWindowHours ?? 24
  const created = new Date(orderCreatedAt).getTime()
  const elapsed = (Date.now() - created) / (1000 * 60 * 60)
  return elapsed <= windowHours
}

interface ClaimState {
  claims: ClaimRecord[]

  createClaim: (data: {
    orderId: string
    stopId: string
    description: string
    photoUrl?: string
    resolutionTeam: ResolutionTeam
  }) => string

  updateClaimStatus: (claimId: string, status: ClaimStatus) => void

  getClaimsByOrder: (orderId: string) => ClaimRecord[]
  getClaimsByTeam: (team: ResolutionTeam) => ClaimRecord[]
  getClaimById: (claimId: string) => ClaimRecord | undefined
  getAllClaims: () => ClaimRecord[]
}

export const useClaimStore = create<ClaimState>()(
  persist(
    (set, get) => ({
      claims: [],

      createClaim: (data) => {
        const id = makeId()
        set((state) => ({
          claims: [
            ...state.claims,
            {
              id,
              orderId: data.orderId,
              stopId: data.stopId,
              description: data.description,
              photoUrl: data.photoUrl,
              status: 'open',
              resolutionTeam: data.resolutionTeam,
              createdAt: now(),
            },
          ],
        }))
        return id
      },

      updateClaimStatus: (claimId, status) =>
        set((state) => ({
          claims: state.claims.map((c) =>
            c.id === claimId
              ? {
                  ...c,
                  status,
                  ...(status === 'resolved' || status === 'rejected'
                    ? { resolvedAt: now() }
                    : {}),
                }
              : c,
          ),
        })),

      getClaimsByOrder: (orderId) =>
        get().claims.filter((c) => c.orderId === orderId),

      getClaimsByTeam: (team) =>
        get().claims.filter((c) => c.resolutionTeam === team),

      getClaimById: (claimId) =>
        get().claims.find((c) => c.id === claimId),

      getAllClaims: () => get().claims,
    }),
    {
      name: 'laundry-claim-store',
      version: 1,
      migrate: (persisted: unknown) => {
        const data = persisted as Partial<ClaimState>
        return { claims: data.claims ?? [] }
      },
      merge: (persisted, current) => ({
        ...current,
        ...(persisted as Partial<ClaimState>),
      }),
    },
  ),
)
