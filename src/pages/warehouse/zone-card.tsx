import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx'
import { Badge } from '@/components/ui/badge.tsx'
import { ZONE_TYPE_LABELS } from './constants.ts'
import ItemChip from './item-chip.tsx'
import type { WarehouseItem, WarehouseZone } from '@/types/warehouse.ts'

interface ZoneCardProps {
  zone: WarehouseZone
  items: WarehouseItem[]
  occupancyRatio: number
}

function getOccupancyColor(ratio: number): string {
  if (ratio >= 0.8) return 'border-red-500 bg-red-500/10'
  if (ratio >= 0.5) return 'border-amber-500 bg-amber-500/10'
  return 'border-green-500 bg-green-500/10'
}

export default function ZoneCard({ zone, items, occupancyRatio }: ZoneCardProps) {
  const navigate = useNavigate()
  const sorted = [...items].sort((a, b) => {
    if (!a.expiryDate) return 1
    if (!b.expiryDate) return -1
    return a.expiryDate.localeCompare(b.expiryDate)
  })

  return (
    <Card
      className={`border-l-4 cursor-pointer ${getOccupancyColor(occupancyRatio)}`}
      onClick={() => navigate(`/factory/warehouse/zones/${zone.id}`)}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold">{zone.name}</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px]">
              {ZONE_TYPE_LABELS[zone.type] ?? zone.type}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {Math.round(occupancyRatio * 100)}%
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-1">
          {sorted.map((item) => (
            <ItemChip key={item.id} item={item} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
