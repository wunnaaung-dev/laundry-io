import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx'
import { Badge } from '@/components/ui/badge.tsx'
import type { HotelZone, HotelStoredItem } from '@/types/hotel-storage.ts'
import type { LinenCategory } from '@/types/customer.ts'

interface HotelZoneCardProps {
  zone: HotelZone
  items: HotelStoredItem[]
  occupancyRatio: number
}

const CATEGORY_LABELS: Record<LinenCategory, string> = {
  linen: 'Linens',
  towel: 'Towels',
  uniform: 'Uniforms',
}

const CATEGORY_COLORS: Record<LinenCategory, string> = {
  linen: 'border-blue-400 bg-blue-500/10 text-blue-300',
  towel: 'border-emerald-400 bg-emerald-500/10 text-emerald-300',
  uniform: 'border-purple-400 bg-purple-500/10 text-purple-300',
}

const ZONE_TYPE_LABELS: Record<string, string> = {
  shelf: 'Shelf',
  rack: 'Rack',
  bin: 'Bin',
  floor: 'Floor',
  room: 'Room',
}

function getOccupancyColor(ratio: number): string {
  if (ratio >= 0.8) return 'border-red-500 bg-red-500/10'
  if (ratio >= 0.5) return 'border-amber-500 bg-amber-500/10'
  return 'border-green-500 bg-green-500/10'
}

export default function HotelZoneCard({ zone, items, occupancyRatio }: HotelZoneCardProps) {
  const navigate = useNavigate()

  return (
    <Card
      className={`border-l-4 cursor-pointer ${getOccupancyColor(occupancyRatio)}`}
      onClick={() => navigate(`/hotel/warehouse/zones/${zone.id}`)}
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
        {items.length === 0 ? (
          <p className="text-xs text-muted-foreground">No items stored.</p>
        ) : (
          <div className="flex flex-wrap gap-1">
            {items.map((item) => (
              <span
                key={item.id}
                className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs ${CATEGORY_COLORS[item.category]}`}
              >
                {CATEGORY_LABELS[item.category]}: {item.quantity}
              </span>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
