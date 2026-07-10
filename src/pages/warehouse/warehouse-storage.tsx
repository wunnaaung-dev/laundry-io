import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table.tsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx'
import { useWarehouseStore } from '@/stores/warehouse-store.ts'
import { CATEGORY_LABELS, CATEGORY_VARIANTS } from './constants.ts'

const MAX_ITEMS_PER_ZONE = 5

function getOccupancyColor(count: number): string {
  const ratio = count / MAX_ITEMS_PER_ZONE
  if (ratio >= 0.8) return 'border-red-500 bg-red-50 dark:bg-red-950/20'
  if (ratio >= 0.5) return 'border-amber-500 bg-amber-50 dark:bg-amber-950/20'
  return 'border-green-500 bg-green-50 dark:bg-green-950/20'
}

export default function WarehouseStoragePage() {
  const items = useWarehouseStore((s) => s.items)

  const zones = items.reduce<Record<string, typeof items>>((acc, item) => {
    const zone = item.location || 'Unassigned'
    if (!acc[zone]) acc[zone] = []
    acc[zone].push(item)
    return acc
  }, {})

  const zoneEntries = Object.entries(zones).sort(
    ([, a], [, b]) => b.length - a.length,
  )

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Storage Map</CardTitle>
        </CardHeader>
        <CardContent>
          {zoneEntries.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No items in storage yet.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {zoneEntries.map(([zone, zoneItems]) => (
                <Card
                  key={zone}
                  className={`border-l-4 ${getOccupancyColor(zoneItems.length)}`}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-semibold">
                        {zone}
                      </CardTitle>
                      <span className="text-xs text-muted-foreground">
                        {zoneItems.length} / {MAX_ITEMS_PER_ZONE}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1">
                      {zoneItems.map((item) => (
                        <span
                          key={item.id}
                          className="inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs"
                        >
                          <span
                            className={`size-1.5 rounded-full ${
                              item.currentStock <= item.minStockLevel
                                ? 'bg-red-500'
                                : 'bg-green-500'
                            }`}
                          />
                          {item.name} ({item.currentStock}
                          {item.unit})
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Zone Details</CardTitle>
        </CardHeader>
        <CardContent>
          {zoneEntries.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No zones to display.
            </p>
          ) : (
            <div className="space-y-6">
              {zoneEntries.map(([zone, zoneItems]) => (
                <div key={zone}>
                  <h3 className="text-sm font-semibold mb-2">{zone}</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Stock</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {zoneItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">
                            {item.name}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {item.sku}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`rounded-md border px-2 py-0.5 text-xs ${
                                CATEGORY_VARIANTS[item.category] === 'destructive'
                                  ? 'border-red-300 text-red-600'
                                  : CATEGORY_VARIANTS[item.category] === 'default'
                                    ? 'border-blue-300 text-blue-600'
                                    : 'border-gray-300 text-muted-foreground'
                              }`}
                            >
                              {CATEGORY_LABELS[item.category]}
                            </span>
                          </TableCell>
                          <TableCell>
                            {item.currentStock}
                            {item.unit}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
