import { useMemo, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button.tsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx'
import { useHotelStorageStore } from '@/stores/hotel-storage-store.ts'
import { Warehouse, ListOrdered, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react'
import HotelZoneCard from './hotel-zone-card.tsx'
import HotelZoneManageDialog from './hotel-zone-manage-dialog.tsx'
import HotelMovementDialog from './hotel-movement-dialog.tsx'
import type { LinenMovementDirection } from '@/types/hotel-storage.ts'

interface ZoneEntry {
  zoneId: string
  zoneName: string
  items: ReturnType<typeof useHotelStorageStore.getState>['storedItems']
  totalItems: number
  capacityUnits: number
  occupancyRatio: number
}

export default function HotelStoragePage() {
  const navigate = useNavigate()
  const zones = useHotelStorageStore((s) => s.hotelZones)
  const storedItems = useHotelStorageStore((s) => s.storedItems)

  const [movementDialogOpen, setMovementDialogOpen] = useState(false)
  const [movementDirection, setMovementDirection] = useState<LinenMovementDirection>('incoming')
  const [movementKey, setMovementKey] = useState(0)

  const openMovement = useCallback((direction: LinenMovementDirection) => {
    setMovementDirection(direction)
    setMovementKey((k) => k + 1)
    setMovementDialogOpen(true)
  }, [])

  const zoneEntries = useMemo<ZoneEntry[]>(() => {
    return zones.map((zone) => {
      const zoneItems = storedItems.filter((s) => s.zoneId === zone.id)
      const totalItems = zoneItems.reduce((sum, s) => sum + s.quantity, 0)
      return {
        zoneId: zone.id,
        zoneName: zone.name,
        items: zoneItems,
        totalItems,
        capacityUnits: zone.capacityUnits,
        occupancyRatio:
          zone.capacityUnits > 0
            ? Math.min(totalItems / zone.capacityUnits, 1)
            : 0,
      }
    })
  }, [zones, storedItems])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => navigate('/hotel/warehouse')}>
                <Warehouse className="h-4 w-4" />
              </Button>
              <CardTitle>Storage Map</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => openMovement('incoming')}>
                <ArrowDownToLine className="size-3.5 mr-1" />
                Record Incoming
              </Button>
              <Button variant="outline" size="sm" onClick={() => openMovement('outgoing')}>
                <ArrowUpFromLine className="size-3.5 mr-1" />
                Record Outgoing
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate('/hotel/warehouse/storage/movements')}>
                <ListOrdered className="size-3.5 mr-1" />
                Movements
              </Button>
              <HotelZoneManageDialog />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {zoneEntries.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No zones configured. Create one with the Manage Zones button above.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {zoneEntries.map((entry) => (
                <HotelZoneCard
                  key={entry.zoneId}
                  zone={{
                    id: entry.zoneId,
                    name: entry.zoneName,
                    capacityUnits: entry.capacityUnits,
                    type: 'shelf',
                  }}
                  items={entry.items}
                  occupancyRatio={entry.occupancyRatio}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <HotelMovementDialog
        open={movementDialogOpen}
        onOpenChange={setMovementDialogOpen}
        defaultDirection={movementDirection}
        dialogKey={movementKey}
      />
    </div>
  )
}
