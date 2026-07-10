import { useState, useMemo } from 'react'
import { Badge } from '@/components/ui/badge.tsx'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select.tsx'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table.tsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx'
import { useHotelStorageStore } from '@/stores/hotel-storage-store.ts'
import type { LinenCategory } from '@/types/customer.ts'
import type { LinenMovementDirection } from '@/types/hotel-storage.ts'

const CATEGORY_LABELS: Record<LinenCategory, string> = {
  linen: 'Linens',
  towel: 'Towels',
  uniform: 'Uniforms',
}

const CATEGORY_VARIANTS: Record<LinenCategory, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  linen: 'default',
  towel: 'secondary',
  uniform: 'outline',
}

const DIRECTION_LABELS: Record<LinenMovementDirection, string> = {
  incoming: 'Incoming',
  outgoing: 'Outgoing',
}

const categories: LinenCategory[] = ['linen', 'towel', 'uniform']
const directions: (LinenMovementDirection | 'all')[] = ['all', 'incoming', 'outgoing']

export default function HotelMovementLogPage() {
  const movements = useHotelStorageStore((s) => s.movements)
  const zones = useHotelStorageStore((s) => s.hotelZones)

  const [directionFilter, setDirectionFilter] = useState<LinenMovementDirection | 'all'>('all')
  const [zoneFilter, setZoneFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  const zoneMap = useMemo(
    () => new Map(zones.map((z) => [z.id, z.name])),
    [zones],
  )

  const filtered = useMemo(
    () =>
      movements.filter((m) => {
        if (directionFilter !== 'all' && m.direction !== directionFilter) return false
        if (zoneFilter !== 'all' && m.zoneId !== zoneFilter) return false
        if (categoryFilter !== 'all' && m.category !== categoryFilter) return false
        return true
      }),
    [movements, directionFilter, zoneFilter, categoryFilter],
  )

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Linen Movement Log</CardTitle>
          <div className="flex items-center gap-3">
            <Select
              value={directionFilter}
              onValueChange={(v) => setDirectionFilter(v as LinenMovementDirection | 'all')}
            >
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Direction" />
              </SelectTrigger>
              <SelectContent>
                {directions.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d === 'all' ? 'All Directions' : DIRECTION_LABELS[d]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={zoneFilter} onValueChange={setZoneFilter}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Filter by zone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Zones</SelectItem>
                {zones.map((z) => (
                  <SelectItem key={z.id} value={z.id}>
                    {z.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>
                    {CATEGORY_LABELS[c]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground">No movements found.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Zone</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Direction</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered
                .slice()
                .reverse()
                .map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(m.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell className="font-medium">
                      {zoneMap.get(m.zoneId) ?? 'Unknown Zone'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={CATEGORY_VARIANTS[m.category]}>
                        {CATEGORY_LABELS[m.category]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={m.direction === 'incoming' ? 'default' : 'destructive'}
                      >
                        {DIRECTION_LABELS[m.direction]}
                      </Badge>
                    </TableCell>
                    <TableCell
                      className={
                        m.direction === 'incoming'
                          ? 'text-green-600 font-semibold'
                          : 'text-red-600 font-semibold'
                      }
                    >
                      {m.direction === 'incoming' ? '+' : '-'}
                      {m.quantity}
                    </TableCell>
                    <TableCell className="text-muted-foreground capitalize">
                      {m.reason.replace(/_/g, ' ')}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {m.reference || '—'}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                      {m.notes || '—'}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
