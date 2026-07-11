import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useClaimStore } from '@/stores/claim-store.ts'
import { Button } from '@/components/ui/button.tsx'
import { Badge } from '@/components/ui/badge.tsx'
import { Input } from '@/components/ui/input.tsx'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table.tsx'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select.tsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx'
import type { ResolutionTeam } from '@/types/claims.ts'

const STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  open: 'destructive',
  under_review: 'default',
  resolved: 'outline',
  rejected: 'secondary',
}

export default function ClaimsListPage() {
  const navigate = useNavigate()
  const allClaims = useClaimStore((s) => s.getAllClaims())
  const [teamFilter, setTeamFilter] = useState<ResolutionTeam | 'all'>('all')
  const [search, setSearch] = useState('')

  const filtered = allClaims.filter((c) => {
    if (teamFilter !== 'all' && c.resolutionTeam !== teamFilter) return false
    if (search && !c.description.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Claims &amp; Discrepancies</h2>
      </div>

      <div className="flex gap-3">
        <Input
          placeholder="Search claims..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Select value={teamFilter} onValueChange={(v) => setTeamFilter(v as ResolutionTeam | 'all')}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by team" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Teams</SelectItem>
            <SelectItem value="factory_qc">Factory QC</SelectItem>
            <SelectItem value="logistics">Logistics</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">All Claims ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No claims found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((claim) => (
                  <TableRow key={claim.id}>
                    <TableCell className="font-mono text-xs">{claim.orderId.slice(0, 8)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {claim.resolutionTeam === 'factory_qc' ? 'Factory QC' : 'Logistics'}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-sm">{claim.description}</TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANTS[claim.status]}>
                        {claim.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(claim.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/factory/dispatch/claims/${claim.id}`)}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
