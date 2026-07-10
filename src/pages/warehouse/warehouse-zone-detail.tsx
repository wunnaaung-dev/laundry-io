import { useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, TriangleAlert, ExternalLink, FileWarning } from 'lucide-react'
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip.tsx'
import { useWarehouseStore } from '@/stores/warehouse-store.ts'
import {
  CATEGORY_LABELS,
  CATEGORY_VARIANTS,
  ZONE_TYPE_LABELS,
  HAZARDOUS_CATEGORIES,
  TRANSACTION_LABELS,
  TRANSACTION_VARIANTS,
  getExpiryStatus,
  EXPIRY_LABELS,
  EXPIRY_VARIANTS,
} from './constants.ts'

export default function WarehouseZoneDetailPage() {
  const { zoneId } = useParams()
  const navigate = useNavigate()
  const zones = useWarehouseStore((s) => s.warehouseZones)
  const items = useWarehouseStore((s) => s.items)
  const transactions = useWarehouseStore((s) => s.transactions)

  const zone = zones.find((z) => z.id === zoneId)

  const zoneItems = useMemo(
    () => items.filter((i) => i.zoneId === zoneId),
    [items, zoneId],
  )

  const itemIds = useMemo(() => new Set(zoneItems.map((i) => i.id)), [zoneItems])

  const zoneTransactions = useMemo(
    () =>
      transactions
        .filter((t) => itemIds.has(t.itemId))
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
    [transactions, itemIds],
  )

  const itemMap = useMemo(
    () => new Map(zoneItems.map((i) => [i.id, i])),
    [zoneItems],
  )

  const usedCapacity = useMemo(
    () =>
      zoneItems.reduce(
        (sum, i) => sum + i.currentStock * (i.capacityUnits ?? 1),
        0,
      ),
    [zoneItems],
  )

  const capacityUnits = zone?.capacityUnits ?? 100
  const occupancyRatio =
    capacityUnits > 0 ? Math.min(usedCapacity / capacityUnits, 1) : 0

  const lowStockItems = zoneItems.filter((i) => i.currentStock <= i.minStockLevel)
  const expiringItems = zoneItems.filter(
    (i) => i.expiryDate && getExpiryStatus(i.expiryDate) !== 'valid',
  )

  if (!zone) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground mb-4">Zone not found.</p>
          <Button variant="outline" onClick={() => navigate('/factory/warehouse/storage')}>
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
      <Button variant="ghost" size="sm" onClick={() => navigate('/factory/warehouse/storage')}>
        <ArrowLeft className="size-4 mr-1" />
        Back to Storage
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CardTitle className="text-xl">{zone.name}</CardTitle>
              <Badge variant="outline">{ZONE_TYPE_LABELS[zone.type] ?? zone.type}</Badge>
            </div>
            <span className="text-sm text-muted-foreground">
              {Math.round(occupancyRatio * 100)}% occupied
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${occupancyColor}`}
                style={{ width: `${Math.round(occupancyRatio * 100)}%` }}
              />
            </div>

            <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
              <div>
                <p className="text-xs text-muted-foreground">Capacity</p>
                <p className="text-lg font-semibold">{capacityUnits} units</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Used</p>
                <p className="text-lg font-semibold">{Math.round(usedCapacity)} units</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Items</p>
                <p className="text-lg font-semibold">{zoneItems.length}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Stock</p>
                <p className="text-lg font-semibold">
                  {zoneItems.reduce((s, i) => s + i.currentStock, 0)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total Items</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{zoneItems.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Low Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${lowStockItems.length > 0 ? 'text-destructive' : ''}`}>
              {lowStockItems.length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Expiring Soon</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${expiringItems.length > 0 ? 'text-amber-500' : ''}`}>
              {expiringItems.length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{zoneTransactions.length}</p>
          </CardContent>
        </Card>
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
                  <TableHead>Name</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Min Level</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Expiry</TableHead>
                  <TableHead>Safety</TableHead>
                  <TableHead className="w-20">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {zoneItems.map((item) => {
                  const isLowStock = item.currentStock <= item.minStockLevel
                  const isHazardous = HAZARDOUS_CATEGORIES.has(item.category)
                  const expiryStatus = item.expiryDate
                    ? getExpiryStatus(item.expiryDate)
                    : null
                  const isExpiringSoon = expiryStatus === 'expiring_soon'

                  return (
                    <TableRow
                      key={item.id}
                      className={`cursor-pointer hover:bg-muted/50 ${isExpiringSoon ? 'border-l-4 border-l-amber-400' : ''}`}
                      onClick={() =>
                        navigate(`/factory/warehouse/inventory/${item.id}/edit`)
                      }
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-1">
                          {isLowStock && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <TriangleAlert className="size-3 text-amber-500 shrink-0" />
                                </TooltipTrigger>
                                <TooltipContent>Low stock</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                          {item.name}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{item.sku}</TableCell>
                      <TableCell>
                        <Badge variant={CATEGORY_VARIANTS[item.category]}>
                          {CATEGORY_LABELS[item.category]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {item.currentStock}
                        {item.unit}
                      </TableCell>
                      <TableCell>
                        {item.minStockLevel}
                        {item.unit}
                      </TableCell>
                      <TableCell>
                        <Badge variant={isLowStock ? 'destructive' : 'secondary'}>
                          {isLowStock ? 'Low Stock' : 'In Stock'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {expiryStatus ? (
                          <Badge variant={EXPIRY_VARIANTS[expiryStatus]}>
                            {EXPIRY_LABELS[expiryStatus]}
                            {item.expiryDate &&
                              ` (${new Date(item.expiryDate).toLocaleDateString()})`}
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {isHazardous && item.sdsUrl && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <a
                                  href={item.sdsUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="inline-flex"
                                >
                                  <ExternalLink className="size-4 text-blue-500" />
                                </a>
                              </TooltipTrigger>
                              <TooltipContent>SDS available</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                        {isHazardous && !item.sdsUrl && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <FileWarning className="size-4 text-orange-500" />
                              </TooltipTrigger>
                              <TooltipContent>Missing SDS</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                        {!isHazardous && (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            navigate(`/factory/warehouse/inventory/${item.id}/edit`)
                          }}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Stock Report — Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {zoneTransactions.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No transactions for items in this zone.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {zoneTransactions.slice(0, 50).map((t) => {
                  const item = itemMap.get(t.itemId)
                  return (
                    <TableRow key={t.id}>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(t.timestamp).toLocaleString()}
                      </TableCell>
                      <TableCell className="font-medium">
                        {item?.name ?? 'Unknown Item'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={TRANSACTION_VARIANTS[t.type]}>
                          {TRANSACTION_LABELS[t.type]}
                        </Badge>
                      </TableCell>
                      <TableCell
                        className={
                          t.type === 'in'
                            ? 'text-green-600 font-semibold'
                            : t.type === 'out'
                              ? 'text-red-600 font-semibold'
                              : 'text-amber-600 font-semibold'
                        }
                      >
                        {t.type === 'in' ? '+' : t.type === 'out' ? '-' : ''}
                        {t.quantity}
                        {item ? item.unit : ''}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {t.reference}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                        {t.notes}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {lowStockItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Low Stock Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Min Level</TableHead>
                  <TableHead>Shortfall</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lowStockItems.map((item) => (
                  <TableRow
                    key={item.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() =>
                      navigate(`/factory/warehouse/inventory/${item.id}/edit`)
                    }
                  >
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="text-muted-foreground">{item.sku}</TableCell>
                    <TableCell className="text-destructive font-semibold">
                      {item.currentStock}
                      {item.unit}
                    </TableCell>
                    <TableCell>
                      {item.minStockLevel}
                      {item.unit}
                    </TableCell>
                    <TableCell className="text-destructive font-semibold">
                      {item.minStockLevel - item.currentStock}
                      {item.unit}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {expiringItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Expiring Items</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Expiry Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Stock</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expiringItems.map((item) => {
                  const status = getExpiryStatus(item.expiryDate)
                  return (
                    <TableRow
                      key={item.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() =>
                        navigate(`/factory/warehouse/inventory/${item.id}/edit`)
                      }
                    >
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {item.sku}
                      </TableCell>
                      <TableCell>
                        {new Date(item.expiryDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant={EXPIRY_VARIANTS[status]}>
                          {EXPIRY_LABELS[status]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {item.currentStock}
                        {item.unit}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
