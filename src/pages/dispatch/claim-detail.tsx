import { useParams, useNavigate } from 'react-router-dom'
import { useClaimStore } from '@/stores/claim-store.ts'
import { Button } from '@/components/ui/button.tsx'
import { Badge } from '@/components/ui/badge.tsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select.tsx'
import { useState } from 'react'
import type { ClaimStatus } from '@/types/claims.ts'

const STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  open: 'destructive',
  under_review: 'default',
  resolved: 'outline',
  rejected: 'secondary',
}

const STATUS_OPTIONS: { label: string; value: ClaimStatus }[] = [
  { label: 'Open', value: 'open' },
  { label: 'Under Review', value: 'under_review' },
  { label: 'Resolved', value: 'resolved' },
  { label: 'Rejected', value: 'rejected' },
]

export default function ClaimDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const claim = useClaimStore((s) => s.getClaimById(id ?? ''))
  const updateClaimStatus = useClaimStore((s) => s.updateClaimStatus)
  const [newStatus, setNewStatus] = useState<ClaimStatus | ''>('')

  if (!claim) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">Claim not found.</p>
          <Button className="mt-4" variant="outline" onClick={() => navigate('/factory/dispatch/claims')}>
            Back to Claims
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4 p-4">
      <Button variant="outline" size="sm" onClick={() => navigate('/factory/dispatch/claims')}>
        &larr; Back
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Claim #{claim.id.slice(0, 8)}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Order #{claim.orderId.slice(0, 8)}
                {' '}&middot;{' '}
                <Badge variant="outline" className="text-xs">
                  {claim.resolutionTeam === 'factory_qc' ? 'Factory QC' : 'Logistics'}
                </Badge>
              </p>
            </div>
            <Badge variant={STATUS_VARIANTS[claim.status]}>
              {claim.status.replace('_', ' ')}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm">
            <span className="text-muted-foreground">Description</span>
            <p className="mt-1">{claim.description}</p>
          </div>

          {claim.photoUrl && (
            <div className="text-sm">
              <span className="text-muted-foreground">Photo</span>
              <img
                src={claim.photoUrl}
                alt="Claim evidence"
                className="mt-1 max-h-48 rounded-lg border object-cover"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Created</span>
              <p className="font-medium">{new Date(claim.createdAt).toLocaleString()}</p>
            </div>
            {claim.resolvedAt && (
              <div>
                <span className="text-muted-foreground">Resolved</span>
                <p className="font-medium">{new Date(claim.resolvedAt).toLocaleString()}</p>
              </div>
            )}
          </div>

          <div className="flex items-end gap-2 pt-2">
            <div className="space-y-1">
              <span className="text-sm text-muted-foreground">Update Status</span>
              <Select
                value={newStatus}
                onValueChange={(v) => setNewStatus(v as ClaimStatus)}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              size="sm"
              disabled={!newStatus}
              onClick={() => {
                if (newStatus && claim) {
                  updateClaimStatus(claim.id, newStatus as ClaimStatus)
                  setNewStatus('')
                }
              }}
            >
              Update
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
