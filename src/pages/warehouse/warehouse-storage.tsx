import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button.tsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx'
import { useWarehouseStore } from '@/stores/warehouse-store.ts'
import type { WarehouseItem } from '@/types/warehouse.ts'
import { Warehouse } from 'lucide-react'
import ZoneCard from './zone-card.tsx'
import ZoneManageDialog from './zone-manage-dialog.tsx'

interface ZoneWithItems {
  zoneId: string
  zoneName: string
  items: WarehouseItem[]
  usedCapacity: number
  capacityUnits: number
  occupancyRatio: number
}

export default function WarehouseStoragePage() {
  const navigate = useNavigate()
  const items = useWarehouseStore((s) => s.items)
  const zones = useWarehouseStore((s) => s.warehouseZones)

  const zoneEntries = useMemo<ZoneWithItems[]>(() => {
    const zoneMap = new Map<string, WarehouseItem[]>()
    const fallbackItems: WarehouseItem[] = []

    for (const item of items) {
      if (item.zoneId) {
        const existing = zoneMap.get(item.zoneId)
        if (existing) existing.push(item)
        else zoneMap.set(item.zoneId, [item])
      } else {
        fallbackItems.push(item)
      }
    }

    const result: ZoneWithItems[] = []

    for (const zone of zones) {
      const zoneItems = zoneMap.get(zone.id) ?? []
      zoneMap.delete(zone.id)
      const used = zoneItems.reduce(
        (sum, i) => sum + i.currentStock * (i.capacityUnits ?? 1),
        0,
      )
      result.push({
        zoneId: zone.id,
        zoneName: zone.name,
        items: zoneItems,
        usedCapacity: used,
        capacityUnits: zone.capacityUnits,
        occupancyRatio:
          zone.capacityUnits > 0
            ? Math.min(used / zone.capacityUnits, 1)
            : 0,
      })
    }

    for (const [, orphanedItems] of zoneMap) {
      for (const item of orphanedItems) {
        fallbackItems.push(item)
      }
    }

    if (fallbackItems.length > 0) {
      const fallbackGroups = new Map<string, WarehouseItem[]>()
      for (const item of fallbackItems) {
        const loc = item.location || 'Unassigned'
        const existing = fallbackGroups.get(loc)
        if (existing) existing.push(item)
        else fallbackGroups.set(loc, [item])
      }
      for (const [loc, locItems] of fallbackGroups) {
        const used = locItems.reduce(
          (sum, i) => sum + i.currentStock * (i.capacityUnits ?? 1),
          0,
        )
        result.push({
          zoneId: loc,
          zoneName: loc,
          items: locItems,
          usedCapacity: used,
          capacityUnits: 100,
          occupancyRatio: Math.min(used / 100, 1),
        })
      }
    }

    return result.sort((a, b) => a.zoneName.localeCompare(b.zoneName))
  }, [items, zones])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => navigate('/factory/warehouse')}>
                <Warehouse className="h-4 w-4" />
              </Button>
              <CardTitle>Storage Zones</CardTitle>
            </div>
            <ZoneManageDialog />
          </div>
        </CardHeader>
        <CardContent>
          {zoneEntries.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No items in storage yet.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {zoneEntries.map((entry) => (
                <ZoneCard
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
    </div>
  )
}
