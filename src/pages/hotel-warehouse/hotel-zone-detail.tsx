import { useMemo, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowDownToLine, ArrowUpFromLine, ListOrdered } from 'lucide-react'
import { Button } from '@/components/ui/button.tsx'
import { Badge } from '@/components/ui/badge.tsx'
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
import HotelMovementDialog from './hotel-movement-dialog.tsx'
import type { LinenCategory } from '@/types/customer.ts'
import type { LinenMovementDirection } from '@/types/hotel-storage.ts'

const ZONE_TYPE_LABELS: Record<string, string> = {
  shelf: 'Shelf',
  rack: 'Rack',
  bin: 'Bin',
  floor: 'Floor',
  room: 'Room',
}

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

export default function HotelZoneDetailPage() {
  const { zoneId } = useParams()
  const navigate = useNavigate()
  const zones = useHotelStorageStore((s) => s.hotelZones)
  const storedItems = useHotelStorageStore((s) => s.storedItems)

  const zone = zones.find((z) => z.id === zoneId)

  const zoneItems = useMemo(
    () => storedItems.filter((s) => s.zoneId === zoneId),
    [storedItems, zoneId],
  )

  const totalItems = useMemo(
    () => zoneItems.reduce((sum, s) => sum + s.quantity, 0),
    [zoneItems],
  )

  const capacityUnits = zone?.capacityUnits ?? 100
  const occupancyRatio =
    capacityUnits > 0 ? Math.min(totalItems / capacityUnits, 1) : 0

  const isOverCapacity = totalItems > capacityUnits

  const movements = useHotelStorageStore((s) => s.movements)
  const zoneMovements = useMemo(
    () =>
      movements
        .filter((m) => m.zoneId === zoneId)
        .sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
        )
        .slice(0, 20),
    [movements, zoneId],
  )

  const [movementDialogOpen, setMovementDialogOpen] = useState(false)
  const [movementDirection, setMovementDirection] = useState<LinenMovementDirection>('incoming')
  const [movementKey, setMovementKey] = useState(0)

  const openMovement = useCallback((direction: LinenMovementDirection) => {
    setMovementDirection(direction)
    setMovementKey((k) => k + 1)
    setMovementDialogOpen(true)
  }, [])

  if (!zone) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground mb-4">Zone not found.</p>
          <Button variant="outline" onClick={() => navigate('/hotel/warehouse/storage')}>
            <ArrowLeft className="size-4 mr-1" />
            Back to Storage
          </Button>
        </CardContent>
      </Card>
    )
  }

  const occupancyColor =
    occupancyRatio >= 0.8
      ? 'bg-red-500'
      : occupancyRatio >= 0.5
        ? 'bg-amber-500'
        : 'bg-green-500'

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate('/hotel/warehouse/storage')}>
        <ArrowLeft className="size-4 mr-1" />
        Back to Storage
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CardTitle className="text-xl">{zone.name}</CardTitle>
              <Badge variant="outline">{ZONE_TYPE_LABELS[zone.type] ?? zone.type}</Badge>
              <span className="text-sm text-muted-foreground ml-2">
                {Math.round(occupancyRatio * 100)}% occupied
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => openMovement('incoming')}>
                <ArrowDownToLine className="size-3.5 mr-1" />
                Incoming
              </Button>
              <Button variant="outline" size="sm" onClick={() => openMovement('outgoing')}>
                <ArrowUpFromLine className="size-3.5 mr-1" />
                Outgoing
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate('/hotel/warehouse/storage/movements')}>
                <ListOrdered className="size-3.5 mr-1" />
                Movements
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${occupancyColor}`}
                style={{ width: `${Math.min(Math.round(occupancyRatio * 100), 100)}%` }}
              />
            </div>

            <div className="grid gap-4 grid-cols-2 sm:grid-cols-3">
              <div>
                <p className="text-xs text-muted-foreground">Capacity</p>
                <p className="text-lg font-semibold">{capacityUnits} units</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Used</p>
                <p className="text-lg font-semibold">{totalItems} units</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Categories</p>
                <p className="text-lg font-semibold">{zoneItems.length}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {isOverCapacity && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-destructive">Over Capacity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              This zone exceeds its capacity by {totalItems - capacityUnits} units.
              Consider redistributing items to other zones.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total Items</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalItems}</p>
          </CardContent>
        </Card>
        {zoneItems.map((item) => (
          <Card key={item.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground capitalize">
                {CATEGORY_LABELS[item.category]}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{item.quantity}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Items in This Zone</CardTitle>
        </CardHeader>
        <CardContent>
          {zoneItems.length === 0 ? (
            <p className="text-sm text-muted-foreground">No items in this zone.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>% of Capacity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {zoneItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      <Badge variant={CATEGORY_VARIANTS[item.category]}>
                        {CATEGORY_LABELS[item.category]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-lg font-semibold">
                      {item.quantity}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {capacityUnits > 0
                        ? `${Math.round((item.quantity / capacityUnits) * 100)}%`
                        : '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Recent Movements</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/hotel/warehouse/storage/movements')}
            >
              <ListOrdered className="size-3.5 mr-1" />
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {zoneMovements.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No movements recorded for this zone.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Direction</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Reference</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {zoneMovements.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(m.timestamp).toLocaleString()}
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
                        {m.direction === 'incoming' ? 'Incoming' : 'Outgoing'}
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <HotelMovementDialog
        open={movementDialogOpen}
        onOpenChange={setMovementDialogOpen}
        defaultZoneId={zoneId}
        defaultDirection={movementDirection}
        dialogKey={movementKey}
      />
    </div>
  )
}
