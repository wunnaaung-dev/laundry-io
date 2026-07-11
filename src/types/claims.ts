export type ClaimStatus = 'open' | 'under_review' | 'resolved' | 'rejected'
export type ResolutionTeam = 'factory_qc' | 'logistics'

export interface ClaimRecord {
  id: string
  orderId: string
  stopId: string
  description: string
  photoUrl?: string
  status: ClaimStatus
  resolutionTeam: ResolutionTeam
  createdAt: string
  resolvedAt?: string
}
